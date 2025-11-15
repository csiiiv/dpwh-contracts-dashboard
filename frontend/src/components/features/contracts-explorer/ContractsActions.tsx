import React from 'react'
import { spacing } from '../../../design-system'

interface ContractsActionsProps {
  hasResults: boolean
  hasAggregates: boolean
  onExport: () => void
  onShowAnalytics: () => void
}

export const ContractsActions: React.FC<ContractsActionsProps> = ({
  hasResults,
  hasAggregates,
  onExport,
  onShowAnalytics
}) => {
  return (
    <div style={{ display: 'flex', gap: spacing[4], marginBottom: spacing[6], justifyContent: 'center' }}>
      <button
        onClick={onExport}
        disabled={!hasResults}
        style={{
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: hasResults ? '#2563eb' : '#d1d5db',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 16,
          cursor: hasResults ? 'pointer' : 'not-allowed',
          opacity: hasResults ? 1 : 0.6
        }}
      >
        Export CSV
      </button>
      <button
        onClick={onShowAnalytics}
        disabled={!hasAggregates}
        style={{
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: hasAggregates ? '#22c55e' : '#d1fae5',
          color: hasAggregates ? '#fff' : '#6b7280',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 16,
          cursor: hasAggregates ? 'pointer' : 'not-allowed',
          opacity: hasAggregates ? 1 : 0.6
        }}
      >
        View Analytics
      </button>
    </div>
  )
}
