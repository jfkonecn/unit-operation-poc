#include <stdio.h>
#include <stdint.h>
#include <x86intrin.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("Usage: %s <name>\n", argv[0]);
        return 1;
    }

    char *name = argv[1];
    uint64_t cycles = __rdtsc();

    printf("%s,%lu\n", name, cycles);

    return 0;
}
