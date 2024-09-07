#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

taskset 0x1 "$SCRIPT_DIR/run-performance-tests.sh"
