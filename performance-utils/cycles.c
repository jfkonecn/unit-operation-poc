#include <stdio.h>
#include <stdint.h>
#include <x86intrin.h>  // Include this header to use __rdtsc()

int main() {
    uint64_t cycles = __rdtsc();

    printf("CPU cycles: %lu\n", cycles);

    return 0;
}

