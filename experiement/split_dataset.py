import pyarrow.dataset as ds
import pyarrow.parquet as pq
import pandas as pd
from datetime import datetime

# Parameters
source_path = "data/fhvhv_tripdata_2025-01.parquet"  # full file
output_path = "data/2min.parquet"            # filtered small file
start_time = "2025-01-01 00:00:00"
end_time   = "2025-01-01 00:02:00"

# Convert to pandas Timestamp for consistency
start_ts = pd.to_datetime(start_time)
end_ts   = pd.to_datetime(end_time)

# Step 1: Open dataset
dataset = ds.dataset(source_path, format="parquet")

# Step 2: Filter rows with pyarrow expression
filtered_table = dataset.to_table(
    filter=(
        (ds.field("request_datetime") >= ds.scalar(start_ts)) &
        (ds.field("request_datetime") <= ds.scalar(end_ts))
    )
)

# Step 3: Save to smaller Parquet file
pq.write_table(filtered_table, output_path)
print(f"✅ Sample saved to {output_path} with {filtered_table.num_rows} rows")