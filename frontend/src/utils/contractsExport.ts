/**
 * Export utilities for contracts data
 */

import { Contract } from '../types/contracts'

/**
 * Convert contracts to CSV format
 */
export const contractsToCSV = (contracts: Contract[]): string => {
  if (contracts.length === 0) return ''

  // CSV headers
  const headers = [
    'Row Number',
    'Contract ID',
    'Description',
    'Contractor Name 1',
    'Contractor ID 1',
    'Contractor Name 2',
    'Contractor ID 2',
    'Contractor Name 3',
    'Contractor ID 3',
    'Contractor Name 4',
    'Contractor ID 4',
    'Region',
    'Implementing Office',
    'Source of Funds',
    'Cost (PHP)',
    'Effectivity Date',
    'Expiry Date',
    'Status',
    'Accomplishment %',
    'Year',
    'Source Office',
    'File Source'
  ]

  // Escape CSV field (handle quotes and commas)
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  // Build CSV rows
  const rows = contracts.map(contract => [
    contract.row_number,
    contract.contract_id,
    contract.description,
    contract.contractor_name_1,
    contract.contractor_id_1,
    contract.contractor_name_2,
    contract.contractor_id_2,
    contract.contractor_name_3,
    contract.contractor_id_3,
    contract.contractor_name_4,
    contract.contractor_id_4,
    contract.region,
    contract.implementing_office,
    contract.source_of_funds,
    contract.cost_php,
    contract.effectivity_date,
    contract.expiry_date,
    contract.status,
    contract.accomplishment_pct,
    contract.year,
    contract.source_office,
    contract.file_source
  ].map(escapeCSV))

  // Combine headers and rows
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Download contracts as CSV file
 */
export const downloadContractsCSV = (contracts: Contract[], filename: string = 'contracts_export.csv'): void => {
  const csvContent = contractsToCSV(contracts)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export aggregated entities to CSV
 */
export const aggregatedEntitiesToCSV = (
  entities: Array<{ label: string; total_value: number; count: number; avg_value: number }>,
  dimension: string,
  metric: string
): string => {
  if (entities.length === 0) return ''

  const headers = ['Rank', 'Entity', 'Total Value (PHP)', 'Count', 'Average Value (PHP)']
  
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const rows = entities.map((entity, index) => [
    index + 1,
    entity.label,
    formatCurrency(entity.total_value),
    entity.count,
    formatCurrency(entity.avg_value)
  ].map(escapeCSV))

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Download aggregated entities as CSV
 */
export const downloadAggregatedCSV = (
  entities: Array<{ label: string; total_value: number; count: number; avg_value: number }>,
  dimension: string,
  metric: string,
  filename?: string
): void => {
  const csvContent = aggregatedEntitiesToCSV(entities, dimension, metric)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `contracts_analytics_${dimension}_${metric}_${new Date().toISOString().slice(0, 10)}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

