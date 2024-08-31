#include <stdint.h>
#include <stdio.h>
#include "utils.h"


int main(int argc, char *argv[]) {
  if (argc < 2) {
    printf("Usage: %s <name>\n", argv[0]);
    return 1;
  }

  char *name = argv[1];
  uint64_t cycles = readCpuTimer();

  printf("%s,%lu\n", name, cycles);

  return 0;
}
