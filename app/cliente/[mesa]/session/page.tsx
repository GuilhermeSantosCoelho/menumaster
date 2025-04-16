"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { sessionService } from "@/lib/services/session-service"

export default function ClienteSession({ params }: { params: { mesa: string } }) {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const isValid = await sessionService.validateSession(params.mesa)
        
        if (!isValid) {
          toast.error('Esta mesa está fechada. Por favor, entre em contato com um garçom.')
          router.push('/')
          return
        }

        const table = await sessionService.getTableSession(params.mesa)
        router.push(`/cliente/${table.number}?session=${table.sessionUuid}`)
      } catch (error) {
        console.error('Error checking session:', error)
        toast.error('Erro ao verificar sessão da mesa')
        router.push('/')
      }
    }

    checkSession()
  }, [params.mesa, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verificando sessão...</p>
      </div>
    </div>
  )
} 