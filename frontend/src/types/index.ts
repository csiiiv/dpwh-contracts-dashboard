// Core Data Types
export interface TimeRange {
  type: 'all_time' | 'yearly' | 'quarterly' | 'custom'
  value?: number | string
  startDate?: string
  endDate?: string
}

export interface ChunkInfo {
  filename: string
  data_type: 'business_category' | 'contractor'
  start_rank: number
  end_rank: number
  time_suffix: string
  time_range: string
  chunk_size: number
  url_path: string
  year?: number
  quarter?: number
}

export interface DataReference {
  metadata: {
    generated_at: string
    version: string
    description: string
    total_chunks: number
    data_types: string[]
    time_ranges: string[]
  }
  time_ranges: {
    [timeRange: string]: {
      available: boolean
      chunks: ChunkInfo[]
      years?: number[]
      quarters?: string[]
      total_chunks: number
    }
  }
  chunks: {
    [timeRange: string]: ChunkInfo[]
  }
  access_patterns: {
    load_chunk: AccessPattern
    load_all_chunks: AccessPattern
    search_data: AccessPattern
  }
  statistics: {
    by_data_type: { [type: string]: TypeStats }
    by_time_range: { [range: string]: RangeStats }
    chunk_sizes: ChunkSizeStats
    coverage: CoverageStats
  }
}

export interface AccessPattern {
  description: string
  pattern: string
  parameters?: { [key: string]: string }
  examples?: string[]
  implementation?: string
}

export interface TypeStats {
  total_chunks: number
  total_records?: number
  time_ranges: string[]
}

export interface RangeStats {
  total_chunks: number
  data_types: string[]
  years?: number[]
  quarters?: string[]
}

export interface ChunkSizeStats {
  min: number
  max: number
  average: number
  most_common: number
}

export interface CoverageStats {
  total_chunks: number
  time_ranges_covered: number
  data_types_covered: number
  years_covered: number
  quarters_covered: number
}

// Business Category Types
export interface Category {
  rank: number
  business_category: string
  contract_count: number
  contractor_count: number
  total_contract_value: number
  average_contract_value: number
  first_contract_date: string
  last_contract_date: string
  organization_name_count: number
  area_of_delivery_count: number
  top_organizations: Organization[]
  top_areas: Area[]
  top_contracts: Contract[]
  total_contracts?: number
}

export interface CategoryChunk {
  metadata: {
    generated_at: string
    data_source: string
    time_range: string
    year?: number | null
    quarter?: number | null
    chunk_range: string
    total_categories: number
    showing: string
    time_filter: string
    global_total_contracts?: number
    global_total_contract_value?: number
    global_total_categories?: number
    global_total_contractors?: number
  }
  category_summary: Category[]
}

// Contractor Types
export interface Contractor {
  rank: number
  awardee_name: string
  contract_count: number
  business_categories_served_count: number
  organizations_served_count: number
  areas_served_count: number
  total_contract_value: number
  average_contract_value: number
  first_contract_date: string
  last_contract_date: string
  business_categories_served: Array<{
    business_category: string
    total_value: number
    contract_count: number
    first_contract_date: string
    rank: number
  }>
  organizations_served: Array<{
    organization_name: string
    total_value: number
    contract_count: number
    first_contract_date: string
    rank: number
  }>
  areas_served: Array<{
    area_of_delivery: string
    total_value: number
    contract_count: number
    first_contract_date: string
    rank: number
  }>
  top_contracts: Array<{
    business_category: string
    organization_name: string
    area_of_delivery: string
    contract_amount: number
    award_date: string
    award_title: string
    contract_no: string | null
    rank: number
  }>
}

export interface ContractorChunk {
  metadata: {
    generated_at: string
    data_source: string
    time_range: string
    year?: number | null
    quarter?: number | null
    chunk_range: string
    total_contractors: number
    showing: string
    time_filter: string
  }
  contractor_summary: Contractor[]
}

// Supporting Types
export interface Organization {
  organization_name: string
  contract_count: number
  total_contract_value: number
  average_contract_value: number
}

export interface Area {
  area: string
  contract_count: number
  total_contract_value: number
  average_contract_value: number
}

// Search and Filter Types
export interface SearchResult {
  type: 'category' | 'contractor'
  id: string
  title: string
  subtitle: string
  value: number
  rank: number
}

export interface FilterState {
  timeRange: TimeRange
  categoryTypes: string[]
  dateRange: {
    start: Date
    end: Date
  }
  searchQuery: string
}

export interface FilterOptions {
  timeRange: {
    type: 'all_time' | 'yearly' | 'quarterly'
    value?: number | string
  }
  dateRange: {
    start: string
    end: string
  }
  categoryTypes: string[]
}

// UI State Types
export interface AppState {
  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: 'en' | 'tl'
  
  // Data State
  categories: Category[]
  contractors: Contractor[]
  currentTimeRange: TimeRange
  currentFilters: FilterState
  
  // Loading States
  loading: {
    categories: boolean
    contractors: boolean
    charts: boolean
    dataReference: boolean
  }
  
  // Error States
  errors: {
    categories: string | null
    contractors: string | null
    dataReference: string | null
    general: string | null
  }
  
  // Data Reference
  dataReference: DataReference | null
}

// Chart Types
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean
  tension?: number
}

export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio?: boolean
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right'
      labels?: {
        usePointStyle?: boolean
        padding?: number
      }
    }
    tooltip?: {
      backgroundColor?: string
      titleColor?: string
      bodyColor?: string
      borderColor?: string
      borderWidth?: number
    }
    title?: {
      display?: boolean
      text?: string
      font?: {
        size?: number
        weight?: string
      }
    }
    filler?: {
      propagate?: boolean
    }
  }
  scales?: {
    x?: {
      grid?: {
        color?: string
      }
      title?: {
        display?: boolean
        text?: string
      }
    }
    y?: {
      grid?: {
        color?: string
      }
      title?: {
        display?: boolean
        text?: string
      }
      beginAtZero?: boolean
    }
  }
}

// Component Props Types
export interface BaseComponent {
  className?: string
  children?: React.ReactNode
  testId?: string
}

export interface ButtonProps extends BaseComponent {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface InputProps extends BaseComponent {
  type: 'text' | 'email' | 'password' | 'number' | 'search'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination: PaginationState
  onPaginationChange: (pagination: PaginationState) => void
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  filtering: FilteringState
  onFilteringChange: (filtering: FilteringState) => void
  loading?: boolean
  error?: string
  onRowClick?: (row: T) => void
  onExport?: () => void
  extraHeaderControls?: React.ReactNode
}

export interface ColumnDef<T> {
  key: keyof T | string
  header: string
  accessorKey?: keyof T
  cell?: (props: { row: T; value: any }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
  totalCount?: number
}

export interface SortingState {
  column: string | null
  direction: 'asc' | 'desc' | null
}

export interface FilteringState {
  global: string
  columns: { [key: string]: string }
}

// Navigation Types
export interface NavItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  current?: boolean
}

export interface BreadcrumbItem {
  name: string
  href?: string
  current?: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}
