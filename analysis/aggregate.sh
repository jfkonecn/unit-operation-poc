#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

python3 -m venv $SCRIPT_DIR/.venv
source $SCRIPT_DIR/.venv/bin/activate
pip install -r $SCRIPT_DIR/requirements.txt > /dev/null

python3 $SCRIPT_DIR/aggregate.py
