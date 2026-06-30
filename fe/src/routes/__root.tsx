import { createRootRouteWithContext, Outlet, Link } from '@tanstack/react-router'

interface MyRouterContext {
  auth: { isAuthenticated: boolean; user: any }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div>
      <nav>
        <Link to="/">Główna</Link>
        <Link to="/dashboard">Panel (Zabezpieczony)</Link>
      </nav>
      <Outlet />
    </div>
  ),
})
