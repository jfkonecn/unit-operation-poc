uint64_t readCpuTimer() { 
#if defined(__i386__)
  int64_t ret;
  __asm__ volatile("rdtsc" : "=A"(ret));
  return ret;
#elif defined(__x86_64__) || defined(__amd64__)
  uint64_t low, high;
  __asm__ volatile("rdtsc" : "=a"(low), "=d"(high));
  return (high << 32) | low;
#elif defined(__ARM_ARCH)
    uint64_t val;
    // https://stackoverflow.com/questions/40454157/is-there-an-equivalent-instruction-to-rdtsc-in-arm

    /*
     * According to ARM DDI 0487F.c, from Armv8.0 to Armv8.5 inclusive, the
     * system counter is at least 56 bits wide; from Armv8.6, the counter
     * must be 64 bits wide.  So the system counter could be less than 64
     * bits wide and it is attributed with the flag 'cap_user_time_short'
     * is true.
     */
    // asm volatile("mrs %0, cntvct_el0" : "=r" (val));
    asm volatile("mrs %0, pmccntr_el0" : "=r"(val));
    // asm volatile("mrs %0, pmevcntr0_el0" : "=r" (val));
    // asm volatile("mrs %0, pmevcntr0_el0" : "=r" (val));
    // asm volatile("mrs %0, pmevcntr0_el0" : "=r" (val));
    // asm volatile("mrs %0, pmevcntr0_el0" : "=r" (val));
    // asm volatile("mrs %0, pmevcntr0_el0" : "=r" (val));

    return val;
#else
#error You need to define CycleTimer for your OS and CPU
#endif
}
