import glob
import os

import pandas as pd

# clock-speed.csv
# cpu-info.txt
# cpu.csv
# memory.csv
# os-info.txt


def aggregateCpuResults(
    temp_cpu_df: pd.DataFrame, clock_speed_mhz: float
) -> tuple[pd.DataFrame, pd.DataFrame]:
    # Make cycles relative to the first recorded point
    temp_cpu_df["Cycles"] = temp_cpu_df.groupby(
        ["Run Number", "Language", "Total Records", "File Size (B)"]
    )["Cycles"].transform(lambda x: x - x.iloc[0])
    temp_cpu_df = (
        temp_cpu_df.groupby(["Language", "Total Records", "File Size (B)", "Point"])[
            "Cycles"
        ]
        .mean()
        .reset_index()
    ).sort_values(by=["Language", "Total Records", "File Size (B)", "Cycles"])

    temp_cpu_df["Cycles Difference"] = (
        temp_cpu_df.groupby(["Language", "Total Records", "File Size (B)"])["Cycles"]
        .diff()
        .shift(-1)
    )
    whole_run_cpu: pd.DataFrame = (
        temp_cpu_df.groupby(["Language", "Total Records", "File Size (B)"])
        .agg({"Cycles": "max"})
        .reset_index()
    )

    temp_cpu_df = temp_cpu_df[temp_cpu_df["Point"] != "End Program"].reset_index(
        drop=True
    )
    temp_cpu_df["Point"] = temp_cpu_df["Point"].str.replace("Start ", "")
    temp_cpu_df = temp_cpu_df.drop(columns=["Cycles"])
    temp_cpu_df = temp_cpu_df.rename(columns={"Cycles Difference": "Cycles"})

    temp_cpu_df["Clock Speed (MHz)"] = clock_speed_mhz
    temp_cpu_df["Time (ms)"] = temp_cpu_df["Cycles"] / (clock_speed_mhz * 1e3)
    whole_run_cpu["Clock Speed (MHz)"] = clock_speed_mhz
    whole_run_cpu["Time (ms)"] = whole_run_cpu["Cycles"] / (clock_speed_mhz * 1e3)
    return (temp_cpu_df, whole_run_cpu)


def aggregateMemoryResults(
    temp_memory_df: pd.DataFrame,
    temp_cpu_memory_df: pd.DataFrame,
    clock_speed_mhz: float,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    temp_cpu_memory_df["Cycles"] = temp_cpu_memory_df.groupby(
        ["Run Number", "Language", "Total Records", "File Size (B)"]
    )["Cycles"].transform(lambda x: x - x.iloc[0])
    temp_memory_df["Time (ms)"] = 0
    max_cycles_df = (
        temp_cpu_memory_df.groupby(
            ["Run Number", "Language", "Total Records", "File Size (B)"]
        )["Cycles"]
        .max()
        .reset_index()
    )
    max_cycles_df.rename(columns={"Cycles": "Max Cycles"}, inplace=True)

    max_instructions_df = (
        temp_memory_df.groupby(
            ["Run Number", "Language", "Total Records", "File Size (B)"]
        )["Instructions Executed"]
        .max()
        .reset_index()
    )
    max_instructions_df.rename(
        columns={"Instructions Executed": "Max Instructions Executed"}, inplace=True
    )

    temp_memory_df = temp_memory_df.merge(
        max_cycles_df, on=["Run Number", "Total Records", "File Size (B)"], how="left"
    )
    temp_memory_df = temp_memory_df.merge(
        max_instructions_df,
        on=["Run Number", "Total Records", "File Size (B)"],
        how="left",
    )

    temp_memory_df["Cycles"] = (
        temp_memory_df["Instructions Executed"]
        * temp_memory_df["Max Cycles"]
        / temp_memory_df["Max Instructions Executed"]
    ).astype(int)

    temp_cpu_memory_df["Clock Speed (MHz)"] = clock_speed_mhz
    temp_cpu_memory_df["Time (ms)"] = temp_cpu_memory_df["Cycles"] / (
        clock_speed_mhz * 1e3
    )

    temp_memory_df = pd.concat(
        [temp_memory_df, temp_cpu_memory_df], ignore_index=True
    ).sort_values(
        by=["Language", "Total Records", "File Size (B)", "Run Number", "Cycles"]
    )

    for column in [
        "Heap Memory (B)",
        "Extra Heap Memory (B)",
        "Stack Memory (B)",
    ]:
        temp_memory_df[column] = temp_memory_df[column].interpolate(
            method="linear", limit_direction="both"
        )

    temp_memory_df = temp_memory_df[temp_memory_df["Point"].notna()]

    temp_memory_df = (
        temp_memory_df.groupby(["Total Records", "File Size (B)", "Language", "Point"])[
            [
                "Heap Memory (B)",
                "Extra Heap Memory (B)",
                "Stack Memory (B)",
                "Cycles",
            ]
        ]
        .mean()
        .reset_index()
    ).sort_values(by=["Language", "Total Records", "File Size (B)", "Cycles"])

    max_heap_memory_df = temp_memory_df.loc[
        temp_memory_df.groupby(["Total Records", "File Size (B)", "Language"])[
            "Heap Memory (B)"
        ].idxmax()
    ][
        [
            "Total Records",
            "File Size (B)",
            "Language",
            "Heap Memory (B)",
            "Extra Heap Memory (B)",
        ]
    ]

    max_stack_memory_df = temp_memory_df.loc[
        temp_memory_df.groupby(["Total Records", "File Size (B)", "Language"])[
            "Stack Memory (B)"
        ].idxmax()
    ][["Total Records", "File Size (B)", "Language", "Stack Memory (B)"]]

    whole_run_memory = pd.merge(
        max_heap_memory_df,
        max_stack_memory_df,
        on=["Total Records", "File Size (B)", "Language"],
        how="outer",
    )

    whole_run_memory.rename(
        columns={
            "Stack Memory (B)": "Max Stack Memory (B)",
            "Heap Memory (B)": "Max Heap Memory (B)",
            "Extra Heap Memory (B)": "Extra Heap Memory at Max Heap Memory (B)",
        },
        inplace=True,
    )

    whole_run_memory = whole_run_memory.sort_values(
        by=["Language", "Total Records", "File Size (B)"]
    )

    return (temp_memory_df, whole_run_memory)


script_dir = os.path.dirname(os.path.abspath(__file__))


file_sizes_dict = {"File Name": [], "File Size (B)": []}
test_data_path = os.path.join(script_dir, "..", "data-generation", "test-data")
csv_files = glob.glob(os.path.join(test_data_path, "*.csv"))
for csv_file in csv_files:
    file_size = os.path.getsize(csv_file)
    file_sizes_dict["File Name"].append(os.path.basename(csv_file))
    file_sizes_dict["File Size (B)"].append(file_size)
file_sizes_df = pd.DataFrame(file_sizes_dict)

all_unit_ops_cpu_dfs = []
all_whole_run_cpu_dfs = []
all_unit_ops_memory_dfs = []
all_whole_run_memory_dfs = []

directory_path = os.path.join(script_dir, "results")
folders = glob.glob(os.path.join(directory_path, "*/"))
for folder in folders:
    print(f"Processing folder: {folder}")
    cpu_path = os.path.join(folder, "cpu.csv")
    temp_cpu_df = pd.read_csv(cpu_path)
    temp_cpu_df = pd.merge(temp_cpu_df, file_sizes_df, on="File Name", how="left")
    cpu_memory_path = os.path.join(folder, "cpu-memory.csv")
    temp_cpu_memory_df = pd.read_csv(cpu_memory_path)
    temp_cpu_memory_df = pd.merge(
        temp_cpu_memory_df, file_sizes_df, on="File Name", how="left"
    )
    memory_path = os.path.join(folder, "memory.csv")
    temp_memory_df = pd.read_csv(memory_path)
    temp_memory_df = pd.merge(temp_memory_df, file_sizes_df, on="File Name", how="left")
    clock_speed_path = os.path.join(folder, "clock-speed.csv")
    clock_speed_df = pd.read_csv(clock_speed_path)

    clock_speed_mhz: float = (
        (clock_speed_df.loc[1, "cycles"] - clock_speed_df.loc[0, "cycles"]) * 1000
    ) / (clock_speed_df.loc[1, "time (ns)"] - clock_speed_df.loc[0, "time (ns)"])

    (temp_cpu_df, whole_run_cpu) = aggregateCpuResults(temp_cpu_df, clock_speed_mhz)
    (temp_memory_df, whole_run_memory) = aggregateMemoryResults(
        temp_memory_df, temp_cpu_memory_df, clock_speed_mhz
    )

    computer_name_header = "Computer Name"
    computer_name = os.path.basename(os.path.normpath(folder))

    whole_run_cpu[computer_name_header] = computer_name
    temp_cpu_df[computer_name_header] = computer_name
    whole_run_memory[computer_name_header] = computer_name
    temp_memory_df[computer_name_header] = computer_name

    all_whole_run_cpu_dfs.append(whole_run_cpu)
    all_unit_ops_cpu_dfs.append(temp_cpu_df)
    all_whole_run_memory_dfs.append(whole_run_memory)
    all_unit_ops_memory_dfs.append(temp_memory_df)


whole_run_cpu_df = pd.concat(all_whole_run_cpu_dfs, ignore_index=True)
unit_ops_cpu_df = pd.concat(all_unit_ops_cpu_dfs, ignore_index=True)
whole_run_memory_df = pd.concat(all_whole_run_memory_dfs, ignore_index=True)
unit_ops_memory_df = pd.concat(all_unit_ops_memory_dfs, ignore_index=True)


aggregates_path = os.path.join(script_dir, "aggregates")
os.makedirs(aggregates_path, exist_ok=True)
file_path_md = os.path.join(aggregates_path, "graphs.md")
with open(file_path_md, "w"):
    pass


def pivot_and_save(
    title_prefix: str,
    file_path_excel: str,
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    is_unit_op: bool,
):
    output_df = pd.DataFrame()

    output_df[x_axis] = df[x_axis].unique()

    columns = ["Computer Name", "Language"]
    if is_unit_op:
        columns.insert(0, "Point")

    pivot_df = df.pivot_table(
        index=x_axis,
        columns=columns,
        values=y_axis,
        aggfunc="sum",
    )

    if is_unit_op:
        pivot_df.columns = [
            f"{point} {comp} {lang}" for comp, lang, point in pivot_df.columns
        ]
    else:
        pivot_df.columns = [f"{comp} {lang}" for comp, lang in pivot_df.columns]

    output_df = output_df.merge(pivot_df, on=x_axis, how="left")
    with pd.ExcelWriter(file_path_excel, mode="a", engine="openpyxl") as writer:
        # There's warning from pandas if you exceed 31 characters for a sheet name
        output_df.to_excel(writer, sheet_name=f"{x_axis}-{y_axis}"[:31], index=False)
    # <scatter-plot plot-title="Total Run CPU Cycles" y-axis-scale="logarithmic" x-axis-label="Total Records" y-axis-label="CPU Cycles" class="w-full">
    # <scatter-plot-series label="rpi-3_c">
    #     <scatter-plot-point x="10" y="13581236.8"></scatter-plot-point>
    #     <scatter-plot-point x="1000" y="22013586.6"></scatter-plot-point>
    #     <scatter-plot-point x="5000" y="53573896.1"></scatter-plot-point>
    #     <scatter-plot-point x="10000" y="100458696.2"></scatter-plot-point>
    #     <scatter-plot-point x="50000" y="654577505.8"></scatter-plot-point>
    #     <scatter-plot-point x="100000" y="1789814999.6"></scatter-plot-point>
    # </scatter-plot-series>

    # <scatter-plot-series label="rpi-3_csharp">
    #     <scatter-plot-point x="10" y="806096827.2"></scatter-plot-point>
    #     <scatter-plot-point x="1000" y="481710115.7"></scatter-plot-point>
    #     <scatter-plot-point x="5000" y="810195123.5"></scatter-plot-point>
    #     <scatter-plot-point x="10000" y="1160603648.8"></scatter-plot-point>
    #     <scatter-plot-point x="50000" y="4954400141.3"></scatter-plot-point>
    #     <scatter-plot-point x="100000" y="9449882676.2"></scatter-plot-point>
    # </scatter-plot-series>

    # <scatter-plot-series label="ubuntu-i9_c">
    #     <scatter-plot-point x="10" y="7287263.4"></scatter-plot-point>
    #     <scatter-plot-point x="1000" y="9471606.7"></scatter-plot-point>
    #     <scatter-plot-point x="5000" y="17514109.4"></scatter-plot-point>
    #     <scatter-plot-point x="10000" y="27819539.2"></scatter-plot-point>
    #     <scatter-plot-point x="50000" y="180018824.2"></scatter-plot-point>
    #     <scatter-plot-point x="100000" y="305312218.4"></scatter-plot-point>
    # </scatter-plot-series>

    # <scatter-plot-series label="ubuntu-i9_csharp">
    #     <scatter-plot-point x="10" y="49157529.7"></scatter-plot-point>
    #     <scatter-plot-point x="1000" y="55182062.8"></scatter-plot-point>
    #     <scatter-plot-point x="5000" y="73817020.3"></scatter-plot-point>
    #     <scatter-plot-point x="10000" y="112478675.4"></scatter-plot-point>
    #     <scatter-plot-point x="50000" y="346633098.8"></scatter-plot-point>
    #     <scatter-plot-point x="100000" y="746968312.3"></scatter-plot-point>
    # </scatter-plot-series>
    # </scatter-plot>
    with open(file_path_md, "a") as md_file:
        _ = md_file.write(
            f"""<scatter-plot
    plot-title="{title_prefix} {x_axis} vs {y_axis}"
    y-axis-scale="logarithmic"
    x-axis-label="{x_axis}"
    y-axis-label="{y_axis}"
    class="w-full>
"""
        )
        for series_name in pivot_df.columns:
            _ = md_file.write(f'<scatter-plot-series label="{series_name}">\n')
            series = pivot_df[series_name]
            for x_value, y_value in series.items():
                _ = md_file.write(
                    f'<scatter-plot-point x="{x_value}" y="{y_value}"></scatter-plot-point>\n'
                )
            _ = md_file.write("</scatter-plot-series>\n")
        _ = md_file.write("</scatter-plot>")
        _ = md_file.write("\n\n")

        # | Total Records | rpi-3_c      | rpi-3_csharp | ubuntu-i9_c | ubuntu-i9_csharp |
        # | ------------- | ------------ | ------------ | ----------- | ---------------- |
        # | 10            | 13581236.8   | 806096827.2  | 7287263.4   | 49157529.7       |
        # | 1000          | 22013586.6   | 481710115.7  | 9471606.7   | 55182062.8       |
        # | 5000          | 53573896.1   | 810195123.5  | 17514109.4  | 73817020.3       |
        # | 10000         | 100458696.2  | 1160603648.8 | 27819539.2  | 112478675.4      |
        # | 50000         | 654577505.8  | 4954400141.3 | 180018824.2 | 346633098.8      |
        # | 100000        | 1789814999.6 | 9449882676.2 | 305312218.4 | 746968312.3      |

        _ = md_file.write(f"| {x_axis} |")
        for series_name in pivot_df.columns:
            _ = md_file.write(f" {series_name} |")
        _ = md_file.write("\n")

        _ = md_file.write("| ------------- |")
        for series_name in pivot_df.columns:
            _ = md_file.write(" ------------- |")
        _ = md_file.write("\n")

        for x_value, row in pivot_df.iterrows():
            _ = md_file.write(f"| {x_value} |")
            for _, y_value in row.items():
                _ = md_file.write(f" {y_value} |")
            _ = md_file.write("\n")
        _ = md_file.write("\n\n")


whole_run_cpu_path = os.path.join(aggregates_path, "whole_run_cpu.xlsx")
unit_ops_cpu_path = os.path.join(aggregates_path, "unit_ops_cpu.xlsx")
whole_run_memory_path = os.path.join(aggregates_path, "whole_run_memory.xlsx")
unit_ops_memory_path = os.path.join(aggregates_path, "unit_ops_memory.xlsx")

whole_run_cpu_df.to_excel(whole_run_cpu_path, sheet_name="base", index=False)
unit_ops_cpu_df.to_excel(unit_ops_cpu_path, sheet_name="base", index=False)
whole_run_memory_df.to_excel(whole_run_memory_path, sheet_name="base", index=False)
unit_ops_memory_df.to_excel(unit_ops_memory_path, sheet_name="base", index=False)

pivot_and_save(
    "Whole Run", whole_run_cpu_path, whole_run_cpu_df, "Total Records", "Cycles", False
)
pivot_and_save(
    "Whole Run", whole_run_cpu_path, whole_run_cpu_df, "File Size (B)", "Cycles", False
)

pivot_and_save(
    "Unit Operations",
    unit_ops_cpu_path,
    unit_ops_cpu_df,
    "Total Records",
    "Cycles",
    True,
)
pivot_and_save(
    "Unit Operations",
    unit_ops_cpu_path,
    unit_ops_cpu_df,
    "File Size (B)",
    "Cycles",
    True,
)

pivot_and_save(
    "Whole Run",
    whole_run_memory_path,
    whole_run_memory_df,
    "Total Records",
    "Max Heap Memory (B)",
    False,
)
