#!/bin/bash

# Script to update contracts metadata after CSV is updated
# Run this after you update contracts_all_years_all_offices.csv

CSV_FILE="public/contracts_all_years_all_offices.csv"
METADATA_FILE="public/contracts_metadata.json"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: CSV file not found at $CSV_FILE"
    exit 1
fi

# Get row count (excluding header)
ROW_COUNT=$(tail -n +2 "$CSV_FILE" | wc -l)

# Get current timestamp in ISO 8601 format
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Create or update metadata file
cat > "$METADATA_FILE" << EOF
{
  "lastUpdated": "$TIMESTAMP",
  "version": "1.0.0",
  "rowCount": $ROW_COUNT,
  "description": "Metadata for contracts CSV - updated automatically"
}
EOF

echo "✅ Metadata updated successfully!"
echo "   Timestamp: $TIMESTAMP"
echo "   Row Count: $ROW_COUNT"
echo ""
echo "Don't forget to commit both the CSV and metadata files together!"
