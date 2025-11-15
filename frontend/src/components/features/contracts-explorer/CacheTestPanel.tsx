import React from 'react'
import { useContractsData as useContractsDataContext } from '../../../contexts/ContractsDataContext'
import { Card, SectionTitle, BodyText } from '../../styled/Common.styled'
import { spacing } from '../../../design-system'
import { AccessibleButton } from '../shared/AccessibleButton'

export const CacheTestPanel: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  const { contracts, aggregates, loading, error, reload } = useContractsDataContext()

  return (
    <Card $isDark={isDark} style={{ marginBottom: spacing[4] }}>
      <SectionTitle $isDark={isDark}>🔍 Cache Test Panel</SectionTitle>
      
      <div style={{ marginTop: spacing[3] }}>
        <BodyText $isDark={isDark}>
          <strong>Loading:</strong> {loading ? 'Yes ⏳' : 'No ✅'}
        </BodyText>
        <BodyText $isDark={isDark}>
          <strong>Error:</strong> {error || 'None ✅'}
        </BodyText>
        <BodyText $isDark={isDark}>
          <strong>Contracts Loaded:</strong> {contracts.length.toLocaleString()}
        </BodyText>
        
        {aggregates && (
          <>
            <BodyText $isDark={isDark}>
              <strong>Regions:</strong> {aggregates.regions.length}
            </BodyText>
            <BodyText $isDark={isDark}>
              <strong>Offices:</strong> {aggregates.implementingOffices.length}
            </BodyText>
            <BodyText $isDark={isDark}>
              <strong>Contractors:</strong> {aggregates.contractors.length}
            </BodyText>
            <BodyText $isDark={isDark}>
              <strong>Statuses:</strong> {aggregates.statuses.length}
            </BodyText>
            <BodyText $isDark={isDark}>
              <strong>Years:</strong> {aggregates.years.join(', ')}
            </BodyText>
            <BodyText $isDark={isDark}>
              <strong>Cost Range:</strong> ₱{aggregates.minCost.toLocaleString()} - ₱{aggregates.maxCost.toLocaleString()}
            </BodyText>
          </>
        )}
        
        <div style={{ marginTop: spacing[3] }}>
          <AccessibleButton onClick={() => reload()} variant="secondary" size="sm">
            🔄 Force Reload (Bypass Cache)
          </AccessibleButton>
        </div>
        
        <div style={{ marginTop: spacing[2], fontSize: '0.85rem', opacity: 0.7 }}>
          <BodyText $isDark={isDark}>
            Check browser console for detailed cache logs. Refresh page to test cache retrieval.
          </BodyText>
        </div>
      </div>
    </Card>
  )
}
