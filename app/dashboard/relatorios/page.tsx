"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Download } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RelatoriosPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Visualize e exporte relatórios do seu estabelecimento</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <Select defaultValue="mes">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="mesas">Mesas</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>Visualize o desempenho de vendas do seu estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-muted-foreground">Gráfico de vendas será exibido aqui</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 12.450,00</div>
                    <p className="text-xs text-muted-foreground mt-1">+15% em relação ao mês anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 89,75</div>
                    <p className="text-xs text-muted-foreground mt-1">+5% em relação ao mês anterior</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">138</div>
                    <p className="text-xs text-muted-foreground mt-1">+8% em relação ao mês anterior</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Produtos</CardTitle>
              <CardDescription>Visualize o desempenho dos produtos do seu estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-muted-foreground">Gráfico de produtos será exibido aqui</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Produtos Mais Vendidos</h3>
                <div className="space-y-4">
                  {[
                    { nome: "Hambúrguer Clássico", quantidade: 45, valor: "R$ 1.345,50" },
                    { nome: "Batata Frita Grande", quantidade: 38, valor: "R$ 604,20" },
                    { nome: "Pizza Margherita", quantidade: 32, valor: "R$ 1.536,00" },
                    { nome: "Cerveja Artesanal", quantidade: 67, valor: "R$ 998,30" },
                    { nome: "Salada Caesar", quantidade: 24, valor: "R$ 549,60" },
                  ].map((produto, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">{produto.nome}</div>
                        <div className="text-sm text-muted-foreground">{produto.quantidade} unidades</div>
                      </div>
                      <div className="font-medium">{produto.valor}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mesas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Mesas</CardTitle>
              <CardDescription>Visualize o desempenho das mesas do seu estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-muted-foreground">Gráfico de mesas será exibido aqui</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Desempenho por Mesa</h3>
                <div className="space-y-4">
                  {[
                    { mesa: "Mesa 1", pedidos: 18, valor: "R$ 1.620,00", tempoMedio: "45 min" },
                    { mesa: "Mesa 2", pedidos: 15, valor: "R$ 1.350,00", tempoMedio: "52 min" },
                    { mesa: "Mesa 3", pedidos: 22, valor: "R$ 1.980,00", tempoMedio: "38 min" },
                    { mesa: "Mesa 4", pedidos: 12, valor: "R$ 1.080,00", tempoMedio: "42 min" },
                    { mesa: "Mesa 5", pedidos: 20, valor: "R$ 1.800,00", tempoMedio: "40 min" },
                  ].map((mesa, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">{mesa.mesa}</div>
                        <div className="text-sm text-muted-foreground">{mesa.pedidos} pedidos</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{mesa.valor}</div>
                        <div className="text-sm text-muted-foreground">Tempo médio: {mesa.tempoMedio}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

