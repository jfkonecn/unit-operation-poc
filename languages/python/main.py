import gc
import subprocess
import sys

sys.setrecursionlimit(2048)


class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age


def swap(arr, i, j):
    arr[i], arr[j] = arr[j], arr[i]


def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j].age < pivot.age:
            i += 1
            swap(arr, i, j)
    swap(arr, i + 1, high)
    return i + 1


def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)


def run_process(command, args=None):
    process = subprocess.Popen(
        [command] + ([args] if args else []),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    output, error = process.communicate()

    print(output, end="")
    if error:
        print(error)


def force_gc():
    gc.collect()
    gc.collect()


def run(file_path: str, record_count: int, cycles_path: str) -> int:
    run_process(cycles_path, "Start Read People CSV File")
    rows = [None] * record_count

    with open(file_path, "r") as reader:
        reader.readline()  # skip header
        for i in range(record_count):
            line = reader.readline().strip()
            if line:
                rows[i] = line

    run_process(cycles_path, "Start Validate Person Rows")
    people = [None] * record_count

    for i, row in enumerate(rows):
        temp = row.split(",")
        if len(temp) != 2:
            print(f'Line "{i + 1}:{row}" does not have two entries')
            return 2
        people[i] = Person(name=temp[0], age=int(temp[1]))

    run_process(cycles_path, "Start Quick Sort Person Rows")
    quick_sort(people, 0, record_count - 1)

    run_process(cycles_path, "Start Print Person Rows")
    print("DDDDDDDDDDDDDDDDDDDD")
    print("name,age")
    for person in people:
        print(f"{person.name},{person.age}")
    print("DDDDDDDDDDDDDDDDDDDD")

    return 0


def main():
    if len(sys.argv) < 3:
        print("Usage: python script.py <file_path> <record_count> <cycles_path>")
        return 1

    file_path = sys.argv[1]
    try:
        record_count = int(sys.argv[2])
    except ValueError:
        print("Invalid record count. Must be an integer.")
        return 1

    cycles_path = sys.argv[3]

    try:
        status = run(file_path, record_count, cycles_path)
        if status == 0:
            run_process(cycles_path, "Start Free Used Memory")
            force_gc()
            run_process(cycles_path, "End Program")
        return status
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print(f"Stack Trace: {traceback.format_exc()}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
