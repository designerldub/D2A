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
import { StoryTemplatePage } from '../features/story-template/pages/StoryTemplatePage'
import { StoryPage } from '../features/story-template/pages/StoryPage'
import { CreateStoryPage } from '../features/story-template/pages/CreateStoryPage'
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
      // Story Template — Guided Process
      {
        element: <ProtectedRoute product="story-template" />,
        children: [
          { path: 'story-template', element: <StoryTemplatePage /> },
          { path: 'story-template/create', element: <CreateStoryPage /> },
          { path: 'story-template/:id', element: <StoryPage /> },
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
