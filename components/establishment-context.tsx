"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { establishmentService } from "@/lib/services/establishment-service"
import { Establishment } from "@/types/entities"

interface EstablishmentContextType {
  establishments: Establishment[]
  currentEstablishment: Establishment | null
  loading: boolean
  error: Error | null
  changeEstablishment: (establishmentId: string) => void
}

const EstablishmentContext = createContext<EstablishmentContextType | undefined>(undefined)

export function EstablishmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [currentEstablishment, setCurrentEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadEstablishments() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userEstablishments = await establishmentService.getEstablishments(user.id)
        setEstablishments(userEstablishments)

        console.log('userEstablishments', userEstablishments)

        // Se não houver estabelecimentos, redirecione para criar um
        if (userEstablishments.length === 0) {
          toast.error("Você não possui nenhum estabelecimento. Crie um para continuar.")
          router.push("/dashboard/novo-estabelecimento")
          return
        }

        // Verificar se há um estabelecimento salvo no localStorage
        const savedEstablishmentId = localStorage.getItem("currentEstablishmentId")
        const savedEstablishment = savedEstablishmentId
          ? userEstablishments.find((e: Establishment) => e.id === savedEstablishmentId)
          : null

        setCurrentEstablishment(savedEstablishment || userEstablishments[0])
        setError(null)
      } catch (err) {
        console.error("Erro ao carregar estabelecimentos:", err)
        setError(err instanceof Error ? err : new Error("Erro desconhecido ao carregar estabelecimentos"))
        toast.error("Erro ao carregar estabelecimentos")
      } finally {
        setLoading(false)
      }
    }
    if (establishments.length === 0) {
      loadEstablishments()
    }
  }, [user, router, establishments])

  const changeEstablishment = (establishmentId: string) => {
    const establishment = establishments.find((e) => e.id === establishmentId)
    if (establishment) {
      setCurrentEstablishment(establishment)
      localStorage.setItem("currentEstablishmentId", establishmentId)
      toast.success(`Estabelecimento alterado para ${establishment.name}`)
    }
  }

  return (
    <EstablishmentContext.Provider
      value={{
        establishments,
        currentEstablishment,
        loading,
        error,
        changeEstablishment,
      }}
    >
      {children}
    </EstablishmentContext.Provider>
  )
}

export function useEstablishment() {
  const context = useContext(EstablishmentContext)
  if (context === undefined) {
    throw new Error("useEstablishment deve ser usado dentro de um EstablishmentProvider")
  }
  return context
}

