import pyarrow.dataset as ds
import pyarrow.parquet as pq
import pandas as pd
from datetime import datetime
import pyarrow as pa

# Parameters
source_path = r"d:\datn\matching_network\experiement\data\fhvhv_tripdata_2025-01.parquet"
output_path = r"d:\datn\matching_network\experiement\data\sample2.parquet"
start_time = "2025-01-01 08:00:00"
end_time   = "2025-01-01 10:00:00"

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

# Step 3: Convert to pandas and sample 10%
filtered_df = filtered_table.to_pandas()
sampled_df = filtered_df.sample(frac=0.1, random_state=42)   # Lấy 10% ngẫu nhiên

# Step 4: Lưu lại thành parquet nhỏ
sampled_table = pa.Table.from_pandas(sampled_df)
pq.write_table(sampled_table, output_path)
print(f"✅ Sample saved to {output_path} with {sampled_df.shape[0]} rows")