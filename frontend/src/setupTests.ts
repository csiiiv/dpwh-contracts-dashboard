import '@testing-library/jest-dom'

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3200'

// Mock window.matchMedia
(window as any).matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
})

// Mock ResizeObserver
(global as any).ResizeObserver = class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
(global as any).IntersectionObserver = class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}