/**
 * Data loader for contracts using Parquet + DuckDB-WASM
 * This replaces the CSV-based loader with a more efficient Parquet-based approach
 */

import { set, get } from 'idb-keyval'
import type { Contract } from '../types/contracts'
import { contractsParquetService } from '../services/ContractsParquetService'
import type { ContractAggregates, ContractsMetadata } from '../services/ContractsParquetService'

const METADATA_URL = '/contracts_metadata.json'
const AGGREGATES_KEY = 'contracts_aggregates_parquet_v1'
const CACHE_TIMESTAMP_KEY = 'contracts_parquet_timestamp_v1'

/**
 * Load contracts and aggregates using Parquet + DuckDB-WASM
 */
export async function loadContractsAndAggregatesParquet(
  forceReload = false,
  onStageChange?: (stage: string) => void
): Promise<{ contracts: Contract[]; aggregates: ContractAggregates }> {
  console.log('📦 loadContractsAndAggregatesParquet called, forceReload:', forceReload)

  // Fetch metadata to check version
  onStageChange?.('Checking for updates...')
  console.log('🔍 Fetching metadata to check for updates...')
  let currentTimestamp: string
  try {
    const metadataResponse = await fetch(METADATA_URL)
    const metadata: ContractsMetadata = await metadataResponse.json()
    currentTimestamp = metadata.lastUpdated
    console.log('📅 Parquet Last Updated:', currentTimestamp, '(version:', metadata.version, ')')
  } catch (error) {
    console.error('⚠️ Could not fetch metadata, using fallback timestamp')
    currentTimestamp = new Date().toISOString()
  }

  // Try to get aggregates from cache (contracts are queried on-demand from DuckDB)
  if (!forceReload) {
    onStageChange?.('Checking cache...')
    console.log('🔍 Checking aggregates cache...')
    const cachedAgg = await get(AGGREGATES_KEY)
    const cachedTimestamp = await get(CACHE_TIMESTAMP_KEY)
    console.log('📊 Cache check results:', {
      aggregates: cachedAgg ? 'present' : 'null',
      cachedTimestamp: cachedTimestamp || 'null',
      currentTimestamp: currentTimestamp,
    })

    // Check if cache is valid (exists and timestamp matches)
    if (cachedAgg && cachedTimestamp === currentTimestamp) {
      console.log('✅ Using cached aggregates (timestamp matches)!')
      onStageChange?.('Initializing DuckDB...')
      
      // Initialize DuckDB and load contracts
      await contractsParquetService.initialize()
      const contracts = await contractsParquetService.loadContracts()
      
      onStageChange?.('Ready')
      return { contracts, aggregates: cachedAgg }
    } else if (cachedAgg && cachedTimestamp !== currentTimestamp) {
      console.log('⚠️ Cache invalidated - Parquet has been updated')
      onStageChange?.('Parquet updated, reloading...')
    }
  }

  // Initialize DuckDB and load data
  onStageChange?.('Initializing DuckDB...')
  await contractsParquetService.initialize()

  onStageChange?.('Loading contracts from Parquet...')
  console.log('📥 Loading contracts from Parquet...')
  const contracts = await contractsParquetService.loadContracts()

  onStageChange?.('Generating aggregates...')
  console.log('📊 Computing aggregates...')
  const aggregates = await contractsParquetService.getAggregates()

  // Cache aggregates (contracts are queried on-demand from DuckDB)
  onStageChange?.('Caching data...')
  console.log('💾 Caching aggregates to IndexedDB...')
  await set(AGGREGATES_KEY, aggregates)
  await set(CACHE_TIMESTAMP_KEY, currentTimestamp)
  console.log('✅ Aggregates cached successfully with timestamp:', currentTimestamp)
  onStageChange?.('Ready')

  return { contracts, aggregates }
}

/**
 * Check if the Parquet file has been updated since last cache
 * Returns true if an update is available
 */
export async function checkForDataUpdateParquet(): Promise<boolean> {
  try {
    const metadataResponse = await fetch(METADATA_URL)
    const metadata: ContractsMetadata = await metadataResponse.json()
    const cachedTimestamp = await get(CACHE_TIMESTAMP_KEY)

    console.log('🔍 Update check:', {
      cachedTimestamp,
      currentTimestamp: metadata.lastUpdated,
      needsUpdate: cachedTimestamp !== metadata.lastUpdated,
    })
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
export async function clearContractsCacheParquet(): Promise<void> {
  try {
    await set(AGGREGATES_KEY, undefined)
    await set(CACHE_TIMESTAMP_KEY, undefined)
    console.log('✅ Parquet cache cleared successfully')
  } catch (error) {
    console.error('❌ Error clearing cache:', error)
  }
}
