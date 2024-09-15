#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

dotnet build --configuration Release $SCRIPT_DIR/UnitOperations.Console
