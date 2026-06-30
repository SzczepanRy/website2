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
  return <h1>Witaj w bezpiecznym panelu! 🔐</h1>
}


