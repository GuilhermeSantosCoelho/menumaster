"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, CreditCard, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { invoiceService, Invoice, InvoiceStatus } from "@/lib/services/invoice-service"

const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case "paga":
      return <Badge className="bg-green-500">Paga</Badge>
    case "pendente":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          Pendente
        </Badge>
      )
    case "atrasada":
      return <Badge className="bg-red-500">Atrasada</Badge>
  }
}

const getStatusIcon = (status: InvoiceStatus) => {
  switch (status) {
    case "paga":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "pendente":
      return <Clock className="h-5 w-5 text-amber-500" />
    case "atrasada":
      return <AlertCircle className="h-5 w-5 text-red-500" />
  }
}

export default function FaturasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todas")
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<{
    plano: string
    valor: number
    limiteMesas: number
    metodoPagamento: string
    proximaCobranca: string
    status: 'ativa' | 'inativa'
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [search, statusFilter, invoices])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [invoicesData, subscriptionData] = await Promise.all([
        invoiceService.getInvoices(),
        invoiceService.getCurrentSubscription()
      ])
      setInvoices(invoicesData)
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = async () => {
    try {
      let filtered = invoices
      
      if (statusFilter !== "todas") {
        filtered = await invoiceService.getInvoicesByStatus(statusFilter as InvoiceStatus)
      }
      
      if (search) {
        filtered = await invoiceService.searchInvoices(search)
      }
      
      setFilteredInvoices(filtered)
    } catch (error) {
      console.error('Error filtering invoices:', error)
      toast.error("Erro ao filtrar faturas")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
        <p className="text-muted-foreground">Gerencie suas faturas e pagamentos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinatura Atual</CardTitle>
          <CardDescription>Detalhes do seu plano atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : subscription ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{subscription.plano}</h3>
                  <p className="text-muted-foreground">
                    R$ {subscription.valor.toFixed(2)}/mês • Até {subscription.limiteMesas} mesas
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">Alterar Plano</Button>
                  <Button>Gerenciar Pagamento</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 border rounded-md">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Método de Pagamento</div>
                    <div className="text-sm text-muted-foreground">{subscription.metodoPagamento}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-md">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Próxima Cobrança</div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.proximaCobranca} • R$ {subscription.valor.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Status da Assinatura</div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.status === 'ativa' ? 'Ativa' : 'Inativa'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Nenhuma assinatura encontrada
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar faturas..."
            className="pl-8 w-full sm:w-[250px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Faturas
        </Button>
      </div>

      <Tabs defaultValue="todas" onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="paga">Pagas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="atrasada">Atrasadas</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 bg-muted text-sm font-medium">
                    <div>Fatura</div>
                    <div>Data</div>
                    <div>Vencimento</div>
                    <div>Valor</div>
                    <div>Status</div>
                  </div>

                  {filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="grid grid-cols-5 p-4 border-t items-center">
                      <div className="font-medium">{invoice.id}</div>
                      <div>{invoice.data}</div>
                      <div>{invoice.vencimento}</div>
                      <div>R$ {invoice.valor.toFixed(2)}</div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      Nenhuma fatura encontrada.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

