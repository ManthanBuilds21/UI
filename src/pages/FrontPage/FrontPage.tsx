import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck, UserRound, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface FigurineImage {
  src: string
  bg: string
  panel: string
}

type AuthRole = 'user' | 'admin'
type AuthMode = 'login' | 'signup'
type CarouselRole = 'center' | 'left' | 'right' | 'back'

const IMAGES: FigurineImage[] = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
    panel: '#F79B7F',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
    panel: '#85CC92',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
    panel: '#ED9DC4',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
  },
]

const TRANSITION_MS = 650
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const GRAIN_OVERLAY =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.08'/%3E%3C/svg%3E"

const itemTransition = `transform ${TRANSITION_MS}ms ${EASE}, filter ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}, left ${TRANSITION_MS}ms ${EASE}`

function getRoleStyle(role: CarouselRole, isMobile: boolean): CSSProperties {
  switch (role) {
    case 'center':
      return {
        left: '50%',
        height: isMobile ? '60%' : '92%',
        bottom: isMobile ? '22%' : 0,
        transform: `translateX(-50%) scale(${isMobile ? 1.25 : 1.68})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
      }
    case 'left':
      return {
        left: isMobile ? '20%' : '30%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
      }
    case 'right':
      return {
        left: isMobile ? '80%' : '70%',
        height: isMobile ? '16%' : '28%',
        bottom: isMobile ? '32%' : '12%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
      }
    case 'back':
      return {
        left: '50%',
        height: isMobile ? '13%' : '22%',
        bottom: isMobile ? '32%' : '12%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(4px)',
        opacity: 1,
        zIndex: 5,
      }
  }
}

export default function FrontPage() {
  const navigate = useNavigate()
  const { login, signup } = useAuth()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
  )
  const [authRole, setAuthRole] = useState<AuthRole>('user')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authOpen, setAuthOpen] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    IMAGES.forEach((image) => {
      const preload = new Image()
      preload.src = image.src
    })
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigateCarousel = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return
      setIsAnimating(true)
      setActiveIndex((prev) =>
        direction === 'next' ? (prev + 1) % 4 : (prev + 3) % 4,
      )
      window.setTimeout(() => setIsAnimating(false), TRANSITION_MS)
    },
    [isAnimating],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (authMode === 'signup' && formState.password !== formState.confirmPassword) {
      window.alert('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      if (authMode === 'login') {
        await login({
          email: formState.email,
          password: formState.password,
          role: authRole,
        })
      } else {
        await signup({
          name: formState.name,
          email: formState.email,
          password: formState.password,
          role: authRole,
        })
      }

      setAuthOpen(false)
      setFormState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      navigate(authRole === 'admin' ? '/admin' : '/website')
    } catch (error) {
      window.alert(
        error instanceof ApiError ? error.message : 'We could not complete authentication.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const center = activeIndex
  const left = (activeIndex + 3) % 4
  const right = (activeIndex + 1) % 4
  const back = (activeIndex + 2) % 4

  const roleByIndex: Record<number, CarouselRole> = {
    [center]: 'center',
    [left]: 'left',
    [right]: 'right',
    [back]: 'back',
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: `background-color ${TRANSITION_MS}ms ${EASE}`,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="relative w-full" style={{ height: '100vh', overflow: 'hidden' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: `url("${GRAIN_OVERLAY}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            zIndex: 2,
            top: '18%',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(90px, 28vw, 380px)',
            fontWeight: 900,
            color: '#ffffff',
            opacity: 1,
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          3D SHAPE
        </div>

        <div
          className="absolute top-6 left-4 text-xs font-semibold uppercase sm:left-8"
          style={{ zIndex: 60, color: '#ffffff', opacity: 0.9, letterSpacing: '0.18em' }}
        >
          OUR COLLECTION
        </div>

        <div
          className="absolute right-4 top-6 flex items-center gap-2 sm:right-8"
          style={{ zIndex: 60 }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthRole('user')
              setAuthMode('login')
              setAuthOpen(true)
            }}
            className="hidden rounded-full border border-white/25 bg-white/[0.14] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white backdrop-blur transition-colors duration-150 hover:bg-white/[0.2] sm:inline-flex"
          >
            Login / Sign Up
          </button>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/[0.14] text-white backdrop-blur transition-colors duration-150 hover:bg-white/[0.2]"
            aria-label="Open account access"
          >
            {authRole === 'admin' ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {authOpen ? (
            <motion.div
              className="absolute inset-0"
              style={{ zIndex: 70 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
                onClick={() => setAuthOpen(false)}
              />

              <motion.div
                key={`${authRole}-${authMode}`}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-4 top-16 w-[calc(100%-2rem)] max-w-[360px] rounded-[24px] border border-white/25 bg-white/10 p-3 text-white shadow-[0_18px_60px_rgba(17,17,17,0.18)] backdrop-blur-xl sm:right-8 sm:top-20 sm:p-4"
              >
                <div className="pointer-events-none absolute inset-x-8 top-14 h-20 rounded-full bg-white/25 blur-2xl" />
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex rounded-full border border-white/20 bg-black/10 p-1">
                    <button
                      type="button"
                      onClick={() => setAuthRole('user')}
                      className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${
                        authRole === 'user' ? 'bg-white text-black' : 'text-white/70'
                      }`}
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('admin')}
                      className={`rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${
                        authRole === 'admin' ? 'bg-[#d98b69] text-white' : 'text-white/70'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-white transition-colors duration-150 hover:bg-white/[0.16]"
                    aria-label="Close account access"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mt-3 flex rounded-full border border-white/20 bg-black/10 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${
                      authMode === 'login' ? 'bg-white text-black' : 'text-white/72'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors ${
                      authMode === 'signup' ? 'bg-[#d98b69] text-white' : 'text-white/72'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="relative mt-3 grid gap-2.5">
                  {authMode === 'signup' ? (
                    <input
                      value={formState.name}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder={authRole === 'admin' ? 'Admin name' : 'Full name'}
                      className="rounded-[16px] border border-white/18 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55"
                    />
                  ) : null}
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder={authRole === 'admin' ? 'Admin email' : 'Email address'}
                    className="rounded-[16px] border border-white/18 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55"
                  />
                  <input
                    type="password"
                    value={formState.password}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Password"
                    className="rounded-[16px] border border-white/18 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55"
                  />
                  {authMode === 'signup' ? (
                    <input
                      type="password"
                      value={formState.confirmPassword}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Confirm password"
                      className="rounded-[16px] border border-white/18 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/55"
                    />
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 rounded-full bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black transition-[transform,opacity] duration-150 hover:scale-[1.02]"
                  >
                    {isSubmitting
                      ? 'Please Wait'
                      : authMode === 'login'
                      ? authRole === 'admin'
                        ? 'Admin Login'
                        : 'Continue'
                      : authRole === 'admin'
                        ? 'Create Admin'
                        : 'Create Account'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {IMAGES.map((image, index) => {
            const role = roleByIndex[index]
            const roleStyle = getRoleStyle(role, isMobile)

            return (
              <div
                key={image.src}
                className="absolute"
                style={{
                  aspectRatio: '0.6 / 1',
                  transition: itemTransition,
                  willChange: 'transform, filter, opacity',
                  ...roleStyle,
                }}
              >
                <img
                  src={image.src}
                  alt={`TOONHUB figurine ${index + 1}`}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                  }}
                />
              </div>
            )
          })}
        </div>

        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: '320px' }}
        >
          <p
            className="mb-2 text-base font-bold uppercase tracking-widest sm:mb-3 sm:text-[22px]"
            style={{ color: '#ffffff', opacity: 0.95, letterSpacing: '0.02em' }}
          >
            OUR Clothing
          </p>
          <p
            className="mb-4 hidden text-xs sm:mb-5 sm:block sm:text-sm"
            style={{ color: '#ffffff', opacity: 0.85, lineHeight: 1.6 }}
          >
            "Fashion is the armor to survive the reality of everyday life."
            Built for the streets, shaped for presence, and made to wear with intent.
          </p>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigateCarousel('prev')}
              aria-label="Previous figurine"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-transparent text-white transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/[0.12] sm:h-16 sm:w-16"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => navigateCarousel('next')}
              aria-label="Next figurine"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-transparent text-white transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/[0.12] sm:h-16 sm:w-16"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/website')}
          className="absolute bottom-6 right-4 flex items-center gap-2 opacity-95 transition-opacity duration-200 hover:opacity-100 sm:bottom-20 sm:right-10 sm:gap-3"
          style={{
            zIndex: 60,
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(20px, 4vw, 56px)',
            fontWeight: 400,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            textDecoration: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Discover it
          <ArrowRight className="h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}
