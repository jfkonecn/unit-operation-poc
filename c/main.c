#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
  if (argc < 4) {
    printf("Usage: %s <filePath> <recordCount> <cyclesPath>\n", argv[0]);
    return 1;
  }

  char *filePath = argv[1];
  int recordCount = atoi(argv[2]);
  char *cyclesPath = argv[3];

  printf("File Path: %s\n", filePath);
  printf("Record Count: %d\n", recordCount);
  printf("Cycles Path: %s\n", cyclesPath);

  return 0;
}
