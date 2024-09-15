#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

java -cp "$SCRIPT_DIR/target/unit-operations-1.0-SNAPSHOT.jar" "unit.operations.Program"
