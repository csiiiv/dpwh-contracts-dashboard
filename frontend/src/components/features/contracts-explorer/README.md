# Contracts Explorer

A comprehensive contracts exploration interface that loads data directly from a CSV file.

## Features

- **CSV Data Loading**: Loads contracts from `contracts_all_years_all_offices.csv`
- **Advanced Filtering**: Filter by region, office, contractor, status, year, and keywords
- **Sorting**: Sort by any column (contract ID, cost, date, status, etc.)
- **Pagination**: Configurable page sizes (25, 50, 100, 200)
- **Summary Statistics**: View total contracts, total value, average value, completed/on-going counts
- **Real-time Search**: Searchable dropdowns for regions, offices, and contractors
- **Dark Mode Support**: Full theme support

## Setup

1. **Place CSV file in public folder:**
   ```bash
   cp contracts_all_years_all_offices.csv REFERENCE/frontend/public/
   ```

2. **Update CSV path in service** (if needed):
   The service looks for the CSV at `./contracts_all_years_all_offices.csv` relative to the public folder.

## Usage

Navigate to `/contracts-explorer` in the application to access the contracts explorer.

## Components

- **ContractsExplorer**: Main container component
- **ContractsTable**: Table component with sorting and pagination
- **ContractsFilters**: Filter UI with searchable selects and filter chips
- **ContractsSummary**: Summary statistics display

## Data Structure

The CSV file should have the following columns:
- `row_number`, `contract_id`, `description`
- `contractor_name_1` through `contractor_name_4` (and corresponding IDs)
- `region`, `implementing_office`, `source_of_funds`
- `cost_php`, `effectivity_date`, `expiry_date`
- `status`, `accomplishment_pct`, `year`
- `source_office`, `file_source`
- `critical_errors`, `errors`, `warnings`, `info_notes`

## Performance

- CSV is parsed once and cached in memory
- Filtering and sorting are performed client-side
- Pagination limits rendered rows for better performance
- Large datasets (200k+ rows) are handled efficiently

## Future Enhancements

- Export to CSV functionality
- Drill-down modals for contract details
- Advanced analytics and charts
- Filter presets and saved searches

