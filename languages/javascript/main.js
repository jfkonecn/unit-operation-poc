const { execSync } = require("child_process");
const fs = require("fs");

function swap(arr, i, j) {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j].age < pivot.age) {
      i++;
      swap(arr, i, j);
    }
  }
  swap(arr, i + 1, high);
  return i + 1;
}

function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);

    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function runProcess(command, args = null) {
  const fullCommand = `${command} ${args ? `"${args}"` : ""}`;
  try {
    const stdout = execSync(fullCommand, { stdio: "pipe" });
    process.stdout.write(stdout.toString());
  } catch (error) {
    console.error(error.stderr.toString());
  }
}

function forceGC() {
  if (global.gc) {
    global.gc();
  } else {
    console.warn("No GC hook! Start Node with --expose-gc.");
  }
}

function run(filePath, recordCount, cyclesPath) {
  runProcess(cyclesPath, "Start Read People CSV File");

  let rows = new Array(recordCount);

  try {
    const fileData = fs.readFileSync(filePath, "utf-8");
    const lines = fileData.split("\n").filter((line) => line.trim());
    for (let i = 1; i < lines.length; i++) {
      rows[i - 1] = lines[i];
    }
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    return 1;
  }

  runProcess(cyclesPath, "Start Validate Person Rows");

  let people = new Array(recordCount);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const temp = row.split(",");

    if (temp.length !== 2) {
      console.error(`Line "${i + 1}:${row}" does not have two entries`);
      return 2;
    }

    people[i] = {
      name: temp[0],
      age: parseInt(temp[1], 10),
    };
  }

  runProcess(cyclesPath, "Start Quick Sort Person Rows");
  quickSort(people, 0, recordCount - 1);

  runProcess(cyclesPath, "Start Print Person Rows");
  console.log("DDDDDDDDDDDDDDDDDDDD");
  console.log("name,age");
  people.forEach((person) => {
    console.log(`${person.name},${person.age}`);
  });
  console.log("DDDDDDDDDDDDDDDDDDDD");

  return 0;
}

const filePath = process.argv[2];
const recordCount = parseInt(process.argv[3], 10);
const cyclesPath = process.argv[4];

try {
  const status = run(filePath, recordCount, cyclesPath);
  if (status === 0) {
    runProcess(cyclesPath, "Start Free Used Memory");
    forceGC();
    runProcess(cyclesPath, "End Program");
  }
  process.exit(status);
} catch (error) {
  console.error(`An error occurred: ${error.message}`);
  console.error(`Stack Trace: ${error.stack}`);
  process.exit(1);
}
