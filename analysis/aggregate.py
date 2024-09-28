import glob
import itertools
import os

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split


def fixLanguages(df: pd.DataFrame):
    df["Language"] = df["Language"].replace("csharp", "c#")


def aggregateCpuResults(
    temp_cpu_df: pd.DataFrame, clock_speed_mhz: float
) -> tuple[pd.DataFrame, pd.DataFrame]:
    fixLanguages(temp_cpu_df)
    # Make cycles relative to the first recorded point
    temp_cpu_df["Cycles"] = temp_cpu_df.groupby(
        ["Run Number", "Language", "Total Records", "File Size (B)"]
    )["Cycles"].transform(lambda x: x - x.iloc[0])
    temp_cpu_df = (
        temp_cpu_df.groupby(["Language", "Total Records", "File Size (B)", "Point"])[
            "Cycles"
        ]
        .mean()
        .round()
        .astype(int)
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

    temp_cpu_df["Cycles Difference"] = (
        temp_cpu_df["Cycles Difference"].round().astype(int)
    )
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
    fixLanguages(temp_memory_df)
    fixLanguages(temp_cpu_memory_df)
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
        (
            temp_memory_df["Instructions Executed"]
            * temp_memory_df["Max Cycles"]
            / temp_memory_df["Max Instructions Executed"]
        )
        .round()
        .astype(int)
    )

    temp_cpu_memory_df["Clock Speed (MHz)"] = clock_speed_mhz
    temp_cpu_memory_df["Time (ms)"] = (
        (temp_cpu_memory_df["Cycles"] / (clock_speed_mhz * 1e3)).round().astype(int)
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


cpu_run_cost_dir = os.path.join(script_dir, "cpu-run-cost")
cost_df = pd.read_csv(os.path.join(cpu_run_cost_dir, "run-mapping.csv"))
cost_df["Dollars Per Hour"] = (cost_df["Watts"] / 1000) * cost_df["$/kWh"]


def join_cost_df(df: pd.DataFrame):
    df = pd.merge(cost_df, df, on="Computer Name", how="inner")

    df["Bytes Per Cycle"] = df["File Size (B)"] / df["Cycles"]
    df["Gigabytes Per Hour"] = (df["Bytes Per Cycle"] * df["Speed (GHz)"] * 3600).round(
        3
    )
    df["Gigabytes Per Dollar"] = (
        df["Gigabytes Per Hour"] / df["Dollars Per Hour"]
    ).round(3)
    df["Time (ms)"] = (df["Cycles"] / (1e6 * df["Speed (GHz)"])).round(1)
    return df


file_sizes_dict = {"File Name": [], "File Size (B)": []}
test_data_path = os.path.join(script_dir, "..", "data-generation", "test-data")
test_data_csv_files = glob.glob(os.path.join(test_data_path, "*.csv"))
for test_data_csv_file in test_data_csv_files:
    file_size = os.path.getsize(test_data_csv_file)
    file_sizes_dict["File Name"].append(os.path.basename(test_data_csv_file))
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


def saveAsMarkdown(
    df: pd.DataFrame,
    title_prefix: str,
    x_axis: str,
    y_axis: str,
    y_scale: str,
    file_path_md: str,
):
    with open(file_path_md, "a") as md_file:
        _ = md_file.write(
            f"""<scatter-plot
    plot-title="{title_prefix} {x_axis} vs {y_axis}"
    y-axis-scale="{y_scale}"
    x-axis-label="{x_axis}"
    y-axis-label="{y_axis}"
    class="w-full">
"""
        )
        for series_name in df.columns:
            _ = md_file.write(f'<scatter-plot-series label="{series_name}">\n')
            series = df[series_name]
            for x_value, y_value in series.items():
                _ = md_file.write(
                    f'<scatter-plot-point x="{x_value}" y="{y_value}"></scatter-plot-point>\n'
                )
            _ = md_file.write("</scatter-plot-series>\n")
        _ = md_file.write("</scatter-plot>")
        _ = md_file.write("\n\n")

        _ = md_file.write(f"| {x_axis} |")
        for series_name in df.columns:
            _ = md_file.write(f" {series_name} |")
        _ = md_file.write("\n")

        _ = md_file.write("| ------------- |")
        for series_name in df.columns:
            _ = md_file.write(" ------------- |")
        _ = md_file.write("\n")

        for x_value, row in df.iterrows():
            _ = md_file.write(f"| {x_value} |")
            for _, y_value in row.items():
                _ = md_file.write(f" {y_value} |")
            _ = md_file.write("\n")
        _ = md_file.write("\n\n")

        df.reset_index(inplace=True)
        # df_to_model: pd.DataFrame = df[::3]
        # df_to_predict: pd.DataFrame = df.drop(df_to_model.index)
        df_to_model, df_to_predict = train_test_split(
            df, test_size=0.25, random_state=42
        )
        x_to_model = df_to_model.iloc[:, 0].values.reshape(-1, 1)

        md_columns = [f"Predicted {y_axis}", f"Actual {y_axis}", "% Error"]

        for idx, series_name in enumerate(df.columns):
            if idx == 0:
                continue
            y_to_model = df_to_model[series_name].values
            model = LinearRegression()
            model = model.fit(x_to_model, y_to_model)
            slope = model.coef_[0]
            intercept = model.intercept_
            r_squared = model.score(x_to_model, y_to_model)

            _ = md_file.write(
                f"{series_name}: y = {slope:.2f}x + {intercept:.2f}, R^2 = {r_squared:.4f}\n\n"
            )

            _ = md_file.write(f"| {x_axis} |")
            for column_name in md_columns:
                _ = md_file.write(f" {column_name} |")
            _ = md_file.write("\n")

            _ = md_file.write("| ------------- |")
            for _ in md_columns:
                _ = md_file.write(" ------------- |")
            _ = md_file.write("\n")

            for _, row in df_to_predict.iterrows():
                actual_x = row[x_axis]
                actual_y = row[series_name]

                predicted_y = model.predict([[actual_x]])[0]

                percent_error = abs(actual_y - predicted_y) / actual_y * 100

                _ = md_file.write(
                    f"| {actual_x} | {predicted_y:.2f} | {actual_y} | {percent_error:.2f} |\n"
                )

            _ = md_file.write("\n\n")


def saveAllPivotPermutationsAsMarkDown(
    pivot_df: pd.DataFrame,
    title_prefix: str,
    x_axis: str,
    y_axis: str,
    y_scale: str,
    separator: str,
    file_path_md: str,
):
    with open(file_path_md, "w"):
        pass
    column_names = pivot_df.columns.to_list()
    grouped = {}
    for column_name in column_names:
        combo_names = column_name.split(separator)
        permutations_list = [list(perm) for perm in itertools.permutations(combo_names)]
        for arr in permutations_list:
            key = separator.join(arr[:-1])
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(column_name)
    for constant_columns, value in grouped.items():
        md_df: pd.DataFrame = pivot_df[value]
        keys = constant_columns.split(separator)
        for key in keys:
            md_df.columns = md_df.columns.str.replace(key, "")
        extra_prefix = " and ".join(keys)
        md_df.columns = md_df.columns.str.replace(separator, "")
        saveAsMarkdown(
            md_df,
            f"{title_prefix} {extra_prefix}",
            x_axis,
            y_axis,
            y_scale,
            file_path_md,
        )


def pivot_and_save_base(
    title_prefix: str,
    file_path_excel: str,
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    is_unit_op: bool,
    md_file_prefix: str,
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

    separator = ";;"

    if is_unit_op:
        pivot_df.columns = [
            f"{point}{separator}{comp}{separator}{lang}"
            for point, comp, lang in pivot_df.columns
        ]
    else:
        pivot_df.columns = [
            f"{comp}{separator}{lang}" for comp, lang in pivot_df.columns
        ]

    output_df = output_df.merge(pivot_df, on=x_axis, how="left")
    with pd.ExcelWriter(file_path_excel, mode="a", engine="openpyxl") as writer:
        # There's warning from pandas if you exceed 31 characters for a sheet name
        output_df.to_excel(writer, sheet_name=f"{x_axis}-{y_axis}"[:31], index=False)

    file_path_md = os.path.join(
        aggregates_path,
        f"{md_file_prefix}_{title_prefix.replace(" ", "_")}_{"_".join([col.replace(" ", "_") for col in columns])}_base.md",
    )
    saveAllPivotPermutationsAsMarkDown(
        pivot_df, title_prefix, x_axis, y_axis, "logarithmic", separator, file_path_md
    )


def pivot_and_cost(
    title_prefix: str,
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    is_unit_op: bool,
    md_file_prefix: str,
):
    output_df = pd.DataFrame()

    output_df[x_axis] = df[x_axis].unique()

    columns = ["Processor@Speed", "Language"]
    if is_unit_op:
        columns.insert(0, "Point")

    pivot_df = df.pivot_table(
        index=x_axis,
        columns=columns,
        values=y_axis,
        aggfunc="sum",
    )

    separator = ";;"

    if is_unit_op:
        pivot_df.columns = [
            f"{point}{separator}{comp}{separator}{lang}"
            for comp, lang, point in pivot_df.columns
        ]
    else:
        pivot_df.columns = [
            f"{comp}{separator}{lang}" for comp, lang in pivot_df.columns
        ]

    file_path_md = os.path.join(
        aggregates_path,
        f"{md_file_prefix}_{title_prefix.replace(" ", "_")}_{"_".join([col.replace(" ", "_") for col in columns])}_cost.md",
    )

    saveAllPivotPermutationsAsMarkDown(
        pivot_df, title_prefix, x_axis, y_axis, "linear", separator, file_path_md
    )


whole_run_cpu_path = os.path.join(aggregates_path, "whole_run_cpu.xlsx")
unit_ops_cpu_path = os.path.join(aggregates_path, "unit_ops_cpu.xlsx")
whole_run_memory_path = os.path.join(aggregates_path, "whole_run_memory.xlsx")
unit_ops_memory_path = os.path.join(aggregates_path, "unit_ops_memory.xlsx")

whole_run_cpu_df.to_excel(whole_run_cpu_path, sheet_name="base", index=False)
unit_ops_cpu_df.to_excel(unit_ops_cpu_path, sheet_name="base", index=False)
whole_run_memory_df.to_excel(whole_run_memory_path, sheet_name="base", index=False)
unit_ops_memory_df.to_excel(unit_ops_memory_path, sheet_name="base", index=False)

index = 0
index += 1
pivot_and_save_base(
    "Whole Run",
    whole_run_cpu_path,
    whole_run_cpu_df,
    "Total Records",
    "Cycles",
    False,
    str(index),
)

index += 1
pivot_and_save_base(
    "Whole Run Cycles",
    whole_run_cpu_path,
    whole_run_cpu_df,
    "File Size (B)",
    "Cycles",
    False,
    str(index),
)

index += 1
pivot_and_save_base(
    "Unit Operations Cycles",
    unit_ops_cpu_path,
    unit_ops_cpu_df,
    "Total Records",
    "Cycles",
    True,
    str(index),
)

index += 1
pivot_and_save_base(
    "Unit Operations File",
    unit_ops_cpu_path,
    unit_ops_cpu_df,
    "File Size (B)",
    "Cycles",
    True,
    str(index),
)

index += 1
pivot_and_save_base(
    "Whole Run Memory",
    whole_run_memory_path,
    whole_run_memory_df,
    "Total Records",
    "Max Heap Memory (B)",
    False,
    str(index),
)

cost_whole_run_cpu_df = join_cost_df(whole_run_cpu_df)

index += 1
pivot_and_cost(
    "Whole Run Dollars",
    cost_whole_run_cpu_df,
    "Total Records",
    "Gigabytes Per Dollar",
    False,
    str(index),
)

index += 1
pivot_and_cost(
    "Whole Run Time",
    cost_whole_run_cpu_df,
    "Total Records",
    "Time (ms)",
    False,
    str(index),
)
