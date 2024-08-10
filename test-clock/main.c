// https://linux.die.net/man/2/clock_gettime
// https://people.cs.rutgers.edu/~pxk/416/notes/c-tutorials/gettime.html
#include <time.h>
int main() {
    struct timespec start;
    clock_gettime(CLOCK_MONOTONIC, &start);
    return 0;
}


