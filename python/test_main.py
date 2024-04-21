import cProfile
import pstats

import pytest
from main import get_one_row_at_a_time, in_memory_join, query_all_and_map


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_query_all_and_map(page: int, page_size: int):
    with cProfile.Profile() as profile:
        query_all_and_map(page, page_size)

    results = pstats.Stats(profile)
    # results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_get_one_row_at_a_time(page: int, page_size: int):
    with cProfile.Profile() as profile:
        get_one_row_at_a_time(page, page_size)

    results = pstats.Stats(profile)
    # results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()


@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_in_memory_join(page: int, page_size: int):
    with cProfile.Profile() as profile:
        in_memory_join(page, page_size)

    results = pstats.Stats(profile)
    # results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()
