# DPWH Contracts Dashboard

A modern web application for exploring and analyzing DPWH (Department of Public Works and Highways) contracts data. Built with React, TypeScript, and Vite for fast performance and excellent user experience.

## 🚀 Features

### Contracts Explorer
- **Advanced Filtering**: Filter by region, office, contractor, status, year, and more
- **Two-Row Compact Table**: Space-efficient display with sortable columns
- **Smart Caching**: IndexedDB-based caching with automatic invalidation
- **Contract Details Modal**: Comprehensive contract information with hero metrics
- **Analytics Dashboard**: Drill-down analysis by contractor, region, office, and year

### Data Quality
- **CSV Metadata Tracking**: Automatic cache invalidation when data updates
- **Quality Indicators**: Error, warning, and info tracking per contract
- **209,198+ Contracts**: Full historical data from multiple years

### UI/UX
- **Dark/Light Mode**: System preference detection with manual toggle
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Visual feedback during data operations
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

### ContractsTable
Two-row compact format with sortable columns and loading states.

### ContractDetailsModal
Hero header with metrics, basic info, contractors, location, and data quality.

### Analytics
Group by contractor/region/office/year with aggregates and drill-down.

## 🗄️ Caching Strategy

1. **First Load**: Downloads CSV, parses, caches in IndexedDB
2. **Subsequent Loads**: Checks metadata file for updates
3. **Cache Hit**: Instant load from IndexedDB
4. **Cache Miss**: Re-downloads when timestamp changes

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
