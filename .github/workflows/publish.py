
#!/usr/bin/python

import os
import json
import argparse

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        prog="publish.py",
        description="GitHub Actions deployment with Python script",
        usage="%(prog)s [options]",
        formatter_class=argparse.RawTextHelpFormatter,
    )

    parser.add_argument(
        "--script_id", help="apps script project script id", default="")

    args = parser.parse_args()

    json_data = {
        "scriptId": args.script_id
    }

    with open(".clasp.json", "w") as json_file:
        json.dump(json_data, json_file)
