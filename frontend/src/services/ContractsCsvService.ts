/**
 * Service for loading and parsing contracts from CSV file
 */

import { Contract } from '../types/contracts'

export class ContractsCsvService {
  private contracts: Contract[] | null = null
  private loading: boolean = false

  /**
   * Parse CSV line, handling quoted fields
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current) // Push last field

    return result
  }

  /**
   * Convert CSV row to Contract object
   */
  private rowToContract(headers: string[], row: string[]): Contract {
    const contract: any = {}

    headers.forEach((header, index) => {
      const value = row[index] || ''
      
      // Parse numeric fields
      if (header === 'row_number' || header === 'year') {
        contract[header] = value ? parseInt(value, 10) : null
      } else if (header === 'cost_php' || header === 'accomplishment_pct') {
        contract[header] = value ? parseFloat(value) : null
      } else {
        // String fields - handle empty strings as null for optional fields
        const optionalFields = [
          'contractor_name_2', 'contractor_id_2',
          'contractor_name_3', 'contractor_id_3',
          'contractor_name_4', 'contractor_id_4',
          'effectivity_date', 'expiry_date',
          'critical_errors', 'errors', 'warnings', 'info_notes'
        ]
        if (optionalFields.includes(header) && !value) {
          contract[header] = null
        } else {
          contract[header] = value || ''
        }
      }
    })

    return contract as Contract
  }

  /**
   * Load contracts from CSV file
   */
  async loadContracts(csvPath: string = '/contracts_all_years_all_offices.csv'): Promise<Contract[]> {
    if (this.contracts) {
      console.log('📋 Contracts already loaded, returning cached data')
      return this.contracts
    }

    if (this.loading) {
      console.log('⏳ Contracts are already loading...')
      // Wait for existing load to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.contracts || []
    }

    this.loading = true
    console.log('📥 Loading contracts from CSV:', csvPath)

    try {
      const response = await fetch(csvPath)
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`)
      }

      const text = await response.text()
      console.log('✅ CSV loaded, parsing...')

      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length === 0) {
        throw new Error('CSV file is empty')
      }

      // Parse header
      const headers = this.parseCsvLine(lines[0])
      console.log('📋 CSV headers:', headers)

      // Parse data rows
      const contracts: Contract[] = []
      for (let i = 1; i < lines.length; i++) {
        try {
          const row = this.parseCsvLine(lines[i])
          if (row.length === headers.length) {
            const contract = this.rowToContract(headers, row)
            contracts.push(contract)
          } else {
            console.warn(`⚠️ Row ${i} has ${row.length} columns, expected ${headers.length}`)
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing row ${i}:`, error)
        }
      }

      console.log(`✅ Parsed ${contracts.length} contracts`)
      this.contracts = contracts
      return contracts
    } catch (error) {
      console.error('❌ Error loading contracts:', error)
      throw error
    } finally {
      this.loading = false
    }
  }

  /**
   * Get unique values for filter options
   */
  getFilterOptions(contracts: Contract[]): {
    regions: string[]
    implementing_offices: string[]
    contractors: string[]
    statuses: string[]
    years: number[]
    source_of_funds: string[]
  } {
    const regions = new Set<string>()
    const implementing_offices = new Set<string>()
    const contractors = new Set<string>()
    const statuses = new Set<string>()
    const years = new Set<number>()
    const source_of_funds = new Set<string>()

    contracts.forEach(contract => {
      if (contract.region) regions.add(contract.region)
      if (contract.implementing_office) implementing_offices.add(contract.implementing_office)
      if (contract.status) statuses.add(contract.status)
      if (contract.year) years.add(contract.year)
      if (contract.source_of_funds) source_of_funds.add(contract.source_of_funds)

      // Add all contractor names
      if (contract.contractor_name_1) contractors.add(contract.contractor_name_1)
      if (contract.contractor_name_2) contractors.add(contract.contractor_name_2)
      if (contract.contractor_name_3) contractors.add(contract.contractor_name_3)
      if (contract.contractor_name_4) contractors.add(contract.contractor_name_4)
    })

    return {
      regions: Array.from(regions).sort(),
      implementing_offices: Array.from(implementing_offices).sort(),
      contractors: Array.from(contractors).sort(),
      statuses: Array.from(statuses).sort(),
      years: Array.from(years).sort((a, b) => b - a), // Descending
      source_of_funds: Array.from(source_of_funds).sort()
    }
  }

  /**
   * Clear cached contracts
   */
  clearCache(): void {
    this.contracts = null
  }
}

// Singleton instance
export const contractsCsvService = new ContractsCsvService()

