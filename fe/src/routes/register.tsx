import { createFileRoute, Link } from '@tanstack/react-router'
//import { useAuth } from '../hooks/useAuth'
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import type {  RegisterFormI } from '../types/types'
import net from '../net/net'


export const Route = createFileRoute('/register')({
  component: RegisterComponent,
})

function RegisterComponent() {

  const registerMt= useMutation({ mutationFn: (data: RegisterFormI) => net.fetchRegister(data) });

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
    <>
      <div>
        <input type="text" ref={loginRef} />
        <input type="email" ref={emailRef} />
        <input type="password" ref={passwordRef} />
        <button onClick={handleRegister}>Zarejestruj się</button>
      </div>
        <Link
          to="/login"
          style={{ color: '#666', textDecoration: 'none' }}
        >
          zaloguj się
        </Link>

    </>

  )
}
