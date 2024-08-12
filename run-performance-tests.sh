#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <test_name>"
    exit 1
fi

TEST_NAME=$1

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

CYCLES="$SCRIPT_DIR/performance-utils/cycles"
READ_TIME="$SCRIPT_DIR/performance-utils/read-time"
PROC_PARSER_SCRIPT="$SCRIPT_DIR/performance-utils/parse-proc.sh"

LANGUAGE="csharp"
TEST_FILE_NAME="$(echo $ROW_COUNT)_rows.csv"
ROW_COUNT=1

RESULT_DIR="$SCRIPT_DIR/analysis/results/$TEST_NAME"

mkdir -p "$RESULT_DIR"

LANGUAGES=("csharp")

before_temp=$(mktemp)
after_temp=$(mktemp)


MEMORY_RESULTS_FILE="$RESULT_DIR/memory.csv"
CPU_RESULTS_FILE="$RESULT_DIR/cpu.csv"
CPU_INFO_FILE="$RESULT_DIR/cpu-info.txt"
OS_INFO_FILE="$RESULT_DIR/os-info.txt"
CLOCK_SPEED_FILE="$RESULT_DIR/clock-speed.csv"

lscpu > "$CPU_INFO_FILE"
lsb_release -a > "$OS_INFO_FILE"

echo "Language,Total Records,File Name,Run Number,Point,Cycles" > "$CPU_RESULTS_FILE"
echo "Language,Total Records,File Name,Run Number,VmPeak" > "$MEMORY_RESULTS_FILE"
echo "time (ns),cycles" > "$CLOCK_SPEED_FILE"
eval "$READ_TIME" >> "$CLOCK_SPEED_FILE"
for LANGUAGE in "${LANGUAGES[@]}"; do
    echo "Processing language: $LANGUAGE"
    for FILE in $SCRIPT_DIR/data-generation/test-data/*_rows.csv; do
        FILENAME=$(basename "$FILE")
        TOTAL_RECORDS=${FILENAME%%_*}
        LANGUAGE_DIR="$SCRIPT_DIR/$LANGUAGE"
        RUN_SCRIPT="$LANGUAGE_DIR/run.sh"
        echo "Processing $FILENAME"

        TOTAL_RUNS=10
        for RUN_NUMBER in $(seq 1 $TOTAL_RUNS)
        do
            echo "Run Number $RUN_NUMBER of $TOTAL_RUNS"
            eval "$RUN_SCRIPT $FILE $TOTAL_RECORDS $CYCLES" \
                | sed '/DDDDDDDDDDDDDDDDDDD/,/DDDDDDDDDDDDDDDDDDD/d' \
                | awk '/XXXXXXXXXXXXXXXXXXXX/{f=1; next} !f{print > "'"$before_temp"'"} f{print > "'"$after_temp"'"}'
            RUN_META_DATA="$LANGUAGE,$TOTAL_RECORDS,$FILENAME,$RUN_NUMBER,"
            cat "$before_temp" | sed "s/^/$RUN_META_DATA/" >> $CPU_RESULTS_FILE
            cat "$after_temp" | eval "$PROC_PARSER_SCRIPT" | sed "s/^/$RUN_META_DATA/" >> $MEMORY_RESULTS_FILE
        done

    done
    echo "Finished processing language: $LANGUAGE"
    echo "----------------------------------------"
done
eval "$READ_TIME" >> "$CLOCK_SPEED_FILE"

rm "$before_temp" "$after_temp"
