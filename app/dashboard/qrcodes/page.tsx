"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Printer, Copy, Share2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import * as QRCode from "qrcode"

type Table = {
  id: string
  number: number
  qr_code_url: string | null
  establishment_id: string
}

export default function QRCodesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndTables = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', user.id)
          .single()
        
        if (establishment) {
          setUser({ ...user, establishment_id: establishment.id })
          
          const { data: tables, error } = await supabase
            .from('tables')
            .select('*')
            .eq('establishment_id', establishment.id)
            .order('number')
          
          if (error) {
            console.error('Error fetching tables:', error)
            toast.error('Erro ao carregar mesas')
          } else {
            setTables(tables || [])
          }
        }
      }
      setLoading(false)
    }

    fetchUserAndTables()
  }, [])

  const handleViewQRCode = (table: Table) => {
    setSelectedTable(table)
    setDialogOpen(true)
  }

  const handleCustomize = () => {
    setCustomizeDialogOpen(true)
  }

  const generateQRCodeUrl = (tableId: string) => {
    return `${window.location.origin}/cliente/${tableId}`
  }

  const downloadQRCode = async (url: string, tableNumber: number, action: 'download' | 'print') => {
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      const link = document.createElement('a');
      link.download = `qr-code-mesa-${tableNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error(error);
      toast.error(`Erro ao gerar QR code para ${action === 'download' ? 'download' : 'impressão'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        <p className="text-muted-foreground">Gerencie os QR codes das mesas do seu estabelecimento</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button onClick={handleCustomize} className="gap-2">
            <QrCode className="h-4 w-4" />
            Personalizar QR Codes
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir Todos
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Baixar Todos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grade</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex justify-center">
                  <div className="w-32 h-32 bg-white flex items-center justify-center rounded-md p-2">
                    <QRCodeSVG
                      value={generateQRCodeUrl(table.id)}
                      size={120}
                      level="H"
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleViewQRCode(table)}>
                    Ver QR Code
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => downloadQRCode(generateQRCodeUrl(table.id), table.number, 'download')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-3 p-4 bg-muted text-sm font-medium">
                  <div>Mesa</div>
                  <div>QR Code</div>
                  <div>Ações</div>
                </div>

                {tables.map((table) => (
                  <div key={table.id} className="grid grid-cols-3 p-4 border-t items-center">
                    <div className="font-medium">Mesa {table.number}</div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white flex items-center justify-center rounded-md mr-2 p-1">
                        <QRCodeSVG
                          value={generateQRCodeUrl(table.id)}
                          size={40}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{generateQRCodeUrl(table.id)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" title="Copiar Link" onClick={() => {
                        navigator.clipboard.writeText(generateQRCodeUrl(table.id))
                        toast.success('Link copiado com sucesso!')
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Compartilhar" onClick={() => {
                        navigator.share({
                          title: `Mesa ${table.number}`,
                          text: `Acesse o menu digital da Mesa ${table.number}`,
                          url: generateQRCodeUrl(table.id)
                        })
                      }}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewQRCode(table)}>
                        Ver QR Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>QR Code - Mesa {selectedTable?.number}</DialogTitle>
            <DialogDescription>Escaneie este QR code para acessar o menu digital</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-64 h-64 bg-white flex items-center justify-center rounded-lg mb-4 p-4">
              <QRCodeSVG
                value={selectedTable ? generateQRCodeUrl(selectedTable.id) : ''}
                size={240}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Este QR code redireciona para a página de pedidos da mesa {selectedTable?.number}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="gap-1 sm:flex-1" onClick={() => selectedTable && downloadQRCode(generateQRCodeUrl(selectedTable.id), selectedTable.number, 'print')}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" className="gap-1 sm:flex-1" onClick={() => selectedTable && downloadQRCode(generateQRCodeUrl(selectedTable.id), selectedTable.number, 'download')}>
              <Download className="h-4 w-4" />
              Baixar
            </Button>
            <Button className="sm:flex-1" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Personalizar QR Codes</DialogTitle>
            <DialogDescription>Personalize a aparência dos QR codes do seu estabelecimento</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cor-primaria">Cor Primária</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="cor-primaria" type="color" defaultValue="#000000" className="w-12 h-10 p-1" />
                  <Input defaultValue="#000000" className="flex-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="cor-fundo">Cor de Fundo</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="cor-fundo" type="color" defaultValue="#FFFFFF" className="w-12 h-10 p-1" />
                  <Input defaultValue="#FFFFFF" className="flex-1" />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="logo">Logo (opcional)</Label>
              <Input id="logo" type="file" className="mt-1" />
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="w-32 h-32 bg-white flex items-center justify-center rounded-md border">
                <QrCode className="h-20 w-20 text-black" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Pré-visualização</p>
                <p>Seu QR code personalizado aparecerá assim para seus clientes.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomizeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setCustomizeDialogOpen(false)}>Salvar Personalização</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

