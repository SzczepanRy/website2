import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">Witaj na stronie głównej!</h1>
        <p className="home-sub">To jest domyślny szablon wygenerowany dla ścieżki "/"</p>
      </div>

      <hr className="home-divider" />

      <div className="home-nav">



        {/*
        <Link
          to="/dashboard"
          className="home-nav-link primary"
        >
          Przejdź do Panelu →
        </Link>

        <Link
          to="/login"
          className="home-nav-link"
        >
          Zaloguj się
        </Link>

        <Link
          to="/register"
          className="home-nav-link"
        >
          Zarejestruj się
        </Link>
        */}
      </div>
    </div>
  )
}
