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
import { reportsService, ReportPeriod, SalesReport, ProductReport, TableReport } from "@/lib/services/reports-service"
import { formatCurrency } from "@/lib/utils"

export default function RelatoriosPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("today")
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [topProducts, setTopProducts] = useState<ProductReport[]>([])
  const [tablePerformance, setTablePerformance] = useState<TableReport[]>([])

  const loadReports = async () => {
    const [sales, products, tables] = await Promise.all([
      reportsService.getSalesReport(reportPeriod),
      reportsService.getTopProducts(reportPeriod),
      reportsService.getTablePerformance(reportPeriod)
    ])
    setSalesReport(sales)
    setTopProducts(products)
    setTablePerformance(tables)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      loadReports()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
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
                {date ? date.toLocaleDateString() : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={loadReports}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="tables">Mesas</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>Visualize o desempenho de vendas do seu estabelecimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-muted-foreground">Gráfico de vendas será exibido aqui</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Vendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(salesReport?.totalSales || 0)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesReport?.totalOrders || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Ticket Médio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(salesReport?.averageTicket || 0)}</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {topProducts.map((product) => (
                    <Card key={product.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {product.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{product.quantity} unidades</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(product.revenue)} em vendas
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tablePerformance.map((table) => (
                    <Card key={table.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Mesa {table.number}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{table.orders} pedidos</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(table.revenue)} em vendas
                        </p>
                      </CardContent>
                    </Card>
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

