import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'


export const Route = createFileRoute('/login')({
  component: LoginComponent, // <-- Upewnij się, że to tu jest!
})

function LoginComponent() {
  const { login } = useAuth()

  const handleLogin = () => {
    // test
    login({ name: 'Jan Kowalski', email: 'jan@wp.pl' })
  }

  return <button onClick={handleLogin}>Zaloguj się</button>
}
