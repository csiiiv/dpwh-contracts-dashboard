/**
 * Service for loading and querying contracts from Parquet file using DuckDB-WASM
 */

import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import type { Contract } from '../types/contracts'

const PARQUET_URL = '/contracts_all_years_all_offices.parquet'

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

export class ContractsParquetService {
  private db: duckdb.AsyncDuckDB | null = null
  private conn: duckdb.AsyncDuckDBConnection | null = null
  private initialized: boolean = false
  private initializing: boolean = false

  /**
   * Initialize DuckDB-WASM and load the Parquet file
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('✅ DuckDB already initialized')
      return
    }

    if (this.initializing) {
      console.log('⏳ DuckDB initialization in progress...')
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return
    }

    this.initializing = true
    console.log('🚀 Initializing DuckDB-WASM...')

    try {
      // Select bundle based on browser support
      const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
        mvp: {
          mainModule: duckdb_wasm,
          mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js', import.meta.url).toString(),
        },
        eh: {
          mainModule: duckdb_wasm_eh,
          mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
        },
      }

      // Select appropriate bundle
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)
      console.log('📦 Selected DuckDB bundle:', bundle)

      // Instantiate worker
      const worker = new Worker(bundle.mainWorker!)
      const logger = new duckdb.ConsoleLogger()
      this.db = new duckdb.AsyncDuckDB(logger, worker)

      // Instantiate the database
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker)
      console.log('✅ DuckDB instantiated')

      // Create connection
      this.conn = await this.db.connect()
      console.log('✅ DuckDB connection established')

      // Fetch and register the Parquet file
      console.log('📥 Fetching Parquet file from:', PARQUET_URL)
      const response = await fetch(PARQUET_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch Parquet file: ${response.status} ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      console.log(`✅ Parquet file loaded: ${(uint8Array.length / 1024 / 1024).toFixed(2)} MB`)

      // Register the file in DuckDB
      await this.db.registerFileBuffer('contracts.parquet', uint8Array)
      console.log('✅ Parquet file registered in DuckDB')

      // Create a view for easier querying
      await this.conn.query(`
        CREATE OR REPLACE VIEW contracts AS 
        SELECT * FROM read_parquet('contracts.parquet')
      `)
      console.log('✅ Contracts view created')

      this.initialized = true
      console.log('🎉 DuckDB-WASM initialization complete!')
    } catch (error) {
      console.error('❌ Error initializing DuckDB:', error)
      throw error
    } finally {
      this.initializing = false
    }
  }

  /**
   * Execute a SQL query and return results as objects
   */
  private async query<T = any>(sql: string): Promise<T[]> {
    if (!this.conn) {
      throw new Error('DuckDB not initialized. Call initialize() first.')
    }

    console.log('🔍 Executing query:', sql.substring(0, 100) + '...')
    const result = await this.conn.query(sql)
    const rows = result.toArray().map(row => row.toJSON())
    console.log(`✅ Query returned ${rows.length} rows`)
    return rows as T[]
  }

  /**
   * Load all contracts from the Parquet file
   */
  async loadContracts(): Promise<Contract[]> {
    await this.initialize()
    
    console.log('📥 Loading all contracts...')
    const contracts = await this.query<Contract>(`
      SELECT * FROM contracts
      ORDER BY row_number
    `)
    
    console.log(`✅ Loaded ${contracts.length} contracts`)
    return contracts
  }

  /**
   * Get contracts with filters applied
   */
  async getFilteredContracts(filters: {
    regions?: string[]
    implementingOffices?: string[]
    contractors?: string[]
    statuses?: string[]
    years?: number[]
    sourcesOfFunds?: string[]
    minCost?: number
    maxCost?: number
    minAccomplishment?: number
    maxAccomplishment?: number
    searchTerm?: string
  }): Promise<Contract[]> {
    await this.initialize()

    const conditions: string[] = []
    
    if (filters.regions && filters.regions.length > 0) {
      const regionList = filters.regions.map(r => `'${r.replace(/'/g, "''")}'`).join(',')
      conditions.push(`region IN (${regionList})`)
    }
    
    if (filters.implementingOffices && filters.implementingOffices.length > 0) {
      const officeList = filters.implementingOffices.map(o => `'${o.replace(/'/g, "''")}'`).join(',')
      conditions.push(`implementing_office IN (${officeList})`)
    }
    
    if (filters.contractors && filters.contractors.length > 0) {
      const contractorConditions = filters.contractors.map(c => {
        const escaped = c.replace(/'/g, "''")
        return `(contractor_name_1 = '${escaped}' OR contractor_name_2 = '${escaped}' OR contractor_name_3 = '${escaped}' OR contractor_name_4 = '${escaped}')`
      })
      conditions.push(`(${contractorConditions.join(' OR ')})`)
    }
    
    if (filters.statuses && filters.statuses.length > 0) {
      const statusList = filters.statuses.map(s => `'${s.replace(/'/g, "''")}'`).join(',')
      conditions.push(`status IN (${statusList})`)
    }
    
    if (filters.years && filters.years.length > 0) {
      conditions.push(`year IN (${filters.years.join(',')})`)
    }
    
    if (filters.sourcesOfFunds && filters.sourcesOfFunds.length > 0) {
      const fundsList = filters.sourcesOfFunds.map(f => `'${f.replace(/'/g, "''")}'`).join(',')
      conditions.push(`source_of_funds IN (${fundsList})`)
    }
    
    if (filters.minCost !== undefined) {
      conditions.push(`cost_php >= ${filters.minCost}`)
    }
    
    if (filters.maxCost !== undefined) {
      conditions.push(`cost_php <= ${filters.maxCost}`)
    }
    
    if (filters.minAccomplishment !== undefined) {
      conditions.push(`accomplishment_pct >= ${filters.minAccomplishment}`)
    }
    
    if (filters.maxAccomplishment !== undefined) {
      conditions.push(`accomplishment_pct <= ${filters.maxAccomplishment}`)
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.replace(/'/g, "''")
      conditions.push(`(
        description ILIKE '%${term}%' OR
        contractor_name_1 ILIKE '%${term}%' OR
        contractor_name_2 ILIKE '%${term}%' OR
        contractor_name_3 ILIKE '%${term}%' OR
        contractor_name_4 ILIKE '%${term}%' OR
        contract_id ILIKE '%${term}%'
      )`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `SELECT * FROM contracts ${whereClause} ORDER BY row_number`
    
    return await this.query<Contract>(sql)
  }

  /**
   * Get aggregates for filter options
   */
  async getAggregates(): Promise<ContractAggregates> {
    await this.initialize()

    console.log('📊 Computing aggregates...')

    // Get distinct regions
    const regions = await this.query<{ region: string }>(`
      SELECT DISTINCT region FROM contracts WHERE region IS NOT NULL ORDER BY region
    `)

    // Get distinct implementing offices
    const implementingOffices = await this.query<{ implementing_office: string }>(`
      SELECT DISTINCT implementing_office FROM contracts WHERE implementing_office IS NOT NULL ORDER BY implementing_office
    `)

    // Get distinct contractors from all contractor columns
    const contractors = await this.query<{ contractor: string }>(`
      SELECT DISTINCT contractor FROM (
        SELECT contractor_name_1 as contractor FROM contracts WHERE contractor_name_1 IS NOT NULL
        UNION
        SELECT contractor_name_2 as contractor FROM contracts WHERE contractor_name_2 IS NOT NULL
        UNION
        SELECT contractor_name_3 as contractor FROM contracts WHERE contractor_name_3 IS NOT NULL
        UNION
        SELECT contractor_name_4 as contractor FROM contracts WHERE contractor_name_4 IS NOT NULL
      )
      ORDER BY contractor
    `)

    // Get distinct statuses
    const statuses = await this.query<{ status: string }>(`
      SELECT DISTINCT status FROM contracts WHERE status IS NOT NULL ORDER BY status
    `)

    // Get distinct years
    const years = await this.query<{ year: number }>(`
      SELECT DISTINCT year FROM contracts WHERE year IS NOT NULL ORDER BY year DESC
    `)

    // Get distinct sources of funds
    const sourcesOfFunds = await this.query<{ source_of_funds: string }>(`
      SELECT DISTINCT source_of_funds FROM contracts WHERE source_of_funds IS NOT NULL ORDER BY source_of_funds
    `)

    // Get cost and accomplishment ranges
    const ranges = await this.query<{
      min_cost: number
      max_cost: number
      min_accomplishment: number
      max_accomplishment: number
    }>(`
      SELECT 
        MIN(cost_php) as min_cost,
        MAX(cost_php) as max_cost,
        MIN(accomplishment_pct) as min_accomplishment,
        MAX(accomplishment_pct) as max_accomplishment
      FROM contracts
    `)

    const aggregates: ContractAggregates = {
      regions: regions.map(r => r.region),
      implementingOffices: implementingOffices.map(o => o.implementing_office),
      contractors: contractors.map(c => c.contractor),
      statuses: statuses.map(s => s.status),
      years: years.map(y => y.year),
      sourcesOfFunds: sourcesOfFunds.map(f => f.source_of_funds),
      minCost: ranges[0]?.min_cost ?? 0,
      maxCost: ranges[0]?.max_cost ?? 0,
      minAccomplishment: ranges[0]?.min_accomplishment ?? 0,
      maxAccomplishment: ranges[0]?.max_accomplishment ?? 0,
    }

    console.log('✅ Aggregates computed:', {
      regions: aggregates.regions.length,
      offices: aggregates.implementingOffices.length,
      contractors: aggregates.contractors.length,
      statuses: aggregates.statuses.length,
      years: aggregates.years.length,
      sourcesOfFunds: aggregates.sourcesOfFunds.length,
    })

    return aggregates
  }

  /**
   * Get summary statistics
   */
  async getSummaryStats(): Promise<{
    totalContracts: number
    totalValue: number
    avgValue: number
    completedContracts: number
    ongoingContracts: number
  }> {
    await this.initialize()

    const stats = await this.query<{
      total_contracts: number
      total_value: number
      avg_value: number
      completed_contracts: number
      ongoing_contracts: number
    }>(`
      SELECT 
        COUNT(*) as total_contracts,
        SUM(cost_php) as total_value,
        AVG(cost_php) as avg_value,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_contracts,
        COUNT(CASE WHEN status = 'Ongoing' THEN 1 END) as ongoing_contracts
      FROM contracts
    `)

    return {
      totalContracts: stats[0].total_contracts,
      totalValue: stats[0].total_value,
      avgValue: stats[0].avg_value,
      completedContracts: stats[0].completed_contracts,
      ongoingContracts: stats[0].ongoing_contracts,
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.conn) {
      await this.conn.close()
      this.conn = null
    }
    if (this.db) {
      await this.db.terminate()
      this.db = null
    }
    this.initialized = false
    console.log('✅ DuckDB connection closed')
  }
}

// Singleton instance
export const contractsParquetService = new ContractsParquetService()
