import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router'

interface MyRouterContext {
  auth: { isAuthenticated: boolean}
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="root-layout">
      <nav className="root-nav">
        <Link to="/">Główna</Link>
        <Link to="/dashboard">Panel (Zabezpieczony)</Link>
        <Link to="/upload">Upload (Zabezpieczony)</Link>
        <Link to="/login">login</Link>
        <Link to="/register">register</Link>
      </nav>
      <div className="root-outlet">
        <Outlet />
      </div>
    </div>
  ),
})
