// Jest setup file for React Testing Library
require("@testing-library/jest-dom")

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}))

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: function Image(props) {
    // eslint-disable-next-line jsx-a11y/alt-text
    const { src, alt, ...rest } = props
    return { type: "img", props: { src, alt, ...rest } }
  },
}))

// Mock window.matchMedia for components that use it (only in jsdom environment)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock IntersectionObserver (only if not defined)
if (typeof IntersectionObserver === "undefined") {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return []
    }
    unobserve() {}
  }
}

// Mock ResizeObserver (only if not defined)
if (typeof ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
