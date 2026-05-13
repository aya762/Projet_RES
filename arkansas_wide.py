import pandas as pd

def pivot_s2_long_to_wide(input_csv, output_csv):
    print(f"Reading {input_csv} ...")
    df = pd.read_csv(input_csv)

    df.columns = df.columns.str.strip()

    BANDS = ['B2','B3','B4','B5','B6','B7','B8','B8A','B11','B12']

    keep = ['class', 'step'] + BANDS
    df   = df[keep].copy()
    df['step'] = df['step'].astype(int)

    
    df = df.sort_values('step')
    df['point_id'] = df.groupby('step').cumcount()

    wide = df.pivot_table(
        index   = ['point_id', 'class'],
        columns = 'step',
        values  = BANDS,
        aggfunc = 'first'
    )

    wide.columns = [f"{band}_t{step}" for band, step in wide.columns]

    ordered_cols = [f"{band}_t{step}" for band in BANDS for step in range(36)]
    wide = wide[ordered_cols]

    wide = wide.reset_index()
    wide = wide.drop(columns=['point_id'])
    wide = wide.rename(columns={'class': 'label'})

    print(f"  Shape          : {wide.shape}")           # expect (10000, 361)
    missing = wide[ordered_cols].isna().sum().sum()
    print(f"  Missing values : {missing}")              # expect 0

    wide.to_csv(output_csv, index=False)
    print(f"  Saved → {output_csv}")
    return wide


if __name__ == "__main__":
    pivot_s2_long_to_wide(
        input_csv  = "ARKANSAS_S2_LONG_36x10_FIXED.csv",
        output_csv = "ARKANSAS_S2_WIDE_10000x360.csv"
    )
    pivot_s2_long_to_wide(
        input_csv  = "CALIFORNIA_S2_LONG_36x10_FIXED.csv",
        output_csv = "CALIFORNIA_S2_WIDE_10000x360.csv"
    )