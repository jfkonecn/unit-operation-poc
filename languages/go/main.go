package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

type Person struct {
	Name string
	Age  int
}

func swap(arr []Person, i, j int) {
	temp := arr[i]
	arr[i] = arr[j]
	arr[j] = temp
}

func partition(arr []Person, low, high int) int {
	pivot := arr[high]
	i := low - 1

	for j := low; j <= high-1; j++ {
		if arr[j].Age < pivot.Age {
			i++
			swap(arr, i, j)
		}
	}
	swap(arr, i+1, high)
	return i + 1
}

func quickSort(arr []Person, low, high int) {
	if low < high {
		pi := partition(arr, low, high)

		quickSort(arr, low, pi-1)
		quickSort(arr, pi+1, high)
	}
}

func runProcess(command string, args ...string) {
	cmd := exec.Command(command, args...)

	output, err := cmd.CombinedOutput()

	fmt.Print(string(output))
	if err != nil {
		fmt.Print(err.Error())
	}
}

func forceGC() {
	runtime.GC()
}

func run(filePath string, recordCount int, cyclesPath string) int {
	runProcess(cyclesPath, "Start Read People CSV File")
	rows := make([]string, recordCount)

	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return 1
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	i := 0
	scanner.Scan()
	for scanner.Scan() {
		rows[i] = scanner.Text()
		i++
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading file:", err)
		return 1
	}

	runProcess(cyclesPath, "Start Validate Person Rows")
	people := make([]Person, recordCount)
	for i, row := range rows {
		temp := strings.Split(row, ",")
		if len(temp) != 2 {
			fmt.Printf("Line \"%d:%s\" does not have two entries\n", i+1, row)
			return 2
		}
		age, err := strconv.Atoi(temp[1])
		if err != nil {
			fmt.Printf("Error parsing age on line %d: %s\n", i+1, row)
			return 2
		}
		people[i] = Person{Name: temp[0], Age: age}
	}

	runProcess(cyclesPath, "Start Quick Sort Person Rows")
	quickSort(people, 0, recordCount-1)

	runProcess(cyclesPath, "Start Print Person Rows")
	fmt.Println("DDDDDDDDDDDDDDDDDDDD")
	fmt.Println("name,age")
	for _, person := range people {
		fmt.Printf("%s,%d\n", person.Name, person.Age)
	}
	fmt.Println("DDDDDDDDDDDDDDDDDDDD")

	return 0
}

func main() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: program <filePath> <recordCount> <cyclesPath>")
		os.Exit(1)
	}

	filePath := os.Args[1]
	recordCount, err := strconv.Atoi(os.Args[2])
	if err != nil {
		fmt.Println("Error parsing recordCount:", err)
		os.Exit(1)
	}
	cyclesPath := os.Args[3]

	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("An error occurred: %v\n", r)
			fmt.Println(
				"Stack Trace: N/A",
			)
			os.Exit(1)
		}
	}()

	status := run(filePath, recordCount, cyclesPath)
	if status == 0 {
		runProcess(cyclesPath, "Start Free Used Memory")
		forceGC()
		runProcess(cyclesPath, "End Program")
	}
	os.Exit(status)
}
