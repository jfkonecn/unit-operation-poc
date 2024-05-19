import os
import time
import tracemalloc
from typing import Any, Callable

from main import get_one_row_at_a_time, in_memory_join, query_all_and_map


def display_top(snapshot, key_type="lineno"):
    snapshot = snapshot.filter_traces(
        (
            tracemalloc.Filter(False, "<frozen importlib._bootstrap>"),
            tracemalloc.Filter(False, "<unknown>"),
            tracemalloc.Filter(False, "*test_main*"),
        )
    )
    stats = snapshot.statistics(key_type)

    total = sum(stat.size for stat in stats)
    print("Total allocated size: %.1f KiB" % (total / 1024))
    return total


def trace_and_profile(f: Callable[[int, int], Any]):
    # pageSizes = [1, 100, 1_000, 10_000]
    pageSizes = [1, 100]

    functionName = f.__name__
    saveDir = os.path.join(
        os.getcwd(), "..", "svg-builder", "svgs", "scatter-plots", functionName
    )
    os.makedirs(saveDir, exist_ok=True)

    memoryCsvPath = os.path.join(saveDir, f"{functionName}_memory.csv")
    runtimeCsvPath = os.path.join(saveDir, f"{functionName}_runtime.csv")

    with open(memoryCsvPath, "w") as memoryCsv, open(runtimeCsvPath, "w") as runtimeCsv:
        memoryCsv.write("pageSize,memoryAllocations")
        runtimeCsv.write("pageSize,totalRunTime")
        for pageSize in pageSizes:
            startTime = time.time()
            f(1, pageSize)
            endTime = time.time()
            totalRuntime = endTime - startTime
            tracemalloc.start()
            f(1, pageSize)
            snapshot = tracemalloc.take_snapshot()
            tracemalloc.stop()
            totalMemory = display_top(snapshot)
            memoryCsv.write(f"\n{pageSize},{totalMemory}")
            runtimeCsv.write(f"\n{pageSize},{totalRuntime: .2f}")


trace_and_profile(query_all_and_map)


trace_and_profile(get_one_row_at_a_time)


trace_and_profile(in_memory_join)
