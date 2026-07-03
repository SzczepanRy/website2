// src/App.tsx
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuth } from './hooks/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient();

export function App() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Ładowanie sesji użytkownika...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        context={{ auth: { isAuthenticated, user } }}
      />
    </QueryClientProvider>

  )
}
