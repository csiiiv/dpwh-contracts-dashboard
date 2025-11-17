import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { loadContractsAndAggregatesParquet } from '../utils/contractsDataLoaderParquet'
import type { Contract } from '../types/contracts'
import type { ContractAggregates } from '../services/ContractsParquetService'

interface ContractsDataContextValue {
  contracts: Contract[]
  aggregates: ContractAggregates | null
  loading: boolean
  loadingStage: string
  error: string | null
  reload: () => void
}

const ContractsDataContext = createContext<ContractsDataContextValue | undefined>(undefined)

export const ContractsDataProvider = ({ children }: { children: ReactNode }) => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [aggregates, setAggregates] = useState<ContractAggregates | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingStage, setLoadingStage] = useState('Initializing...')
  const [error, setError] = useState<string | null>(null)

  const loadData = async (forceReload = false) => {
    console.log('🚀 ContractsDataContext: Loading data (Parquet), forceReload:', forceReload)
    setLoading(true)
    setError(null)
    try {
      const { contracts, aggregates } = await loadContractsAndAggregatesParquet(forceReload, setLoadingStage)
      console.log('✅ ContractsDataContext: Loaded', contracts.length, 'contracts from Parquet')
      setContracts(contracts)
      setAggregates(aggregates)
      setLoadingStage('Complete')
    } catch (e: any) {
      console.error('❌ ContractsDataContext: Error loading data:', e)
      setError(e.message || 'Failed to load contracts data')
      setLoadingStage('Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line
  }, [])

  return (
    <ContractsDataContext.Provider value={{ contracts, aggregates, loading, loadingStage, error, reload: () => loadData(true) }}>
      {children}
    </ContractsDataContext.Provider>
  )
}

export function useContractsData() {
  const ctx = useContext(ContractsDataContext)
  if (!ctx) throw new Error('useContractsData must be used within a ContractsDataProvider')
  return ctx
}