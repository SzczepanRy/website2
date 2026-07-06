import { createRootRouteWithContext, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'

interface MyRouterContext {
  auth: { isAuthenticated: boolean }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  // 1. Get auth state and logout function from your custom hook
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="root-layout">
      <nav className="root-nav">
        <Link to="/">Główna</Link>
        <Link to="/dashboard">Panel (Zabezpieczony)</Link>
        <Link to="/upload">Upload (Zabezpieczony)</Link>

        {/* 3. Conditional rendering based on authentication state */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', font: 'inherit' }}
          >
            Wyloguj
          </button>
        ) : (
          <>
            <Link to="/login">login</Link>
            <Link to="/register">register</Link>
          </>
        )}
      </nav>
      <div className="root-outlet">
        <Outlet />
      </div>
    </div>
  )
}
