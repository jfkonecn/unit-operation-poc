var filePath = args[0];
var recordCount = uint.Parse(args[1]);

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

int Run(string filePath, uint recordCount)
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
        people[i] = new Person() { Name = temp[0], Age = uint.Parse(temp[1]), };
    }

    // quick sort
    // print the results

    return 0;
}

record Person
{
    public required string Name { get; init; }
    public required uint Age { get; init; }
}
