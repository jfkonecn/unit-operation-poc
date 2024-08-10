# Generate New Sample Database

## Setup

```py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```py
# first number is patients
python3 generate.py 1000000
```

## Freeze

```sh
pip freeze -l > requirements.txt
```
