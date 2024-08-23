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
    temp_cpu_df["Cycles"] = temp_cpu_df.groupby(["Run Number", "Total Records"])[
        "Cycles"
    ].transform(lambda x: x - x.iloc[0])
    temp_cpu_df["Cycles"]
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


script_dir = os.path.dirname(os.path.abspath(__file__))

directory_path = os.path.join(script_dir, "results")

folders = glob.glob(os.path.join(directory_path, "*/"))


all_unit_ops_cpu_dfs = []
all_whole_run_cpu_dfs = []
all_memory_dfs = []

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
    (temp_cpu_memory_df, whole_run_cpu_memory) = aggregateCpuResults(
        temp_cpu_memory_df, clock_speed_mhz
    )
    print(temp_cpu_memory_df)
    print(whole_run_cpu_memory)
    # temp_memory_df = (
    # temp_memory_df.groupby(["Language", "Total Records", "Point"])["Cycles"]
    # .mean()
    # .reset_index()
    # ).sort_values(by=["Language", "Total Records", "Cycles"])
    temp_memory_df["Clock Speed (MHz)"] = clock_speed_mhz
    temp_memory_df["Cycles"] = (
        (clock_speed_mhz * 1e3) * temp_memory_df["Time (ms)"]
    ).astype(int)
    temp_memory_df.replace([float("inf"), float("-inf")], 0, inplace=True)

    all_whole_run_cpu_dfs.append(whole_run_cpu)
    all_unit_ops_cpu_dfs.append(temp_cpu_df)
    all_memory_dfs.append(temp_memory_df)


whole_run_cpu_df = pd.concat(all_whole_run_cpu_dfs, ignore_index=True)
unit_ops_cpu_df = pd.concat(all_unit_ops_cpu_dfs, ignore_index=True)
memory_df = pd.concat(all_memory_dfs, ignore_index=True)
# print(whole_run_cpu_df.to_string())
# print(unit_ops_cpu_df.to_string())
# print(memory_df.to_string())


aggregates_path = os.path.join(script_dir, "aggregates")
os.makedirs(aggregates_path, exist_ok=True)

whole_run_cpu_path = os.path.join(aggregates_path, "whole_run_cpu.xlsx")
unit_ops_cpu_path = os.path.join(aggregates_path, "unit_ops_cpu.xlsx")
memory_path = os.path.join(aggregates_path, "memory.xlsx")

whole_run_cpu_df.to_excel(whole_run_cpu_path, index=False)
unit_ops_cpu_df.to_excel(unit_ops_cpu_path, index=False)
memory_df.to_excel(memory_path, index=False)
