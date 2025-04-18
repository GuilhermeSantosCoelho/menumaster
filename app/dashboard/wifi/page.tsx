'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useEstablishment } from '@/components/establishment-context'
import { wifiService, WiFiSettings } from '@/lib/services/wifi-service'
import { Switch } from '@/components/ui/switch'

export default function WiFiPage() {
  const { currentEstablishment } = useEstablishment()
  const [settings, setSettings] = useState<WiFiSettings>({
    wifiSsid: '',
    wifiPassword: '',
    showWifiInMenu: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentEstablishment) {
      fetchSettings()
    }
  }, [currentEstablishment])

  const fetchSettings = async () => {
    try {
      const data = await wifiService.getWiFiSettings(currentEstablishment!.id)
      setSettings(data)
    } catch (error) {
      console.error('Error fetching WiFi settings:', error)
      toast.error('Erro ao carregar configurações do WiFi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await wifiService.updateWiFiSettings(currentEstablishment!.id, settings)
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
              value={settings.wifiSsid}
              onChange={(e) => setSettings({ ...settings, wifiSsid: e.target.value })}
              placeholder="Digite o nome da rede WiFi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifi_password">Senha do WiFi</Label>
            <Input
              id="wifi_password"
              type="password"
              value={settings.wifiPassword}
              onChange={(e) => setSettings({ ...settings, wifiPassword: e.target.value })}
              placeholder="Digite a senha do WiFi"
            />
          </div>
          <div className="space-x-2 flex items-center">
            <Label htmlFor="show_wifi_in_menu">Exibir WiFi no Menu</Label>
            <Switch
              id="show_wifi_in_menu"
              checked={settings.showWifiInMenu}
              onCheckedChange={(checked) => setSettings({ ...settings, showWifiInMenu: checked })}
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