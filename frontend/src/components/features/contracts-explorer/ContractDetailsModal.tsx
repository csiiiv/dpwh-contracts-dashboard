import React from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { spacing, typography } from '../../../design-system'
import { Modal } from '../shared/Modal'
import { Card, BodyText } from '../../styled/Common.styled'
import type { Contract } from '../../../types/contracts'

interface ContractDetailsModalProps {
  open: boolean
  onClose: () => void
  contract: Contract | null
  isDark?: boolean
  zIndex?: number
}

const formatCurrency = (value: number | null): string => {
  if (value === null) return 'N/A'
  if (value >= 1e9) return `₱${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `₱${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `₱${(value / 1e3).toFixed(2)}K`
  return `₱${value.toFixed(2)}`
}

export const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({
  open,
  onClose,
  contract,
  isDark = false,
  zIndex = 10000
}) => {
  const { isDark: themeDark } = useTheme()

  if (!contract) return null

  const getStatusColor = (status: string | null): string => {
    if (!status) return getColor('text-secondary')
    const s = status.toLowerCase()
    if (s.includes('completed') || s.includes('ongoing')) return '#10b981'
    if (s.includes('terminated') || s.includes('cancelled')) return '#ef4444'
    if (s.includes('awarded')) return '#3b82f6'
    return getColor('text-primary')
  }

  const getStatusBadgeStyle = (status: string | null) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: typography.fontSize.xs,
    fontWeight: 600,
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
    border: `1px solid ${getStatusColor(status)}40`
  })

  const getColor = (token: string) => {
    const cssVarName = `--color-${token.replace(/\./g, '-')}`
    return `var(${cssVarName})`
  }

  const InfoRow = ({ icon, label, value, highlight = false }: { 
    icon: string
    label: string
    value: string | number | null
    highlight?: boolean 
  }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]} 0`,
      borderBottom: `1px solid ${getColor('border-light')}`
    }}>
      <span style={{ fontSize: '18px', minWidth: '24px' }}>{icon}</span>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ 
          fontSize: typography.fontSize.xs, 
          color: getColor('text-secondary'),
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 600
        }}>
          {label}
        </span>
        <span style={{ 
          fontSize: typography.fontSize.sm, 
          color: highlight ? '#3b82f6' : getColor('text-primary'),
          fontWeight: highlight ? 600 : 400,
          wordBreak: 'break-word'
        }}>
          {value || 'N/A'}
        </span>
      </div>
    </div>
  )

  const contractors = [
    { name: contract.contractor_name_1, id: contract.contractor_id_1 },
    { name: contract.contractor_name_2, id: contract.contractor_id_2 },
    { name: contract.contractor_name_3, id: contract.contractor_id_3 },
    { name: contract.contractor_name_4, id: contract.contractor_id_4 },
  ].filter(c => c.name)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="📄 Contract Details"
      size="large"
      isDark={isDark ?? themeDark}
      zIndex={zIndex}
    >
      <div style={{ padding: spacing[4] }}>
        {/* Hero Header - Cost, Status, Timeline, Progress */}
        <Card $isDark={isDark ?? themeDark} style={{ 
          padding: spacing[4], 
          marginBottom: spacing[3],
          background: `linear-gradient(135deg, ${getColor('primary-50')} 0%, ${getColor('primary-100')} 100%)`
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: spacing[4]
          }}>
            {/* Contract Value */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: getColor('text-secondary'),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: spacing[2]
              }}>
                💰 Contract Value
              </div>
              <div style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: 700,
                color: getColor('primary-600')
              }}>
                {formatCurrency(contract.cost_php)}
              </div>
            </div>

            {/* Status */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: getColor('text-secondary'),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: spacing[2]
              }}>
                📊 Status
              </div>
              <div>
                <div style={getStatusBadgeStyle(contract.status)}>
                  {contract.status || 'N/A'}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: getColor('text-secondary'),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: spacing[2]
              }}>
                📆 Timeline
              </div>
              <div style={{ fontSize: typography.fontSize.xs, color: getColor('text-primary'), lineHeight: 1.6 }}>
                <div><strong>Effectivity:</strong> {contract.effectivity_date || 'N/A'}</div>
                <div><strong>Expiry:</strong> {contract.expiry_date || 'N/A'}</div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: getColor('text-secondary'),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                marginBottom: spacing[2]
              }}>
                ⚡ Progress
              </div>
              <div style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: 700,
                color: contract.accomplishment_pct && contract.accomplishment_pct >= 100 ? '#10b981' : getColor('primary-600')
              }}>
                {contract.accomplishment_pct !== null ? `${contract.accomplishment_pct}%` : 'N/A'}
              </div>
            </div>
          </div>
        </Card>

        {/* Row 1: Basic Info | Contractors */}
        <div style={{ display: 'flex', gap: spacing[3], marginBottom: spacing[3] }}>
          {/* Basic Information */}
          <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[3], flex: 1 }}>
            <BodyText $isDark={isDark ?? themeDark} style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: 700, 
              marginBottom: spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}>
              <span style={{ fontSize: '20px' }}>📋</span>
              Basic Information
            </BodyText>
            <div>
              <InfoRow icon="🔖" label="Contract ID" value={contract.contract_id} highlight />
              <InfoRow icon="📅" label="Year" value={contract.year} />
              <InfoRow icon="📝" label="Description" value={contract.description} />
              <InfoRow icon="💰" label="Source of Funds" value={contract.source_of_funds} />
            </div>
          </Card>

          {/* Contractors */}
          <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[3], flex: 1 }}>
            <BodyText $isDark={isDark ?? themeDark} style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: 700, 
              marginBottom: spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}>
              <span style={{ fontSize: '20px' }}>👷</span>
              Contractors ({contractors.length})
            </BodyText>
            <div>
              {contractors.map((contractor, idx) => (
                <InfoRow 
                  key={idx}
                  icon={idx === 0 ? "⭐" : "👤"}
                  label={idx === 0 ? "Primary" : `Contractor ${idx + 1}`}
                  value={`${contractor.name}${contractor.id ? ` (${contractor.id})` : ''}`}
                  highlight={idx === 0}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Row 2: Region | Data Quality */}
        <div style={{ display: 'flex', gap: spacing[3] }}>
          {/* Location & Office */}
          <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[3], flex: 1 }}>
            <BodyText $isDark={isDark ?? themeDark} style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: 700, 
              marginBottom: spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              Location & Office
            </BodyText>
            <div>
              <InfoRow icon="🗺️" label="Region" value={contract.region} />
              <InfoRow icon="🏢" label="Implementing Office" value={contract.implementing_office} />
            </div>
          </Card>

          {/* Quality Indicators */}
          <Card $isDark={isDark ?? themeDark} style={{ padding: spacing[3], flex: 1 }}>
            <BodyText $isDark={isDark ?? themeDark} style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: 700, 
              marginBottom: spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              Data Quality
            </BodyText>
            <div>
              <InfoRow icon="🔴" label="Critical Errors" value={contract.critical_errors || '0'} />
              <InfoRow icon="🟠" label="Errors" value={contract.errors || '0'} />
              <InfoRow icon="🟡" label="Warnings" value={contract.warnings || '0'} />
              <InfoRow icon="ℹ️" label="Info Notes" value={contract.info_notes || '0'} />
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  )
}
