import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { getCatalog } from '../lib/api'
import type { CatalogResponse } from '../types/api'

interface CatalogContextValue extends CatalogResponse {
  isLoading: boolean
  refreshCatalog: () => Promise<void>
}

const initialCatalog: CatalogResponse = {
  categories: [],
  collections: [],
  products: [],
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined)

export function CatalogProvider({ children }: PropsWithChildren) {
  const [catalog, setCatalog] = useState<CatalogResponse>(initialCatalog)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCatalog = useCallback(async () => {
    setIsLoading(true)

    try {
      setCatalog(await getCatalog())
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshCatalog()
  }, [refreshCatalog])

  const value = useMemo<CatalogContextValue>(
    () => ({
      ...catalog,
      isLoading,
      refreshCatalog,
    }),
    [catalog, isLoading, refreshCatalog],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)

  if (!context) {
    throw new Error('useCatalog must be used within CatalogProvider')
  }

  return context
}
