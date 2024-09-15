package unit.operations;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Program {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }

  public static void runProcess(String command, String args) {
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

  public static void forceGC() {
    System.gc();
    System.runFinalization();
    System.gc();
  }
}
