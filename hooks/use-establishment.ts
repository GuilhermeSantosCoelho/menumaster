"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"
import { EstablishmentService, type Establishment } from "@/lib/services/establishment-service"

export function useEstablishment() {
  const { user } = useAuth()
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [currentEstablishment, setCurrentEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Carregar estabelecimentos do usuário
  useEffect(() => {
    async function loadEstablishments() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userEstablishments = await EstablishmentService.getUserEstablishments(user.id)
        setEstablishments(userEstablishments)

        // Se houver estabelecimentos, selecione o primeiro como atual
        if (userEstablishments.length > 0) {
          // Verificar se há um estabelecimento salvo no localStorage
          const savedEstablishmentId = localStorage.getItem("currentEstablishmentId")
          const savedEstablishment = savedEstablishmentId
            ? userEstablishments.find((e) => e.id === savedEstablishmentId)
            : null

          setCurrentEstablishment(savedEstablishment || userEstablishments[0])
        }

        setError(null)
      } catch (err) {
        console.error("Erro ao carregar estabelecimentos:", err)
        setError(err instanceof Error ? err : new Error("Erro desconhecido ao carregar estabelecimentos"))
      } finally {
        setLoading(false)
      }
    }

    loadEstablishments()
  }, [user])

  // Função para alterar o estabelecimento atual
  const changeEstablishment = (establishmentId: string) => {
    const establishment = establishments.find((e) => e.id === establishmentId)
    if (establishment) {
      setCurrentEstablishment(establishment)
      localStorage.setItem("currentEstablishmentId", establishmentId)
    }
  }

  return {
    establishments,
    currentEstablishment,
    loading,
    error,
    changeEstablishment,
  }
}

