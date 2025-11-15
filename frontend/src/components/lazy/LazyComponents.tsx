import { lazy } from 'react'
import { ErrorBoundary } from '../features/shared/ErrorBoundary'
import { LoadingContainer, LoadingContent, LoadingSpinner, LoadingText } from '../styled/Loading.styled'

// Lazy load components for better performance
const ContractsExplorer = lazy(() => import('../features/contracts-explorer/ContractsExplorer').then(m => ({ default: m.ContractsExplorer })))
const TreemapPage = lazy(() => import('../features/treemap/TreemapPage').then(m => ({ default: m.TreemapPage })))

// Wrapped components with error boundaries
export const LazyContractsExplorer = () => (
  <ErrorBoundary>
    <ContractsExplorer />
  </ErrorBoundary>
)

export const LazyTreemapPage = () => (
  <ErrorBoundary>
    <TreemapPage />
  </ErrorBoundary>
)

// Loading component for suspense fallback
export const ComponentLoadingFallback = () => (
  <LoadingContainer>
    <LoadingContent>
      <LoadingSpinner />
      <LoadingText>Loading component...</LoadingText>
    </LoadingContent>
  </LoadingContainer>
)
