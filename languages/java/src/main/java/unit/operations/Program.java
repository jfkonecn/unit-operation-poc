package unit.operations;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Program {
  public static void main(String[] args) {
    String filePath = args[0];
    int recordCount = Integer.parseInt(args[1]);
    String cyclesPath = args[2];

    try {
      int status = run(filePath, recordCount, cyclesPath);
      if (status == 0) {
        runProcess(cyclesPath, "Start Free Memory");
        forceGC();
        runProcess(cyclesPath, "End Program");
      }
      System.exit(status);
    } catch (Exception e) {
      System.out.println("An error occurred: " + e.getMessage());
      e.printStackTrace();
      System.exit(1);
    }
  }

  public static int run(String filePath, int recordCount, String cyclesPath) {
    printCycles("Start File Read", cyclesPath);
    String[] rows = new String[recordCount];

    try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
      String line = reader.readLine(); // First line (if needed)
      int i = 0;
      while ((line = reader.readLine()) != null && i < recordCount) {
        rows[i] = line;
        i++;
      }
    } catch (IOException e) {
      e.printStackTrace();
      return 1;
    }

    runProcess(cyclesPath, "Start Map to Person Record");
    Person[] people = new Person[recordCount];
    for (int i = 0; i < rows.length; i++) {
      String row = rows[i];
      String[] temp = row.split(",");
      if (temp.length != 2) {
        System.out.println("Line \"" + (i + 1) + ":" + row + "\" does not have two entries");
        return 2;
      }
      people[i] = new Person(temp[0], Integer.parseInt(temp[1]));
    }

    runProcess(cyclesPath, "Start Quick Sort Person Array");
    quickSort(people, 0, recordCount - 1);

    runProcess(cyclesPath, "Start Print Results");
    System.out.println("DDDDDDDDDDDDDDDDDDDD");
    System.out.println("name,age");
    for (Person person : people) {
      System.out.println(person.name() + "," + person.age());
    }
    System.out.println("DDDDDDDDDDDDDDDDDDDD");

    return 0;
  }

  private static void printCycles(String name, String cyclesPath) {
    runProcess(cyclesPath, name);
  }

  public record Person(String name, int age) {
    public Person {
      if (name == null || name.isBlank()) {
        throw new IllegalArgumentException("Name is required");
      }
      if (age <= 0) {
        throw new IllegalArgumentException("Age must be a positive integer");
      }
    }
  }

  private static void swap(Person[] arr, int i, int j) {
    Person temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  private static int partition(Person[] arr, int low, int high) {
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

  private static void quickSort(Person[] arr, int low, int high) {
    if (low < high) {
      int pi = partition(arr, low, high);

      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  }

  private static void runProcess(String command, String args) {
    ProcessBuilder processBuilder = new ProcessBuilder();

    if (args != null && !args.isEmpty()) {
      processBuilder.command(command, args);
    } else {
      processBuilder.command(command);
    }

    processBuilder.redirectErrorStream(true);

    try {
      Process process = processBuilder.start();

      BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
      BufferedReader errorReader =
          new BufferedReader(new InputStreamReader(process.getErrorStream()));

      String line;
      StringBuilder output = new StringBuilder();
      while ((line = reader.readLine()) != null) {
        output.append(line).append(System.lineSeparator());
      }

      StringBuilder error = new StringBuilder();
      while ((line = errorReader.readLine()) != null) {
        error.append(line).append(System.lineSeparator());
      }

      process.waitFor();

      System.out.print(output.toString());

      if (error.length() > 0) {
        System.out.print(error.toString());
      }

    } catch (IOException | InterruptedException e) {
      e.printStackTrace();
    }
  }

  private static void forceGC() {
    System.gc();
    System.runFinalization();
    System.gc();
  }
}
