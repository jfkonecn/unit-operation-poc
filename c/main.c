#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

void runProcess(const char *command, const char *args) {
  int pipe_stdout[2];
  int pipe_stderr[2];
  pid_t pid;
  char buffer[1024];
  ssize_t bytes_read;

  if (pipe(pipe_stdout) == -1 || pipe(pipe_stderr) == -1) {
    perror("pipe");
    exit(EXIT_FAILURE);
  }

  pid = fork();
  if (pid == -1) {
    perror("fork");
    exit(EXIT_FAILURE);
  }

  if (pid == 0) {
    close(pipe_stdout[0]);
    close(pipe_stderr[0]);

    dup2(pipe_stdout[1], STDOUT_FILENO);
    dup2(pipe_stderr[1], STDERR_FILENO);

    close(pipe_stdout[1]);
    close(pipe_stderr[1]);

    execlp(command, command, args, (char *)NULL);

    perror("execlp");
    exit(EXIT_FAILURE);
  } else {
    close(pipe_stdout[1]);
    close(pipe_stderr[1]);

    while ((bytes_read = read(pipe_stdout[0], buffer, sizeof(buffer) - 1)) >
           0) {
      buffer[bytes_read] = '\0';
      printf("%s", buffer);
    }

    while ((bytes_read = read(pipe_stderr[0], buffer, sizeof(buffer) - 1)) >
           0) {
      buffer[bytes_read] = '\0';
      fprintf(stderr, "%s", buffer);
    }

    close(pipe_stdout[0]);
    close(pipe_stderr[0]);

    int status;
    waitpid(pid, &status, 0);
  }
}

typedef struct {
  char *name;
  int age;
} Person;

void swap(Person *arr, int i, int j) {
  Person temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

int partition(Person *arr, int low, int high) {
  Person pivot = arr[high];

  int i = (low - 1);

  for (int j = low; j <= high - 1; j++) {
    if (arr[j].age < pivot.age) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, high);
  return (i + 1);
}

void quickSort(Person *arr, int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);

    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

void printCycles(const char *cyclesPath, const char *name) {
  runProcess(cyclesPath, name);
}

void readFile(const char *filePath, char **rows, int recordCount) {
  FILE *file = fopen(filePath, "r");
  if (file == NULL) {
    perror("Error opening file");
    exit(EXIT_FAILURE);
  }

  char line[256];
  int i = 0;
  fgets(line, sizeof(line), file);
  while (fgets(line, sizeof(line), file) != NULL && i < recordCount) {
    snprintf(rows[i], 256, "%s", line);
    rows[i][strcspn(rows[i], "\n")] = '\0';
    i++;
  }

  fclose(file);
}

int run(const char *filePath, int recordCount, const char *cyclesPath) {
  printCycles(cyclesPath, "Start File Read");

  char **rows = (char **)malloc(recordCount * sizeof(char *));
  for (int i = 0; i < recordCount; i++) {
    rows[i] = (char *)malloc(256 * sizeof(char));
  }

  readFile(filePath, rows, recordCount);

  runProcess(cyclesPath, "Start Map to Person Record");

  Person *people = (Person *)malloc(recordCount * sizeof(Person));

  for (int i = 0; i < recordCount; i++) {
    char *row = rows[i];
    char *temp[2];
    int j = 0;
    char *savePtr;

    char *token = strtok_r(row, ",", &savePtr);
    while (token != NULL && j < 2) {
      temp[j++] = token;
      token = strtok_r(NULL, ",", &savePtr);
    }

    if (j != 2) {
      printf("Line \"%d:%s\" does not have two entries\n", i + 1, row);
      // Free allocated memory before returning
      free(rows);
      free(people);
      return 2;
    }

    people[i].name = malloc(256);
    strcpy(people[i].name, temp[0]);
    people[i].age = atoi(temp[1]);
  }

  runProcess(cyclesPath, "Start QuickSort Person Array");
  quickSort(people, 0, recordCount - 1);

  runProcess(cyclesPath, "Start Print Results");
  printf("DDDDDDDDDDDDDDDDDDDD\n");
  printf("name,age\n");
  for (int i = 0; i < recordCount; i++) {
    printf("%s,%d\n", people[i].name, people[i].age);
  }
  printf("DDDDDDDDDDDDDDDDDDDD\n");

  runProcess(cyclesPath, "Start Free Memory");

  for (int i = 0; i < recordCount; i++) {
    free(rows[i]);
  }
  for (int i = 0; i < recordCount; i++) {
    free(people[i].name);
  }
  free(rows);
  free(people);

  runProcess(cyclesPath, "End Program");
  return 0;
}

int main(int argc, char *argv[]) {
  if (argc < 4) {
    printf("Usage: %s <filePath> <recordCount> <cyclesPath>\n", argv[0]);
    return 1;
  }

  char *filePath = argv[1];
  int recordCount = atoi(argv[2]);
  char *cyclesPath = argv[3];

  return run(filePath, recordCount, cyclesPath);
}
