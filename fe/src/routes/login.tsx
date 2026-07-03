import { createFileRoute, Link ,useNavigate} from '@tanstack/react-router'
//import { useAuth } from '../hooks/useAuth'
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { LoginFormI } from '../types/types'
import net from '../net/net'
import { useAuth } from '../hooks/useAuth'


export const Route = createFileRoute('/login')({
  component: LoginComponent, // <-- Upewnij się, że to tu jest!
})

function LoginComponent() {

  const { login } = useAuth()
  const navigate = useNavigate()

  const loginMt = useMutation({
    mutationFn: (data: LoginFormI) => net.fetchLogin(data),
    onSuccess: (resdata) => {
      if (resdata && resdata.access) {
        login(resdata.access)
        navigate({ to: '/' })
      }
    },
    onError: (error) => {
      console.error("Błąd logowania:", error)
    }
  });

  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    const loginstr = loginRef.current?.value ?? "" //nowostka ?? XD
    const passwordstr = passwordRef.current?.value ?? ""
    loginMt.mutate({ login: loginstr, password: passwordstr })
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <span className="auth-label">Konto</span>
          <h1 className="auth-title">Logowanie</h1>
        </div>

        <div className="auth-body">
          <div className="auth-field">
            <span className="auth-field-label">Login</span>
            <input type="text" ref={loginRef} />
          </div>
          <div className="auth-field">
            <span className="auth-field-label">Hasło</span>
            <input type="password" ref={passwordRef} />
          </div>
          <button className="auth-submit" onClick={handleLogin}>Zaloguj się</button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer-label">Nie masz konta?</span>
          <Link to="/register">zarejestruj się</Link>
        </div>
      </div>
    </div>
  )
}
