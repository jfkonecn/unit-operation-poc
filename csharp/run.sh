#!/bin/bash


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

dotnet run --project $SCRIPT_DIR/UnitOperations.Console $1 $2 $3
