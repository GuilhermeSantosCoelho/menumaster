"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, CreditCard, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react"

type Fatura = {
  id: string
  data: string
  vencimento: string
  valor: number
  status: "paga" | "pendente" | "atrasada"
  plano: string
}

const FATURAS: Fatura[] = [
  {
    id: "INV-001",
    data: "01/05/2023",
    vencimento: "15/05/2023",
    valor: 199.0,
    status: "paga",
    plano: "Profissional",
  },
  {
    id: "INV-002",
    data: "01/06/2023",
    vencimento: "15/06/2023",
    valor: 199.0,
    status: "paga",
    plano: "Profissional",
  },
  {
    id: "INV-003",
    data: "01/07/2023",
    vencimento: "15/07/2023",
    valor: 199.0,
    status: "paga",
    plano: "Profissional",
  },
  {
    id: "INV-004",
    data: "01/08/2023",
    vencimento: "15/08/2023",
    valor: 199.0,
    status: "pendente",
    plano: "Profissional",
  },
]

const getStatusBadge = (status: Fatura["status"]) => {
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

const getStatusIcon = (status: Fatura["status"]) => {
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
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState<string>("todas")

  const faturasFiltradas = FATURAS.filter((f) => statusFiltro === "todas" || f.status === statusFiltro).filter(
    (f) => f.id.toLowerCase().includes(busca.toLowerCase()) || f.plano.toLowerCase().includes(busca.toLowerCase()),
  )

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Plano Profissional</h3>
              <p className="text-muted-foreground">R$ 199,00/mês • Até 30 mesas</p>
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
                <div className="text-sm text-muted-foreground">Cartão de Crédito •••• 4242</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-md">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Próxima Cobrança</div>
                <div className="text-sm text-muted-foreground">15/08/2023 • R$ 199,00</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-md">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Status da Assinatura</div>
                <div className="text-sm text-muted-foreground">Ativa</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar faturas..."
            className="pl-8 w-full sm:w-[250px]"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Faturas
        </Button>
      </div>

      <Tabs defaultValue="todas" onValueChange={setStatusFiltro}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="paga">Pagas</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="atrasada">Atrasadas</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFiltro} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 bg-muted text-sm font-medium">
                  <div>Fatura</div>
                  <div>Data</div>
                  <div>Vencimento</div>
                  <div>Valor</div>
                  <div>Status</div>
                </div>

                {faturasFiltradas.map((fatura) => (
                  <div key={fatura.id} className="grid grid-cols-5 p-4 border-t items-center">
                    <div className="font-medium">{fatura.id}</div>
                    <div>{fatura.data}</div>
                    <div>{fatura.vencimento}</div>
                    <div>R$ {fatura.valor.toFixed(2)}</div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fatura.status)}
                      {getStatusBadge(fatura.status)}
                    </div>
                  </div>
                ))}

                {faturasFiltradas.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">Nenhuma fatura encontrada.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

