import cProfile
import linecache
import os
import pstats
import tracemalloc

import pytest
from main import get_one_row_at_a_time, in_memory_join, query_all_and_map

# https://docs.python.org/3/library/tracemalloc.html
# https://www.fugue.co/blog/diagnosing-and-fixing-memory-leaks-in-python.html


def display_top(snapshot, key_type="lineno", limit=3):
    snapshot = snapshot.filter_traces(
        (
            tracemalloc.Filter(False, "<frozen importlib._bootstrap>"),
            tracemalloc.Filter(False, "<unknown>"),
            tracemalloc.Filter(False, "*test_main*"),
        )
    )
    top_stats = snapshot.statistics(key_type)

    print("Top %s lines" % limit)
    for index, stat in enumerate(top_stats[:limit], 1):
        frame = stat.traceback[0]
        # replace "/path/to/module/file.py" with "module/file.py"
        filename = os.sep.join(frame.filename.split(os.sep)[-2:])
        print(
            "#%s: %s:%s: %.1f KiB" % (index, filename, frame.lineno, stat.size / 1024)
        )
        line = linecache.getline(frame.filename, frame.lineno).strip()
        if line:
            print("    %s" % line)

    other = top_stats[limit:]
    if other:
        size = sum(stat.size for stat in other)
        print("%s other: %.1f KiB" % (len(other), size / 1024))
    total = sum(stat.size for stat in top_stats)
    print("Total allocated size: %.1f KiB" % (total / 1024))


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_query_all_and_map(page: int, page_size: int):
    tracemalloc.start()
    with cProfile.Profile() as profile:
        query_all_and_map(page, page_size)

    snapshot = tracemalloc.take_snapshot()
    results = pstats.Stats(profile)
    results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()
    display_top(snapshot)
    for temp in snapshot.statistics("traceback"):
        for line in temp.traceback.format():
            print(line)
    tracemalloc.stop()


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
