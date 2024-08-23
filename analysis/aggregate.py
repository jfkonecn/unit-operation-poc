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
    temp_cpu_df["Cycles"] = temp_cpu_df.groupby(["Run Number", "Total Records"])[
        "Cycles"
    ].transform(lambda x: x - x.iloc[0])
    temp_cpu_df = (
        temp_cpu_df.groupby(["Language", "Total Records", "Point"])["Cycles"]
        .mean()
        .reset_index()
    ).sort_values(by=["Language", "Total Records", "Cycles"])

    temp_cpu_df["Cycles Difference"] = (
        temp_cpu_df.groupby(["Language", "Total Records"])["Cycles"].diff().shift(-1)
    )
    whole_run_cpu: pd.DataFrame = (
        temp_cpu_df.groupby(["Language", "Total Records"])
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
        ["Run Number", "Total Records"]
    )["Cycles"].transform(lambda x: x - x.iloc[0])
    temp_memory_df["Time (ms)"] = 0
    max_cycles_df = (
        temp_cpu_memory_df.groupby(["Run Number", "Total Records"])["Cycles"]
        .max()
        .reset_index()
    )
    max_cycles_df.rename(columns={"Cycles": "Max Cycles"}, inplace=True)

    max_instructions_df = (
        temp_memory_df.groupby(["Run Number", "Total Records"])["Instructions Executed"]
        .max()
        .reset_index()
    )
    max_instructions_df.rename(
        columns={"Instructions Executed": "Max Instructions Executed"}, inplace=True
    )

    temp_memory_df = temp_memory_df.merge(
        max_cycles_df, on=["Run Number", "Total Records"], how="left"
    )
    temp_memory_df = temp_memory_df.merge(
        max_instructions_df, on=["Run Number", "Total Records"], how="left"
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
    ).sort_values(by=["Language", "Total Records", "Run Number", "Cycles"])

    temp_memory_df = temp_memory_df.interpolate(method="linear", limit_direction="both")
    temp_memory_df = temp_memory_df[temp_memory_df["Point"].notna()]

    columns_of_interest = [
        "Heap Memory (B)",
        "Extra Heap Memory (B)",
        "Stack Memory (B)",
        "Cycles",
    ]
    temp_memory_df = (
        temp_memory_df.groupby(["Total Records", "Language", "Point"])[
            columns_of_interest
        ]
        .mean()
        .reset_index()
    ).sort_values(by=["Language", "Total Records", "Cycles"])

    max_heap_memory_df = temp_memory_df.loc[
        temp_memory_df.groupby(["Total Records", "Language"])[
            "Heap Memory (B)"
        ].idxmax()
    ][["Total Records", "Language", "Heap Memory (B)", "Extra Heap Memory (B)"]]

    max_stack_memory_df = temp_memory_df.loc[
        temp_memory_df.groupby(["Total Records", "Language"])[
            "Stack Memory (B)"
        ].idxmax()
    ][["Total Records", "Language", "Stack Memory (B)"]]

    whole_run_memory = pd.merge(
        max_heap_memory_df,
        max_stack_memory_df,
        on=["Total Records", "Language"],
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

    return (temp_memory_df, whole_run_memory)


script_dir = os.path.dirname(os.path.abspath(__file__))

directory_path = os.path.join(script_dir, "results")

folders = glob.glob(os.path.join(directory_path, "*/"))


all_unit_ops_cpu_dfs = []
all_whole_run_cpu_dfs = []
all_unit_ops_memory_dfs = []
all_whole_run_memory_dfs = []

for folder in folders:
    print(f"Processing folder: {folder}")
    cpu_path = os.path.join(folder, "cpu.csv")
    temp_cpu_df = pd.read_csv(cpu_path)
    cpu_memory_path = os.path.join(folder, "cpu-memory.csv")
    temp_cpu_memory_df = pd.read_csv(cpu_memory_path)
    memory_path = os.path.join(folder, "memory.csv")
    temp_memory_df = pd.read_csv(memory_path)
    clock_speed_path = os.path.join(folder, "clock-speed.csv")
    clock_speed_df = pd.read_csv(clock_speed_path)

    clock_speed_mhz: float = (
        (clock_speed_df.loc[1, "cycles"] - clock_speed_df.loc[0, "cycles"]) * 1000
    ) / (clock_speed_df.loc[1, "time (ns)"] - clock_speed_df.loc[0, "time (ns)"])

    (temp_cpu_df, whole_run_cpu) = aggregateCpuResults(temp_cpu_df, clock_speed_mhz)
    (temp_memory_df, whole_run_memory) = aggregateMemoryResults(
        temp_memory_df, temp_cpu_memory_df, clock_speed_mhz
    )

    all_whole_run_cpu_dfs.append(whole_run_cpu)
    all_unit_ops_cpu_dfs.append(temp_cpu_df)
    all_whole_run_memory_dfs.append(whole_run_memory)
    all_unit_ops_memory_dfs.append(temp_memory_df)


whole_run_cpu_df = pd.concat(all_whole_run_cpu_dfs, ignore_index=True)
unit_ops_cpu_df = pd.concat(all_unit_ops_cpu_dfs, ignore_index=True)
whole_run_memory_df = pd.concat(all_whole_run_memory_dfs, ignore_index=True)
unit_ops_memory_df = pd.concat(all_unit_ops_memory_dfs, ignore_index=True)
# print(whole_run_cpu_df.to_string())
# print(unit_ops_cpu_df.to_string())
# print(memory_df.to_string())


aggregates_path = os.path.join(script_dir, "aggregates")
os.makedirs(aggregates_path, exist_ok=True)

whole_run_cpu_path = os.path.join(aggregates_path, "whole_run_cpu.xlsx")
unit_ops_cpu_path = os.path.join(aggregates_path, "unit_ops_cpu.xlsx")
whole_run_memory_path = os.path.join(aggregates_path, "whole_run_memory.xlsx")
unit_ops_memory_path = os.path.join(aggregates_path, "unit_ops_memory.xlsx")

whole_run_cpu_df.to_excel(whole_run_cpu_path, index=False)
unit_ops_cpu_df.to_excel(unit_ops_cpu_path, index=False)
whole_run_memory_df.to_excel(whole_run_memory_path, index=False)
unit_ops_memory_df.to_excel(unit_ops_memory_path, index=False)
