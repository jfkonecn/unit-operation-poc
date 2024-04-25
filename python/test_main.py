import cProfile
import linecache
import os
import pstats
import tracemalloc
from typing import Callable

import pytest
from main import get_one_row_at_a_time, in_memory_join, query_all_and_map
from tabulate import tabulate

# https://docs.python.org/3/library/tracemalloc.html
# https://www.fugue.co/blog/diagnosing-and-fixing-memory-leaks-in-python.html


def display_top(snapshot, key_type="lineno"):
    snapshot = snapshot.filter_traces(
        (
            tracemalloc.Filter(False, "<frozen importlib._bootstrap>"),
            tracemalloc.Filter(False, "<unknown>"),
            tracemalloc.Filter(False, "*test_main*"),
        )
    )
    stats = snapshot.statistics(key_type)

    headers = ["Filename:Line Number", "Function", "Memory KiB"]
    rows = []

    for index, stat in enumerate(stats, 1):
        frame = stat.traceback[0]
        row = []

        # replace "/path/to/module/file.py" with "module/file.py"
        filename = os.sep.join(frame.filename.split(os.sep)[-2:])
        row.append(f"{filename}:{frame.lineno}")

        line = linecache.getline(frame.filename, frame.lineno).strip()
        row.append(line)

        row.append(stat.size / 1024)
        rows.append(row)

    print(tabulate(rows, headers=headers))
    total = sum(stat.size for stat in stats)
    print("Total allocated size: %.1f KiB" % (total / 1024))


def trace_and_profile(f: Callable):
    with cProfile.Profile() as profile:
        f()
    results = pstats.Stats(profile)
    results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()
    tracemalloc.start()
    f()
    snapshot = tracemalloc.take_snapshot()
    tracemalloc.stop()
    display_top(snapshot)


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_query_all_and_map(page: int, page_size: int):
    trace_and_profile(lambda: query_all_and_map(page, page_size))


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_get_one_row_at_a_time(page: int, page_size: int):
    with cProfile.Profile() as profile:
        get_one_row_at_a_time(page, page_size)

    results = pstats.Stats(profile)
    results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_in_memory_join(page: int, page_size: int):
    with cProfile.Profile() as profile:
        in_memory_join(page, page_size)

    results = pstats.Stats(profile)
    results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()
