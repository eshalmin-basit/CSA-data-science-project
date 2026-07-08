"""Export the CDC 2023 National YRBS Access database to CSV.

Source: XXH2023_YRBS_Data.mdb (CDC, https://www.cdc.gov/yrbs/data/index.html)
  - XXHq  : raw questionnaire responses (one row per respondent)
  - XXHqn : CDC-computed dichotomous variables (qn*)

Usage: python src/export_mdb.py [path-to-mdb]
"""
import sys
from pathlib import Path

import pandas as pd
import pyodbc

DEFAULT_MDB = r"D:\csa_dataset\XXH2023_YRBS_Data\XXH2023_YRBS_Data.mdb"
OUT_DIR = Path(__file__).resolve().parent.parent / "data"


def export(mdb_path: str) -> None:
    conn = pyodbc.connect(
        rf"DRIVER={{Microsoft Access Driver (*.mdb, *.accdb)}};DBQ={mdb_path}"
    )
    OUT_DIR.mkdir(exist_ok=True)
    for table, out_name in [("XXHq", "yrbs_raw.csv"), ("XXHqn", "yrbs_derived.csv")]:
        df = pd.read_sql(f"SELECT * FROM {table}", conn)
        out = OUT_DIR / out_name
        df.to_csv(out, index=False)
        print(f"{table}: {df.shape[0]} rows x {df.shape[1]} cols -> {out}")
    conn.close()


if __name__ == "__main__":
    export(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_MDB)
