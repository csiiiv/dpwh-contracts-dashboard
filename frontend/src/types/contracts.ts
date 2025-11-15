// Contract data types based on contracts_all_years_all_offices.csv

export interface Contract {
  row_number: number
  contract_id: string
  description: string
  contractor_name_1: string
  contractor_id_1: string
  contractor_name_2: string
  contractor_id_2: string
  contractor_name_3: string
  contractor_id_3: string
  contractor_name_4: string
  contractor_id_4: string
  region: string
  implementing_office: string
  source_of_funds: string
  cost_php: number | null
  effectivity_date: string | null
  expiry_date: string | null
  status: string
  accomplishment_pct: number | null
  year: number | null
  source_office: string
  file_source: string
  critical_errors: string | null
  errors: string | null
  warnings: string | null
  info_notes: string | null
}

export interface ContractFilters {
  regions: string[]
  implementing_offices: string[]
  contractors: string[]
  statuses: string[]
  years: number[]
  source_of_funds: string[]
  keywords: string[]
  minCost?: number
  maxCost?: number
  dateRange?: {
    type: 'all_time' | 'yearly' | 'quarterly' | 'custom'
    year?: number
    quarter?: number
    startDate?: string
    endDate?: string
  }
  valueRange?: {
    min?: number
    max?: number
  }
}

export interface ContractSortConfig {
  field: keyof Contract | string
  direction: 'asc' | 'desc'
}

export interface ContractPagination {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Helper to get all contractor names from a contract
export const getContractorNames = (contract: Contract): string[] => {
  const names: string[] = []
  if (contract.contractor_name_1) names.push(contract.contractor_name_1)
  if (contract.contractor_name_2) names.push(contract.contractor_name_2)
  if (contract.contractor_name_3) names.push(contract.contractor_name_3)
  if (contract.contractor_name_4) names.push(contract.contractor_name_4)
  return names.filter(Boolean)
}

