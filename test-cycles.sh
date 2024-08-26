#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

READ_TIME="$SCRIPT_DIR/performance-utils/read-time"

# Capture the first set of time and clock cycles
output1=$(eval "$READ_TIME")
time1=$(echo $output1 | cut -d',' -f1)
cycles1=$(echo $output1 | cut -d',' -f2)

sleep 1

# Capture the second set of time and clock cycles
output2=$(eval "$READ_TIME")
time2=$(echo $output2 | cut -d',' -f1)
cycles2=$(echo $output2 | cut -d',' -f2)

# Calculate the differences
time_diff=$((time2 - time1))
cycles_diff=$((cycles2 - cycles1))

# Calculate the clock speed in Hz
clock_speed=$(bc <<< "scale=2; $cycles_diff / $time_diff")

echo "Clock speed: $clock_speed GHz"

