import glob
import os

import pandas as pd

# clock-speed.csv
# cpu-info.txt
# cpu.csv
# memory.csv
# os-info.txt

script_dir = os.path.dirname(os.path.abspath(__file__))

directory_path = os.path.join(script_dir, "results")

folders = glob.glob(os.path.join(directory_path, "*/"))


all_cpu_dfs = []
all_memory_dfs = []

for folder in folders:
    print(f"Processing folder: {folder}")
    cpu_path = os.path.join(folder, "cpu.csv")
    temp_cpu_df = pd.read_csv(cpu_path)
    memory_path = os.path.join(folder, "memory.csv")
    temp_memory_df = pd.read_csv(cpu_path)
    clock_speed_path = os.path.join(folder, "clock-speed.csv")
    clock_speed_df = pd.read_csv(clock_speed_path)

    clock_speed_mhz = (
        (clock_speed_df.loc[1, "cycles"] - clock_speed_df.loc[0, "cycles"]) * 1000
    ) / (clock_speed_df.loc[1, "time (ns)"] - clock_speed_df.loc[0, "time (ns)"])

    print(clock_speed_mhz)

    # normalize cycle counts
    # group by Language,Total Records,Point
    # Average normalized cycle counts
    # Estimate time for each run
    # Sort by Total Records then by normalized cycle count

    all_cpu_dfs.append(temp_cpu_df)
    all_memory_dfs.append(temp_memory_df)


cpu_df = pd.concat(all_cpu_dfs, ignore_index=True)
memory_df = pd.concat(all_memory_dfs, ignore_index=True)
print(cpu_df)
