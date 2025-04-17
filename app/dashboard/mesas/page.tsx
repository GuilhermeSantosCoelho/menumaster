"use client"

import { useState, useEffect } from "react"
import { Download, Edit, MoreHorizontal, Plus, QrCode, Trash } from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useEstablishment } from "@/components/establishment-context"
import { tableService } from "@/lib/services/table-service"
import { Table, TableStatus } from "@/types/entities"

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case "FREE":
      return "bg-green-500"
    case "OCCUPIED":
      return "bg-red-500"
    case "RESERVED":
      return "bg-amber-500"
    case "MAINTENANCE":
      return "bg-slate-500"
  }
}

const getStatusText = (status: TableStatus) => {
  switch (status) {
    case "FREE":
      return "Livre"
    case "OCCUPIED":
      return "Ocupada"
    case "RESERVED":
      return "Reservada"
    case "MAINTENANCE":
      return "Manutenção"
  }
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openQRDialog, setOpenQRDialog] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { currentEstablishment } = useEstablishment()

  useEffect(() => {
    fetchTables()
  }, [currentEstablishment])

  const fetchTables = async () => {
    try {
      setLoading(true)
      
      if (!currentEstablishment) {
        throw new Error("No establishment found")
      }

      const tables = await tableService.getTables(currentEstablishment.id)
      setTables(tables)
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast.error("Erro ao carregar mesas")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = async (formData: HTMLFormElement) => {
    try {
      setSaving(true)
      
      if (!currentEstablishment) {
        throw new Error("No establishment found")
      }

      const form = new FormData(formData)
      const tableData = {
        number: parseInt(form.get('number') as string),
        capacity: parseInt(form.get('capacity') as string),
        status: form.get('status') as TableStatus,
        active: (form.get('active') as string) === 'on',
        establishmentId: currentEstablishment.id,
        qrCodeUrl: undefined,
        sessionUuid: crypto.randomUUID()
      }

      if (editingTable) {
        await tableService.updateTable(editingTable.id, tableData)
        toast.success("Mesa atualizada com sucesso")
      } else {
        await tableService.addTable(tableData)
        toast.success("Mesa adicionada com sucesso")
      }

      setOpenDialog(false)
      setEditingTable(null)
      fetchTables()
    } catch (error) {
      console.error('Error saving table:', error)
      toast.error("Erro ao salvar mesa")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTable = async (id: string) => {
    try {
      await tableService.deleteTable(id)
      setTables(tables.filter((t) => t.id !== id))
      toast.success("Mesa removida com sucesso")
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error("Erro ao remover mesa")
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await tableService.toggleTableActive(id, !currentActive)
      setTables(tables.map(table => 
        table.id === id ? { ...table, active: !currentActive } : table
      ))
    } catch (error) {
      console.error('Error toggling active status:', error)
      toast.error("Erro ao atualizar status da mesa")
    }
  }

  const getTableUrl = (tableId: string) => {
    // Get the current domain
    const protocol = window.location.protocol
    const host = window.location.host
    return `${protocol}//${host}/cliente/${tableId}/session`
  }

  const handleDownloadQRCode = () => {
    if (!selectedTable) return

    const canvas = document.getElementById('qrcode-canvas') as HTMLCanvasElement
    if (!canvas) return

    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `mesa-${selectedTable.number}-qrcode.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mesas</h1>
          <p className="text-muted-foreground">Gerencie as mesas do seu estabelecimento</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Editar Mesa" : "Adicionar Nova Mesa"}</DialogTitle>
              <DialogDescription>Preencha os dados da mesa para adicioná-la ao seu estabelecimento</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddTable(e.currentTarget)
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="number">Número</Label>
                    <Input 
                      id="number" 
                      name="number"
                      type="number" 
                      placeholder="Ex: 10" 
                      defaultValue={editingTable?.number || ""} 
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacidade</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      placeholder="Ex: 4"
                      defaultValue={editingTable?.capacity || ""}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue={editingTable?.status || "FREE"}
                    required
                  >
                    <option value="FREE">Livre</option>
                    <option value="OCCUPIED">Ocupada</option>
                    <option value="RESERVED">Reservada</option>
                    <option value="MAINTENANCE">Manutenção</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="active" 
                    name="active"
                    defaultChecked={editingTable?.active ?? true} 
                  />
                  <Label htmlFor="active">Mesa ativa</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDialog(false)
                    setEditingTable(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : (editingTable ? "Salvar" : "Adicionar")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openQRDialog} onOpenChange={setOpenQRDialog}>
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
                    id="qrcode-canvas"
                    value={getTableUrl(selectedTable.id)}
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
              <Button variant="outline" className="gap-1" onClick={handleDownloadQRCode}>
                <Download className="h-4 w-4" />
                Baixar
              </Button>
              <Button onClick={() => setOpenQRDialog(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl">Todas as Mesas</CardTitle>
          <CardDescription>
            {loading ? "Carregando..." : `${tables.length} mesas cadastradas • ${tables.filter((t) => t.active).length} ativas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">Carregando mesas...</div>
            ) : tables.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">Nenhuma mesa encontrada.</div>
            ) : (
              tables.map((table) => (
                <div key={table.id} className={`border rounded-lg p-4 ${!table.active ? "opacity-70" : ""}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Mesa {table.number}</h3>
                    <Badge variant={table.active ? "outline" : "secondary"}>{table.active ? "Ativa" : "Inativa"}</Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`} />
                      <span>{getStatusText(table.status)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Capacidade: {table.capacity} pessoas</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Switch checked={table.active} onCheckedChange={() => handleToggleActive(table.id, table.active)} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedTable(table)
                          setOpenQRDialog(true)
                        }} className="gap-2 cursor-pointer">
                          <QrCode className="h-4 w-4" />
                          Ver QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditingTable(table)
                          setOpenDialog(true)
                        }} className="gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteTable(table.id)}
                          className="gap-2 text-red-600 cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

