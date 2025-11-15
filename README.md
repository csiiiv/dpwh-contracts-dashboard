# DPWH Contracts Dashboard

A modern web application for exploring and analyzing DPWH (Department of Public Works and Highways) contracts data. Built with React, TypeScript, and Vite for fast performance and excellent user experience.

## 🚀 Features

### Contracts Explorer
- **Advanced Filtering**: Filter by region, office, contractor, status, year, source of funds, and keywords
- **Custom Substring Search**: Add custom filters for any field (e.g., type "revoked" to find contractors with revoked licenses)
- **Debounced Updates**: 2-second delay prevents excessive reloading during rapid filter changes
- **Two-Row Compact Table**: Space-efficient display with independent sortable columns
- **Smart Caching**: IndexedDB-based caching with metadata file for automatic invalidation
- **Contract Details Modal**: Comprehensive contract information with hero metrics and 2x2 info grid
- **Analytics Dashboard**: Drill-down analysis by contractor, region, office, and year
- **Mobile-Friendly**: Responsive design with horizontal scrolling tables and touch-optimized controls

### Data Quality
- **CSV Metadata Tracking**: Lightweight 100-byte metadata file for cache validation
- **Quality Indicators**: Error, warning, and info tracking per contract
- **209,198+ Contracts**: Full historical data from multiple years and offices

### UI/UX
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Optimized for mobile phones, tablets, and desktops
- **Touch-Friendly**: Minimum 44px touch targets, smooth scrolling on mobile
- **Loading States**: Visual feedback with backdrop blur during data operations
- **Grouped Filter Chips**: Color-coded filter categories with individual clear buttons
- **Export Functionality**: Download filtered results as CSV

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Docker** (optional): For containerized deployment

## 🛠️ Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/csiiiv/dpwh-contracts-dashboard.git
cd dpwh-contracts-dashboard

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The app will be available at \`http://localhost:3000\`

### Production Build

```bash
cd frontend
npm run build
```

Build output will be in \`frontend/dist/\`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker compose up -d --build

# Access at http://localhost:3002
```

## 📁 Project Structure

```
dpwh-contracts-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   └── contracts-explorer/
│   │   │   │       ├── ContractsExplorer.tsx
│   │   │   │       ├── ContractsTable.tsx
│   │   │   │       ├── ContractDetailsModal.tsx
│   │   │   │       ├── ContractsSummary.tsx
│   │   │   │       └── ContractsAnalyticsModal.tsx
│   │   │   └── styled/
│   │   ├── contexts/
│   │   ├── utils/
│   │   ├── types/
│   │   └── design-system/
│   ├── public/
│   │   ├── contracts_all_years_all_offices.csv
│   │   └── contracts_metadata.json
│   └── package.json
└── docker-compose.yml
```

## 🔄 Updating Contract Data

When you update the CSV file:

```bash
cd frontend
./update_csv_metadata.sh
git add public/contracts_all_years_all_offices.csv public/contracts_metadata.json
git commit -m "Update contracts data"
git push
```

See \`frontend/CSV_METADATA_README.md\` for details.

## 🎨 Key Components

### ContractsFilters
- Searchable dropdowns with substring matching
- Custom filter input (type any text, press Enter to filter)
- Grouped filter chips by category (7 color-coded groups)
- Individual clear buttons per filter group
- Status and year toggle buttons

### ContractsTable
- Two-row compact format per contract
- Independent sortable columns (Contract ID, Contractors, Region, Status, Dates, Price)
- Responsive horizontal scrolling on mobile (min-width: 900px)
- Loading overlay with debounced updates (2-second delay)
- Hover effect syncs between both rows
- Touch-optimized pagination controls

### ContractsSummary
- 5 metric cards: Total Contracts, Total Value, Average Value, Completed, On-Going
- Responsive sizing (140-200px width, scales down on mobile)
- Horizontal scroll on small screens
- Displays **after** filters for better UX flow

### ContractDetailsModal
- Hero header with 4 key metrics (Contract Value, Status, Timeline, Progress)
- 2x2 info grid: Basic Info | Contractors, Location | Data Quality
- Up to 4 contractors displayed
- Data quality indicators with emojis

### ContractsAnalytics
- Group by contractor/region/office/year
- Aggregates: total count, total amount, average amount
- Drill-down capability with nested contract views

## 🗄️ Caching Strategy

1. **First Load**: Downloads CSV (~50MB), parses 209K+ contracts, caches in IndexedDB
2. **Metadata Check**: Fetches lightweight metadata file (100 bytes) with timestamp
3. **Cache Hit**: Instant load from IndexedDB (~100-300ms)
4. **Cache Miss**: Re-downloads CSV when metadata timestamp changes
5. **No HEAD Requests**: Metadata file approach avoids downloading full CSV just to check updates
## 📊 Performance

- **Initial Load**: ~3-5 seconds (CSV download + parse + cache)
- **Cached Load**: ~100-300ms (IndexedDB read)
- **Filtering/Sorting**: Debounced 2 seconds after last change
- **Filter Operations**: <50ms (client-side filtering of cached data)
- **Table Rendering**: Paginated (25/50/100/200 rows per page)

## 📱 Mobile Optimization

- **Responsive Breakpoints**: 640px (mobile), 768px (tablet), 1024px (desktop)
- **Touch Targets**: Minimum 44x44px for buttons and interactive elements
- **Horizontal Scrolling**: Table scrolls horizontally on narrow screens
- **Flexible Layouts**: Cards, filters, and metrics adapt to screen width
- **No Pinch-Zoom Needed**: Content scales appropriately
- **Smooth Scrolling**: `-webkit-overflow-scrolling: touch` for iOSual cache clear utility

**Cache Keys:**
- `contracts_csv_v1`: Full contracts array
- `contracts_aggregates_v1`: Pre-computed filter options
- `contracts_csv_timestamp_v1`: Last update timestamp

## 📊 Performance

- **Initial Load**: ~3-5 seconds
- **Cached Load**: ~100-300ms
- **Filtering/Sorting**: <50ms

## 🐳 Docker Commands

```bash
docker compose up -d --build
docker compose logs -f frontend
docker compose down
```

## 📦 Tech Stack

- React 19 + TypeScript + Vite
- Papa Parse (CSV)
- idb-keyval (caching)
- Docker + Nginx

## 📄 License

MIT License

---

**Built with ❤️ for transparency in government contracts**
