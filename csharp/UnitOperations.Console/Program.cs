var filePath = args[0];
var recordCount = int.Parse(args[1]);

try
{
    return Run(filePath, recordCount);
}
catch (Exception e)
{
    Console.WriteLine($"An error occurred: {e.Message}");
    Console.WriteLine($"Stack Trace: {e.StackTrace}");
    return 1;
}

int Run(string filePath, int recordCount)
{
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
        people[i] = new Person() { Name = temp[0], Age = int.Parse(temp[1]), };
    }

    quickSort(people, 0, recordCount - 1);

    Console.WriteLine($"name,age");
    foreach (var person in people)
    {
        Console.WriteLine($"{person.Name},{person.Age}");
    }

    return 0;

    static void swap(Person[] arr, int i, int j)
    {
        Person temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    static int partition(Person[] arr, int low, int high)
    {
        Person pivot = arr[high];

        int i = (low - 1);

        for (int j = low; j <= high - 1; j++)
        {
            if (arr[j].Age < pivot.Age)
            {
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);
        return (i + 1);
    }

    static void quickSort(Person[] arr, int low, int high)
    {
        if (low < high)
        {
            int pi = partition(arr, low, high);

            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
}

record Person
{
    public required string Name { get; init; }
    public required int Age { get; init; }
}
