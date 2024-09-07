#!/bin/bash


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

dotnet run --no-build --configuration Release --project $SCRIPT_DIR/UnitOperations.Console
