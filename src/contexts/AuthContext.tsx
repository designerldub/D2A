import { createContext, useContext, useState, type ReactNode } from 'react'

export type ProductKey = 'care-journey' | 'map' | 'user-stories'

export interface MockUser {
  id: string
  name: string
  products: ProductKey[]
  isAdmin: boolean      // true for any admin role (gates the Admin nav link)
  isSuperAdmin: boolean // full access to all admin features
  orgAdminIds: number[] // org IDs this user can administer (empty if super or non-admin)
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    name: 'Alice (all products)',
    products: ['care-journey', 'map', 'user-stories'],
    isAdmin: false,
    isSuperAdmin: false,
    orgAdminIds: [],
  },
  {
    id: 'u2',
    name: 'Bob (care-journey only)',
    products: ['care-journey'],
    isAdmin: false,
    isSuperAdmin: false,
    orgAdminIds: [],
  },
  {
    id: 'u3',
    name: 'Carol (map + user-stories)',
    products: ['map', 'user-stories'],
    isAdmin: false,
    isSuperAdmin: false,
    orgAdminIds: [],
  },
  {
    id: 'u4',
    name: 'Dana (super admin)',
    products: ['care-journey', 'map', 'user-stories'],
    isAdmin: true,
    isSuperAdmin: true,
    orgAdminIds: [],
  },
  {
    id: 'u5',
    name: 'Eve (org admin — Org A)',
    products: ['care-journey', 'map'],
    isAdmin: true,
    isSuperAdmin: false,
    orgAdminIds: [1],
  },
  {
    id: 'u6',
    name: 'Frank (org admin — Orgs B & E)',
    products: ['user-stories'],
    isAdmin: true,
    isSuperAdmin: false,
    orgAdminIds: [2, 5],
  },
]

interface AuthContextValue {
  user: MockUser | null
  mockUsers: MockUser[]
  login: (userId: string) => void
  logout: () => void
  hasProduct: (product: ProductKey) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)

  function login(userId: string) {
    const found = MOCK_USERS.find((u) => u.id === userId) ?? null
    setUser(found)
  }

  function logout() {
    setUser(null)
  }

  function hasProduct(product: ProductKey) {
    return user?.products.includes(product) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, mockUsers: MOCK_USERS, login, logout, hasProduct }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
