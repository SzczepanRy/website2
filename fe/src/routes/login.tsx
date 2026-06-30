import { createFileRoute } from '@tanstack/react-router'
//import { useAuth } from '../hooks/useAuth'
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { LoginFormI } from '../types/types'
import net from '../net/net'


export const Route = createFileRoute('/login')({
  component: LoginComponent, // <-- Upewnij się, że to tu jest!
})

function LoginComponent() {
  //const { login } = useAuth()

  const loginMt = useMutation({ mutationFn: (data: LoginFormI) => net.fetchLogin(data) });


  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    const loginstr = loginRef.current?.value ?? "" //nowostka ?? XD
    const passwordstr = passwordRef.current?.value ?? ""
    console.log(loginstr , passwordstr)
    loginMt.mutate({ login: loginstr, password: passwordstr })
    //login({ name: 'Jan Kowalski', email: 'jan@wp.pl' })
  }

  return (
    <>
      <div>

        <input type="text" ref={loginRef} />
        <input type="text" ref={passwordRef} />

        <button onClick={handleLogin}>Zaloguj się</button>

      </div>

    </>

  )
}
