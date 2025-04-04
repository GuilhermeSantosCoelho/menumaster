import Link from "next/link"
import { BarChart, Clock, Coffee, DollarSign, Utensils, ShoppingBag, ArrowUpRight, TableIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu estabelecimento</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total (Hoje)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$1.535,00</div>
            <p className="text-xs text-muted-foreground mt-1">+20% em relação a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos (Hoje)</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">+12% em relação a ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Ativas</CardTitle>
            <TableIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground mt-1">De um total de 12 mesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio (Pedido)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 min</div>
            <p className="text-xs text-muted-foreground mt-1">-2 min em relação à média</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pedidos Ativos</CardTitle>
            <CardDescription>Pedidos aguardando preparo ou entrega</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "#4321",
                  mesa: "Mesa 5",
                  hora: "13:45",
                  valor: "R$ 142,00",
                  status: "Em preparo",
                  itens: ["2x Hambúrguer Clássico", "1x Batata Frita Grande", "3x Refrigerante"],
                },
                {
                  id: "#4322",
                  mesa: "Mesa 3",
                  hora: "14:02",
                  valor: "R$ 98,50",
                  status: "Aguardando preparo",
                  itens: ["1x Pizza Margherita", "2x Cerveja Artesanal", "1x Salada Caesar"],
                },
                {
                  id: "#4323",
                  mesa: "Mesa 8",
                  hora: "14:15",
                  valor: "R$ 75,90",
                  status: "Pronto para entrega",
                  itens: ["2x Prato do Dia", "2x Suco Natural"],
                },
              ].map((pedido, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{pedido.mesa}</span>
                      <span className="text-sm text-muted-foreground">• {pedido.hora}</span>
                    </div>
                    <div className="font-medium">{pedido.valor}</div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {pedido.itens.map((item, j) => (
                      <div key={j} className="text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm px-2 py-1 rounded-md bg-amber-100 text-amber-800">{pedido.status}</div>
                    <Button variant="ghost" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/dashboard/pedidos">
                <Button variant="outline" size="sm" className="gap-1">
                  Ver todos os pedidos
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Os itens mais populares do seu cardápio hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  nome: "Hambúrguer Clássico",
                  quantidade: 24,
                  valor: "R$ 29,90",
                  icon: Coffee,
                },
                {
                  nome: "Batata Frita Grande",
                  quantidade: 18,
                  valor: "R$ 15,90",
                  icon: Utensils,
                },
                {
                  nome: "Pizza Margherita",
                  quantidade: 15,
                  valor: "R$ 48,00",
                  icon: Utensils,
                },
                {
                  nome: "Cerveja Artesanal",
                  quantidade: 32,
                  valor: "R$ 14,90",
                  icon: Coffee,
                },
                {
                  nome: "Salada Caesar",
                  quantidade: 12,
                  valor: "R$ 22,90",
                  icon: Utensils,
                },
              ].map((produto, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <produto.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{produto.nome}</div>
                      <div className="text-sm text-muted-foreground">{produto.valor}</div>
                    </div>
                  </div>
                  <div className="font-medium">{produto.quantidade} un.</div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/dashboard/relatorios">
                <Button variant="outline" size="sm" className="gap-1">
                  Ver relatório completo
                  <BarChart className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

