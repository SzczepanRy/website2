// src/routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: ({ context }) => {
    // @ts-ignore – to uciszy TS, dopóki router nie wygeneruje typów podczas buildu
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardComponent,
})
function DashboardComponent() {
  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Witaj w bezpiecznym panelu! 🔐</h1>
      <span className="dashboard-badge">Dostęp autoryzowany</span>
    </div>
  )
}
