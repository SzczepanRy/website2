// src/App.tsx
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuth } from './hooks/useAuth'

export function App() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Ładowanie sesji użytkownika...</div>
  }

  return (
    <RouterProvider
      router={router}
      context={{ auth: { isAuthenticated, user } }}
    />
  )
}
