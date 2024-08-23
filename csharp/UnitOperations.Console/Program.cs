using System.Diagnostics;

var filePath = args[0];
var recordCount = int.Parse(args[1]);
var cyclesPath = args[2];

try
{
    var status = Run(filePath, recordCount, cyclesPath);
    if (status == 0)
    {
        Utils.RunProcess(cyclesPath, "Start GC Pause");
        Utils.ForceGC();
        Utils.RunProcess(cyclesPath, "End Program");
    }
    return status;
}
catch (Exception e)
{
    Console.WriteLine($"An error occurred: {e.Message}");
    Console.WriteLine($"Stack Trace: {e.StackTrace}");
    return 1;
}

int Run(string filePath, int recordCount, string cyclesPath)
{
    PrintCycles("Start File Read");
    var rows = new string[recordCount];

    {
        using StreamReader reader = new StreamReader(filePath);
        string? line = reader.ReadLine();
        int i = 0;
        while ((line = reader.ReadLine()) != null)
        {
            rows[i] = line;
            i++;
        }
    }

    Utils.RunProcess(cyclesPath, "Start Map to Person Record");
    var people = new Person[recordCount];
    for (int i = 0; i < rows.Length; i++)
    {
        string row = rows[i];
        var temp = row.Split(",");
        if (temp.Length != 2)
        {
            Console.WriteLine($"Line \"{i + 1}:{row}\" does not have two entries");
            return 2;
        }
        people[i] = new Person() { Name = temp[0], Age = int.Parse(temp[1]) };
    }

    Utils.RunProcess(cyclesPath, "Start Map to Person QuickSort");
    Utils.QuickSort(people, 0, recordCount - 1);

    Utils.RunProcess(cyclesPath, "Start Print Results");
    Console.WriteLine("DDDDDDDDDDDDDDDDDDDD");
    Console.WriteLine("name,age");
    foreach (var person in people)
    {
        Console.WriteLine($"{person.Name},{person.Age}");
    }
    Console.WriteLine("DDDDDDDDDDDDDDDDDDDD");

    void PrintCycles(string name)
    {
        Utils.RunProcess(cyclesPath, name);
    }

    return 0;
}

record Person
{
    public required string Name { get; init; }
    public required int Age { get; init; }
}

static class Utils
{
    private static void Swap(Person[] arr, int i, int j)
    {
        Person temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    private static int Partition(Person[] arr, int low, int high)
    {
        Person pivot = arr[high];

        int i = (low - 1);

        for (int j = low; j <= high - 1; j++)
        {
            if (arr[j].Age < pivot.Age)
            {
                i++;
                Swap(arr, i, j);
            }
        }
        Swap(arr, i + 1, high);
        return (i + 1);
    }

    public static void QuickSort(Person[] arr, int low, int high)
    {
        if (low < high)
        {
            int pi = Partition(arr, low, high);

            QuickSort(arr, low, pi - 1);
            QuickSort(arr, pi + 1, high);
        }
    }

    public static void RunProcess(string command, string? args = null)
    {
        Process process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = command,
                Arguments = $"\"{args}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            },
        };

        process.Start();
        string output = process.StandardOutput.ReadToEnd();
        string error = process.StandardError.ReadToEnd();
        process.WaitForExit();

        Console.Write(output);
        if (!string.IsNullOrEmpty(error))
        {
            Console.Write(error);
        }
    }

    public static void ForceGC()
    {
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
    }
}
