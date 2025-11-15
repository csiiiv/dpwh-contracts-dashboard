# CSV Metadata Update

The `contracts_metadata.json` file tracks when the CSV was last updated, allowing the app to automatically invalidate cached data when new data is available.

## How It Works

1. **Lightweight Check**: The app fetches a tiny JSON file (~100 bytes) instead of checking the large CSV
2. **Smart Caching**: Only downloads the full CSV if the timestamp doesn't match the cached version
3. **Automatic Invalidation**: Users automatically get fresh data when you update the CSV

## When You Update the CSV

After updating `public/contracts_all_years_all_offices.csv`, run:

```bash
cd frontend
./update_csv_metadata.sh
```

This will:
- Update the `lastUpdated` timestamp
- Count the rows in the CSV
- Generate the metadata file

Then commit both files together:

```bash
git add public/contracts_all_years_all_offices.csv public/contracts_metadata.json
git commit -m "Update contracts data"
```

## Manual Update

You can also manually edit `public/contracts_metadata.json`:

```json
{
  "lastUpdated": "2025-11-15T18:39:13.000Z",
  "version": "1.0.0",
  "rowCount": 209198,
  "description": "Update this timestamp when CSV changes"
}
```

Just change the `lastUpdated` field to a new timestamp.
