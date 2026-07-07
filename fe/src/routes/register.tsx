import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
//import { useAuth } from '../hooks/useAuth'
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { RegisterFormI } from '../types/types'
import net from '../net/net'


export const Route = createFileRoute('/register')({
  component: RegisterComponent,
})

function RegisterComponent() {

  const registerMt= useMutation({ mutationFn: (data: RegisterFormI) => net.fetchRegister(data) ,
    onSuccess: (resdata) => {
      if (resdata ) {
        navigate({ to: '/login' })
      }
    },
  });

  const navigate = useNavigate()

  const loginRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleRegister= () => {
    const loginstr = loginRef.current?.value ?? "" //nowostka ?? XD
    const emailstr = emailRef.current?.value ?? ""
    const passwordstr = passwordRef.current?.value ?? ""
    registerMt.mutate({ login: loginstr,email:emailstr,  password: passwordstr })
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <span className="auth-label">Nowe konto</span>
          <h1 className="auth-title">Rejestracja</h1>
        </div>

        <div className="auth-body">
          <div className="auth-field">
            <span className="auth-field-label">Login</span>
            <input type="text" ref={loginRef} />
          </div>
          <div className="auth-field">
            <span className="auth-field-label">Email</span>
            <input type="email" ref={emailRef} />
          </div>
          <div className="auth-field">
            <span className="auth-field-label">Hasło</span>
            <input type="password" ref={passwordRef} />
          </div>
          <button className="auth-submit" onClick={handleRegister}>Zarejestruj się</button>
        </div>

        <div className="auth-footer">
          <span className="auth-footer-label">Masz konto?</span>
          <Link to="/login">zaloguj się</Link>
        </div>
      </div>
    </div>
  )
}
