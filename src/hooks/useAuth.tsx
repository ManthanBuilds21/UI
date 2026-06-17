import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  clearStoredSession,
  getCurrentUser,
  getStoredSession,
  login as loginRequest,
  saveStoredSession,
  signup as signupRequest,
} from '../lib/api'
import type { AuthSession, AuthUser } from '../types/api'

interface AuthContextValue {
  session: AuthSession | null
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isReady: boolean
  login: (payload: {
    email: string
    password: string
    role: 'user' | 'admin'
  }) => Promise<AuthSession>
  signup: (payload: {
    name: string
    email: string
    password: string
    role: 'user' | 'admin'
  }) => Promise<AuthSession>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const storedSession = getStoredSession()

    if (!storedSession) {
      setIsReady(true)
      return
    }

    void getCurrentUser(storedSession.token)
      .then((user) => {
        const nextSession = {
          token: storedSession.token,
          user,
        }

        saveStoredSession(nextSession)
        setSession(nextSession)
      })
      .catch(() => {
        clearStoredSession()
        setSession(null)
      })
      .finally(() => {
        setIsReady(true)
      })
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (payload) => {
    const nextSession = await loginRequest(payload)
    saveStoredSession(nextSession)
    setSession(nextSession)
    return nextSession
  }, [])

  const signup = useCallback<AuthContextValue['signup']>(async (payload) => {
    const nextSession = await signupRequest(payload)
    saveStoredSession(nextSession)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      isReady,
      login,
      signup,
      logout,
    }),
    [isReady, login, logout, session, signup],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
