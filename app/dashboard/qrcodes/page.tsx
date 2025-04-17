"use client"

import { useEstablishment } from "@/components/establishment-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tableService } from "@/lib/services/table-service"
import { Table } from "@/types/entities"
import { Copy, Download, Printer, QrCode, Share2 } from "lucide-react"
import Link from "next/link"
import * as QRCode from "qrcode"
import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function QRCodesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { currentEstablishment } = useEstablishment()

  useEffect(() => {
    const fetchTables = async () => {
      try {
        if (!currentEstablishment) {
          throw new Error("No establishment found")
        }
        
        const tables = await tableService.getTables(currentEstablishment.id)
        setTables(tables)
      } catch (error) {
        console.error('Error fetching tables:', error)
        toast.error('Erro ao carregar mesas')
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [currentEstablishment])

  const handleViewQRCode = (table: Table) => {
    setSelectedTable(table)
    setDialogOpen(true)
  }

  const handleCustomize = () => {
    setCustomizeDialogOpen(true)
  }

  const generateQRCodeUrl = (tableId: string) => {
    return `${window.location.origin}/cliente/${tableId}/session`
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
        <h1 className="text-2xl font-bold">QR Codes</h1>
        <p className="text-muted-foreground">Gerencie os QR codes das mesas do seu estabelecimento</p>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma mesa cadastrada</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Adicione mesas ao seu estabelecimento para gerar QR codes personalizados.
            </p>
            <Button asChild>
              <Link href="/dashboard/mesas">
                Gerenciar Mesas
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                          <Button variant="ghost" size="icon" onClick={() => handleViewQRCode(table)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => downloadQRCode(generateQRCodeUrl(table.id), table.number, 'download')}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(generateQRCodeUrl(table.id))}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => navigator.share({ url: generateQRCodeUrl(table.id) })}>
                            <Share2 className="h-4 w-4" />
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
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>QR Code - Mesa {selectedTable?.number}</DialogTitle>
                <DialogDescription>
                  Imprima este QR code e coloque na mesa para que os clientes possam fazer pedidos
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-4">
                <div className="w-64 h-64 bg-white flex items-center justify-center rounded-lg mb-4 p-4">
                  {selectedTable && (
                    <QRCodeSVG
                      value={generateQRCodeUrl(selectedTable.id)}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Este QR code redireciona para a página de pedidos da mesa {selectedTable?.number}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" className="gap-1" onClick={() => downloadQRCode(generateQRCodeUrl(selectedTable!.id), selectedTable!.number, 'download')}>
                  <Download className="h-4 w-4" />
                  Baixar
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

