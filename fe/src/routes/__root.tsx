import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router'

interface MyRouterContext {
  auth: { isAuthenticated: boolean; user: any }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="root-layout">
      <nav className="root-nav">
        <Link to="/">Główna</Link>
        <Link to="/dashboard">Panel (Zabezpieczony)</Link>
      </nav>
      <div className="root-outlet">
        <Outlet />
      </div>
    </div>
  ),
})
