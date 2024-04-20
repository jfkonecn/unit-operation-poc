import cProfile
import pstats

import pytest
from main import query_data


# Suppose we have a function to test
def add(a, b):
    return a + b


# Using pytest's parametrize decorator to test multiple scenarios
@pytest.mark.parametrize(
    "page, page_size",
    [(1, 1_000), (1, 10_000), (1, 100_000), (1, 1_000_000)],
)
def test_add(page: int, page_size: int):
    with cProfile.Profile() as profile:
        query_data(page, page_size)

    results = pstats.Stats(profile)
    # results.sort_stats(pstats.SortKey.TIME)
    results.print_stats()
