# Python Unit Operations

## Setup

```py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```py
pytest -vs | egrep main.py
# One at a time
pytest -vs -k test_get_one_row_at_a_time | egrep main.py
```
