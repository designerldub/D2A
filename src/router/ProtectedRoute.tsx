import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, type ProductKey } from '../contexts/AuthContext'

interface Props {
  /** Require the user to have access to this product. */
  product?: ProductKey
  /** Require the user to be an admin. */
  adminOnly?: boolean
}

export function ProtectedRoute({ product, adminOnly }: Props) {
  const { user, hasProduct } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  if (product && !hasProduct(product)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
