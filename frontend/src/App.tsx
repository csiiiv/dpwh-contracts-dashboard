import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ThemeToggle } from './components/features/shared/ThemeToggle'
import { ErrorBoundary } from './components/features/shared/ErrorBoundary'
import { usePerformanceMonitoring, usePageLoadPerformance } from './hooks/usePerformanceMonitoring'
import { useServiceWorker } from './utils/serviceWorker'
import { TAB_CONFIGS, type TabType } from './constants/tabs'
import { ROUTES } from './constants/routes'
import {
  LazyContractsExplorer,
  LazyTreemapPage,
  ComponentLoadingFallback,
} from './components/lazy/LazyComponents'
import NotFound from './pages/NotFound'
import {
  AppContainer,
  Navigation,
  NavigationContent,
  TabButton,
  MainContent,
  Footer,
  TabIcon,
  TabLabel,
} from './components/styled/App.styled'
import Header from './components/ui/Header'
import './App.css'
import './styles/theme.css'
import { ContractsDataProvider } from './contexts/ContractsDataContext'

const AppContent: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  
  // Performance monitoring
  usePerformanceMonitoring('AppContent')
  usePageLoadPerformance()
  
  // Service worker
  const { isRegistered, isUpdateAvailable, updateServiceWorker } = useServiceWorker({
    onUpdate: () => {
      console.log('App update available')
    },
    onSuccess: () => {
      console.log('Service worker registered successfully')
    },
  })

  // Determine active tab based on current route
  const getActiveTab = (): TabType => {
    const path = location.pathname
    if (path === '/' || path === '') return 'contracts-explorer'
    if (path.startsWith('/contracts-explorer')) return 'contracts-explorer'
    if (path.startsWith('/treemap')) return 'treemap'
    return 'contracts-explorer'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tabId: TabType) => {
    const routeMap: Record<TabType, string> = {
      'contracts-explorer': ROUTES.CONTRACTS_EXPLORER,
      'treemap': ROUTES.TREEMAP,
    }
    navigate(routeMap[tabId])
  }

  return (
    <AppContainer $isDark={isDark}>
      {/* Header */}
      <Header />

      {/* Navigation Tabs */}
      <Navigation $isDark={isDark}>
        <NavigationContent>
          {TAB_CONFIGS.map(tab => (
            <TabButton
              key={tab.id}
              $isDark={isDark}
              $isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              aria-label={tab.ariaLabel}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              title={tab.description}
            >
              <TabIcon>{tab.icon}</TabIcon>
              <TabLabel>{tab.label}</TabLabel>
            </TabButton>
          ))}
        </NavigationContent>
      </Navigation>

      {/* Main Content */}
      <MainContent>
        <Suspense fallback={<ComponentLoadingFallback />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<LazyContractsExplorer />} />
            <Route path={ROUTES.CONTRACTS_EXPLORER} element={<LazyContractsExplorer />} />
            <Route path={ROUTES.TREEMAP} element={<LazyTreemapPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainContent>

      {/* Footer */}
      <Footer $isDark={isDark}>
        <p>
          Built with React, TypeScript, and Django REST API
          {isRegistered && ' • Service Worker Active'}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          <a href="/PUBLIC_DOMAIN_LICENSE.txt" target="_blank" rel="noopener noreferrer">Public domain license (CC0 1.0)</a>
        </p>
      </Footer>
    </AppContainer>
  )
}


function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ContractsDataProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ContractsDataProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App