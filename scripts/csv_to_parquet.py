#!/usr/bin/env python3
"""
Convert CSV data to Parquet format for efficient client-side processing with DuckDB-WASM.
"""
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
import sys

def convert_csv_to_parquet(csv_path: str, output_path: str, compression: str = 'snappy'):
    """
    Convert a CSV file to Parquet format with optimized settings.
    
    Args:
        csv_path: Path to the input CSV file
        output_path: Path for the output Parquet file
        compression: Compression algorithm (snappy, gzip, brotli, zstd)
    """
    print(f"Reading CSV from: {csv_path}")
    
    # Read CSV with pandas
    df = pd.read_csv(csv_path, low_memory=False)
    
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns")
    print(f"Columns: {list(df.columns)}")
    
    # Convert to PyArrow Table for better control
    table = pa.Table.from_pandas(df)
    
    # Write to Parquet with compression
    print(f"Writing Parquet to: {output_path}")
    pq.write_table(
        table,
        output_path,
        compression=compression,
        use_dictionary=True,  # Enable dictionary encoding for repeated values
        write_statistics=True,  # Write column statistics for better query performance
        version='2.6'  # Use Parquet format version 2.6 for better compatibility
    )
    
    # Get file sizes for comparison
    csv_size = Path(csv_path).stat().st_size / (1024 * 1024)  # MB
    parquet_size = Path(output_path).stat().st_size / (1024 * 1024)  # MB
    compression_ratio = (1 - parquet_size / csv_size) * 100
    
    print(f"\nConversion complete!")
    print(f"CSV size: {csv_size:.2f} MB")
    print(f"Parquet size: {parquet_size:.2f} MB")
    print(f"Compression ratio: {compression_ratio:.2f}%")
    print(f"Space saved: {csv_size - parquet_size:.2f} MB")

if __name__ == "__main__":
    # Default paths
    csv_file = "/mnt/6E9A84429A8408B3/_VSC/LINUX/DPWH/dpwh-contracts-dashboard/frontend/public/contracts_all_years_all_offices.csv"
    parquet_file = "/mnt/6E9A84429A8408B3/_VSC/LINUX/DPWH/dpwh-contracts-dashboard/frontend/public/contracts_all_years_all_offices.parquet"
    
    # Allow custom paths via command line
    if len(sys.argv) > 1:
        csv_file = sys.argv[1]
    if len(sys.argv) > 2:
        parquet_file = sys.argv[2]
    
    convert_csv_to_parquet(csv_file, parquet_file, compression='snappy')
