import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { getThemeVars } from '../../../design-system/theme'
import { typography, spacing, commonStyles } from '../../../design-system'
import { advancedSearchService, type FilterOptions } from '../../../services/AdvancedSearchService'

// Import extracted hooks
import { useAdvancedSearchFilters } from '../../../hooks/advanced-search/useAdvancedSearchFilters'
import { useAdvancedSearchData } from '../../../hooks/advanced-search/useAdvancedSearchData'
import { useAdvancedSearchPagination } from '../../../hooks/advanced-search/useAdvancedSearchPagination'
import { useUnifiedExport } from '../../../hooks/useUnifiedExport'
import { createAdvancedSearchConfig } from '../../../hooks/useUnifiedExportConfigs'

// Import extracted components
import { AdvancedSearchFilters } from './components/AdvancedSearchFilters'
import { AdvancedSearchResults } from './components/AdvancedSearchResults'
import { AdvancedSearchActions } from './components/AdvancedSearchActions'
import { AnalyticsModal } from './AnalyticsModal'
import { ExportCSVModal } from '../shared/ExportCSVModal'

const AdvancedSearch: React.FC = () => {
  // ...existing code, see previous output for full code...
}

export { AdvancedSearch }
