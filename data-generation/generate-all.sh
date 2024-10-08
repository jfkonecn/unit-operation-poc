#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

python3 -m venv $SCRIPT_DIR/.venv
source $SCRIPT_DIR/.venv/bin/activate
pip install -r $SCRIPT_DIR/requirements.txt > /dev/null

TEST_DATA_DIR=$SCRIPT_DIR/test-data
rm -r $TEST_DATA_DIR/*.csv
mkdir -p $TEST_DATA_DIR


NUMBERS=(0 10 1000 2500 5000 7500 10000 25000 50000 75000 100000)
for NUMBER in "${NUMBERS[@]}"
do
    echo "$NUMBER"
    python3 $SCRIPT_DIR/generate.py $NUMBER > $TEST_DATA_DIR/$(echo $NUMBER)_rows.csv
done
