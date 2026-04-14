import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { OverviewPage } from '../features/overview/pages/OverviewPage'
import { VisualizationPage } from '../features/care-journey/pages/VisualizationPage'
import { MapPage } from '../features/map/pages/MapPage'
import { UserStoriesPage } from '../features/user-stories/pages/UserStoriesPage'
import { StoryPage } from '../features/user-stories/pages/StoryPage'
import { CreateStoryPage } from '../features/user-stories/pages/CreateStoryPage'
import { AdminPage } from '../features/admin/pages/AdminPage'

export const router = createBrowserRouter([
  // ── Public auth routes ──────────────────────────
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // ── Protected app shell ─────────────────────────
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Overview — Dashboard (home)
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: 'overview', element: <OverviewPage /> },
        ],
      },
      // Care Journey — Visualization
      {
        element: <ProtectedRoute product="care-journey" />,
        children: [
          { path: 'care-journey', element: <VisualizationPage /> },
        ],
      },
      // Map
      {
        element: <ProtectedRoute product="map" />,
        children: [
          { path: 'map', element: <MapPage /> },
        ],
      },
      // User Stories — Guided Process
      {
        element: <ProtectedRoute product="user-stories" />,
        children: [
          { path: 'user-stories', element: <UserStoriesPage /> },
          { path: 'user-stories/create', element: <CreateStoryPage /> },
          { path: 'user-stories/:id', element: <StoryPage /> },
        ],
      },
      // Admin
      {
        element: <ProtectedRoute adminOnly />,
        children: [
          { path: 'admin', element: <AdminPage /> },
        ],
      },
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
