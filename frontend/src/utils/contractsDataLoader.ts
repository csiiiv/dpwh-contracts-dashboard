import Papa from 'papaparse'
import { set, get } from 'idb-keyval'
import type { Contract } from '../types/contracts'

const CSV_URL = '/contracts_all_years_all_offices.csv'
const METADATA_URL = '/contracts_metadata.json'
const CACHE_KEY = 'contracts_csv_v1' // bump version if CSV changes
const AGGREGATES_KEY = 'contracts_aggregates_v1'
const CACHE_TIMESTAMP_KEY = 'contracts_csv_timestamp_v1'

export interface ContractsMetadata {
  lastUpdated: string
  version: string
  rowCount: number
  description?: string
}

export interface ContractAggregates {
  regions: string[]
  implementingOffices: string[]
  contractors: string[]
  statuses: string[]
  years: number[]
  sourcesOfFunds: string[]
  minCost: number
  maxCost: number
  minAccomplishment: number
  maxAccomplishment: number
}

// Helper to extract all contractor names from a contract
const getAllContractorNames = (contract: Contract): string[] => {
  return [
    contract.contractor_name_1,
    contract.contractor_name_2,
    contract.contractor_name_3,
    contract.contractor_name_4,
  ].filter(Boolean)
}

export async function loadContractsAndAggregates(
  forceReload = false,
  onStageChange?: (stage: string) => void
): Promise<{contracts: Contract[], aggregates: ContractAggregates}> {
  console.log('📦 loadContractsAndAggregates called, forceReload:', forceReload)
  
  // Fetch lightweight metadata file to check version (only a few KB vs entire CSV)
  onStageChange?.('Checking for updates...')
  console.log('🔍 Fetching metadata to check for updates...')
  let currentTimestamp: string
  try {
    const metadataResponse = await fetch(METADATA_URL)
    const metadata: ContractsMetadata = await metadataResponse.json()
    currentTimestamp = metadata.lastUpdated
    console.log('📅 CSV Last Updated:', currentTimestamp, '(version:', metadata.version, ')')
  } catch (error) {
    console.error('⚠️ Could not fetch metadata, using fallback timestamp')
    currentTimestamp = new Date().toISOString()
  }
  
  // Try to get from cache
  if (!forceReload) {
    onStageChange?.('Checking cache...')
    console.log('🔍 Checking cache...')
    const cached = await get(CACHE_KEY)
    const cachedAgg = await get(AGGREGATES_KEY)
    const cachedTimestamp = await get(CACHE_TIMESTAMP_KEY)
    console.log('📊 Cache check results:', { 
      contracts: cached ? `${cached.length} contracts` : 'null',
      aggregates: cachedAgg ? 'present' : 'null',
      cachedTimestamp: cachedTimestamp || 'null',
      currentTimestamp: currentTimestamp
    })
    
    // Check if cache is valid (exists and timestamp matches)
    if (cached && cachedAgg && cachedTimestamp === currentTimestamp) {
      console.log('✅ Using cached data (timestamp matches)!')
      onStageChange?.('Loading from cache...')
      return { contracts: cached, aggregates: cachedAgg }
    } else if (cached && cachedAgg && cachedTimestamp !== currentTimestamp) {
      console.log('⚠️ Cache invalidated - CSV has been updated')
      onStageChange?.('CSV updated, reloading...')
    }
  }

  // Fetch and parse CSV
  onStageChange?.('Downloading contracts data...')
  console.log('📥 Fetching CSV from', CSV_URL)
  const response = await fetch(CSV_URL)
  console.log('📄 Response status:', response.status)
  const csvText = await response.text()
  console.log('📝 CSV text length:', csvText.length)
  
  onStageChange?.('Parsing CSV data...')
  console.log('🔄 Parsing CSV...')
  const { data, errors } = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  if (errors.length) {
    console.error('❌ CSV parse errors:', errors)
    throw new Error('CSV parse error: ' + JSON.stringify(errors))
  }
  console.log('✅ Parsed', data.length, 'rows')
  
  // Convert fields to correct types
  const contracts: Contract[] = (data as any[]).map(row => ({
    ...row,
    row_number: Number(row.row_number),
    cost_php: row.cost_php ? Number(row.cost_php) : null,
    year: row.year ? Number(row.year) : null,
    accomplishment_pct: row.accomplishment_pct ? Number(row.accomplishment_pct) : null,
  }))

  onStageChange?.('Generating aggregates...')
  console.log('📊 Pre-computing aggregates...')
  // Precompute aggregates
  const regions = new Set<string>()
  const implementingOffices = new Set<string>()
  const contractors = new Set<string>()
  const statuses = new Set<string>()
  const years = new Set<number>()
  const sourcesOfFunds = new Set<string>()
  let minCost = Infinity, maxCost = -Infinity
  let minAccomplishment = Infinity, maxAccomplishment = -Infinity

  for (const c of contracts) {
    if (c.region) regions.add(c.region)
    if (c.implementing_office) implementingOffices.add(c.implementing_office)
    getAllContractorNames(c).forEach(name => contractors.add(name))
    if (c.status) statuses.add(c.status)
    if (typeof c.year === 'number') years.add(c.year)
    if (c.source_of_funds) sourcesOfFunds.add(c.source_of_funds)
    if (typeof c.cost_php === 'number') {
      minCost = Math.min(minCost, c.cost_php)
      maxCost = Math.max(maxCost, c.cost_php)
    }
    if (typeof c.accomplishment_pct === 'number') {
      minAccomplishment = Math.min(minAccomplishment, c.accomplishment_pct)
      maxAccomplishment = Math.max(maxAccomplishment, c.accomplishment_pct)
    }
  }

  const aggregates: ContractAggregates = {
    regions: Array.from(regions).sort(),
    implementingOffices: Array.from(implementingOffices).sort(),
    contractors: Array.from(contractors).sort(),
    statuses: Array.from(statuses).sort(),
    years: Array.from(years).sort((a, b) => b - a),
    sourcesOfFunds: Array.from(sourcesOfFunds).sort(),
    minCost: isFinite(minCost) ? minCost : 0,
    maxCost: isFinite(maxCost) ? maxCost : 0,
    minAccomplishment: isFinite(minAccomplishment) ? minAccomplishment : 0,
    maxAccomplishment: isFinite(maxAccomplishment) ? maxAccomplishment : 0,
  }

  console.log('✅ Aggregates computed:', {
    regions: aggregates.regions.length,
    offices: aggregates.implementingOffices.length,
    contractors: aggregates.contractors.length,
    statuses: aggregates.statuses.length,
    years: aggregates.years.length,
    sourcesOfFunds: aggregates.sourcesOfFunds.length
  })

  // Cache results
  onStageChange?.('Caching data...')
  console.log('💾 Caching data to IndexedDB...')
  await set(CACHE_KEY, contracts)
  await set(AGGREGATES_KEY, aggregates)
  await set(CACHE_TIMESTAMP_KEY, currentTimestamp)
  console.log('✅ Data cached successfully with timestamp:', currentTimestamp)
  onStageChange?.('Ready')

  return { contracts, aggregates }
}

/**
 * Check if the CSV file has been updated since last cache
 * Returns true if an update is available
 */
export async function checkForDataUpdate(): Promise<boolean> {
  try {
    const metadataResponse = await fetch(METADATA_URL)
    const metadata: ContractsMetadata = await metadataResponse.json()
    const cachedTimestamp = await get(CACHE_TIMESTAMP_KEY)
    
    console.log('🔍 Update check:', { cachedTimestamp, currentTimestamp: metadata.lastUpdated, needsUpdate: cachedTimestamp !== metadata.lastUpdated })
    return cachedTimestamp !== metadata.lastUpdated
  } catch (error) {
    console.error('❌ Error checking for updates:', error)
    return false
  }
}

/**
 * Clear all cached contracts data
 * Useful when forcing a reload or when cache becomes corrupted
 */
export async function clearContractsCache(): Promise<void> {
  try {
    await set(CACHE_KEY, undefined)
    await set(AGGREGATES_KEY, undefined)
    await set(CACHE_TIMESTAMP_KEY, undefined)
    console.log('✅ Cache cleared successfully')
  } catch (error) {
    console.error('❌ Error clearing cache:', error)
  }
}