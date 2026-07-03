import React, { createContext,  useState, useEffect } from 'react'
import net from '../net/net'
import { useMutation } from '@tanstack/react-query'

interface AuthContextType {
  isAuthenticated: boolean
  access: string| null
  isLoading: boolean
  login: (access: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)


  const refreshMt = useMutation({
    mutationFn: () => net.fetchRefresh(),
    onSuccess: (data) => {
      if (data && data.access) {
        login(data.access)
      }
    },
    onError: () => {
      logout()
    },
    onSettled: () => {
      setIsLoading(false)
    }
  });

  useEffect(() => {
    const accessLocal= localStorage.getItem('access_token')
    if (accessLocal) {
      setAccess(accessLocal)
      setIsLoading(false)
    }else {
      refreshMt.mutate()
    }

  }, [])

  const login = (access: string) => {
    setAccess(access)
    localStorage.setItem('access_token', access)
  }

  const logout = () => {
    setAccess(null)
    localStorage.removeItem('access_token')
  }

  const isAuthenticated = !!access// true jeśli istnieje, false jeśli null

  return (
    <AuthContext.Provider value={{ isAuthenticated, access, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. Eksportujemy sam wewnętrzny kontekst na wypadek specyficznych potrzeb
export { AuthContext }
