import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  addCartItem,
  ApiError,
  checkoutRequest,
  getStore,
  removeCartItemRequest,
  toggleWishlistRequest,
  updateCartItemRequest,
} from '../lib/api'
import { useAuth } from './useAuth'
import type { CartItem, CheckoutOrder, StoreSnapshot } from '../types/api'

interface StoreContextValue {
  cart: CartItem[]
  wishlist: string[]
  cartCount: number
  subtotal: number
  isLoading: boolean
  isMutating: boolean
  addToCart: (productId: string, size: string, quantity: number) => Promise<boolean>
  updateCartItem: (productId: string, size: string, quantity: number) => Promise<boolean>
  removeCartItem: (productId: string, size: string) => Promise<boolean>
  toggleWishlist: (productId: string) => Promise<boolean>
  isWishlisted: (productId: string) => boolean
  checkout: () => Promise<CheckoutOrder | null>
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined)

const emptyStore: StoreSnapshot = {
  cart: [],
  wishlist: [],
  cartCount: 0,
  subtotal: 0,
}

export function StoreProvider({ children }: PropsWithChildren) {
  const { logout, session, isReady } = useAuth()
  const [store, setStore] = useState<StoreSnapshot>(emptyStore)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    if (!isReady) {
      return
    }

    if (!session) {
      setStore(emptyStore)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    void getStore(session.token)
      .then((snapshot) => {
        setStore(snapshot)
      })
      .catch((error) => {
        console.error(error)

        if (error instanceof ApiError && error.status === 401) {
          logout()
        }

        setStore(emptyStore)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [isReady, logout, session])

  const requireToken = (message: string) => {
    if (!session?.token) {
      window.alert(message)
      return null
    }

    return session.token
  }

  const handleMutationError = (error: unknown, fallbackMessage: string) => {
    console.error(error)

    if (error instanceof ApiError && error.status === 401) {
      logout()
      window.alert('Your session expired. Please log in again.')
      return
    }

    window.alert(fallbackMessage)
  }

  const value = useMemo<StoreContextValue>(() => {
    const runMutation = async (
      message: string,
      fallbackMessage: string,
      action: (token: string) => Promise<StoreSnapshot>,
    ) => {
      const token = requireToken(message)

      if (!token) {
        return false
      }

      setIsMutating(true)

      try {
        const nextStore = await action(token)
        setStore(nextStore)
        return true
      } catch (error) {
        handleMutationError(error, fallbackMessage)
        return false
      } finally {
        setIsMutating(false)
      }
    }

    return {
      ...store,
      isLoading,
      isMutating,
      addToCart: (productId, size, quantity) =>
        runMutation(
          'Please log in to save products to your cart.',
          'We could not update your cart right now.',
          (token) => addCartItem(token, { productId, size, quantity }),
        ),
      updateCartItem: (productId, size, quantity) =>
        runMutation(
          'Please log in to update your cart.',
          'We could not update your cart right now.',
          (token) => updateCartItemRequest(token, { productId, size, quantity }),
        ),
      removeCartItem: (productId, size) =>
        runMutation(
          'Please log in to update your cart.',
          'We could not remove that cart item right now.',
          (token) => removeCartItemRequest(token, { productId, size }),
        ),
      toggleWishlist: (productId) =>
        runMutation(
          'Please log in to save products to your wishlist.',
          'We could not update your wishlist right now.',
          (token) => toggleWishlistRequest(token, { productId }),
        ),
      isWishlisted: (productId) => store.wishlist.includes(productId),
      checkout: async () => {
        const token = requireToken('Please log in before checking out.')

        if (!token) {
          return null
        }

        setIsMutating(true)

        try {
          const response = await checkoutRequest(token)
          setStore(response.store)
          return response.order
        } catch (error) {
          handleMutationError(error, 'We could not complete checkout right now.')
          return null
        } finally {
          setIsMutating(false)
        }
      },
    }
  }, [isLoading, isMutating, logout, session, store])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }

  return context
}
