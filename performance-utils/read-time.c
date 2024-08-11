#include <stdint.h>
#include <stdio.h>
#include <sys/time.h>
#include <time.h>
#include <x86intrin.h>

uint64_t readCpuTimer() { return __rdtsc(); }

int main() {
  struct timespec now;
  clock_gettime(CLOCK_MONOTONIC, &now);
  uint64_t time = now.tv_sec * 1e9 + now.tv_nsec;
  uint64_t cycles = readCpuTimer();
  printf("%lu,%lu\n", time, cycles);
  return 0;
}
