'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface WiFiSettings {
  wifi_ssid: string
  wifi_password: string
}

export default function WiFiPage() {
  const [settings, setSettings] = useState<WiFiSettings>({
    wifi_ssid: '',
    wifi_password: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('establishments')
          .select('wifi_ssid, wifi_password')
          .eq('owner_id', user.id)
          .single()

        console.log('data', data)

        if (error) throw error

        if (data) {
          setSettings({
            wifi_ssid: data.wifi_ssid || '',
            wifi_password: data.wifi_password || '',
          })
        }
      } catch (error) {
        console.error('Error fetching WiFi settings:', error)
        toast.error('Erro ao carregar configurações do WiFi')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('establishments')
        .update({
          wifi_ssid: settings.wifi_ssid,
          wifi_password: settings.wifi_password,
        })
        .eq('owner_id', user.id)

      if (error) throw error

      toast.success('Configurações do WiFi salvas com sucesso!')
    } catch (error) {
      console.error('Error saving WiFi settings:', error)
      toast.error('Erro ao salvar configurações do WiFi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configurações do WiFi</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wifi_ssid">Nome da Rede (SSID)</Label>
            <Input
              id="wifi_ssid"
              value={settings.wifi_ssid}
              onChange={(e) => setSettings({ ...settings, wifi_ssid: e.target.value })}
              placeholder="Digite o nome da rede WiFi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifi_password">Senha do WiFi</Label>
            <Input
              id="wifi_password"
              type="password"
              value={settings.wifi_password}
              onChange={(e) => setSettings({ ...settings, wifi_password: e.target.value })}
              placeholder="Digite a senha do WiFi"
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Como funciona?</h2>
          <p className="text-sm text-muted-foreground">
            As informações do WiFi serão exibidas na página do cliente, permitindo que eles se conectem facilmente à sua rede.
            O cliente pode tocar no botão de conexão para ser redirecionado às configurações de WiFi do dispositivo.
          </p>
        </div>
      </div>
    </div>
  )
} 