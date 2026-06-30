import { createFileRoute, Link } from '@tanstack/react-router'

// 1. Rejestracja ścieżki w routerze (dla strony głównej przekazujemy '/')
export const Route = createFileRoute('/')({
  component: HomeComponent,
})

// 2. Komponent strony głównej
function HomeComponent() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Witaj na stronie głównej! 🚀</h1>
      <p>To jest domyślny szablon wygenerowany dla ścieżki "/"</p>

      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

      <div style={{ display: 'flex', gap: '15px' }}>
        <Link
          to="/dashboard"
          style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Przejdź do Panelu (Wymaga logowania) →
        </Link>

        <Link
          to="/login"
          style={{ color: '#666', textDecoration: 'none' }}
        >
          Zaloguj się
        </Link>
      </div>
    </div>
  )
}
