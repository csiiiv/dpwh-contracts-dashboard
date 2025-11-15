export type TabType = 'contracts-explorer' | 'treemap'

export interface TabConfig {
  id: TabType
  label: string
  icon: string
  description: string
  ariaLabel: string
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'contracts-explorer',
    label: 'Contracts Explorer',
    icon: '📋',
    description: 'Explore DPWH contracts data',
    ariaLabel: 'Navigate to Contracts Explorer tab'
  },
  {
    id: 'treemap',
    label: 'Treemap',
    icon: '👁',
    description: 'Interactive treemap visualization',
    ariaLabel: 'Navigate to Treemap tab'
  }
]

export const DEFAULT_TAB: TabType = 'contracts-explorer'
