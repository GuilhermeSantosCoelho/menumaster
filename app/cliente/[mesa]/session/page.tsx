"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function ClienteSession({ params }: { params: { mesa: string } }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get table information
        const { data: table, error: tableError } = await supabase
          .from('tables')
          .select('id, session_uuid')
          .eq('id', params.mesa)
          .single()

        if (tableError) throw tableError
        if (!table) throw new Error('Table not found')

        // Redirect to the main page with the session UUID
        router.push(`/cliente/${table.id}?session=${table.session_uuid}`)
      } catch (error) {
        console.error('Error checking session:', error)
        toast.error('Erro ao verificar sessão da mesa')
        router.push('/')
      }
    }

    checkSession()
  }, [params.mesa, router, supabase])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verificando sessão...</p>
      </div>
    </div>
  )
} 