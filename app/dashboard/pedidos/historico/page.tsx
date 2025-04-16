'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Search, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Order, OrderStatus } from '@/types/entities';
import { historicalOrdersService } from '@/lib/services/historical-orders-service';

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-amber-500';
    case OrderStatus.PREPARING:
      return 'bg-blue-500';
    case OrderStatus.READY:
      return 'bg-green-500';
    case OrderStatus.DELIVERED:
      return 'bg-slate-500';
    case OrderStatus.CANCELLED:
      return 'bg-red-500';
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Aguardando preparo';
    case OrderStatus.PREPARING:
      return 'Em preparo';
    case OrderStatus.READY:
      return 'Pronto para entrega';
    case OrderStatus.DELIVERED:
      return 'Entregue';
    case OrderStatus.CANCELLED:
      return 'Cancelado';
  }
};

export default function HistoricalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const historicalOrders = await historicalOrdersService.getHistoricalOrders();
      setOrders(historicalOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) => !tableSearch || order.table.number.toString().includes(tableSearch)
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/pedidos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Histórico de Pedidos</h1>
              <p className="text-muted-foreground">Pedidos de mesas que já foram fechadas</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mesa..."
              className="pl-8"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Utensils className="h-12 w-12 mb-4" />
            <p className="text-lg">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Mesa {order.table.number}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleDateString()}
                    <Clock className="h-4 w-4 ml-2" />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>
                          {item.quantity}x {item.product.name}
                          {item.notes && (
                            <span className="text-muted-foreground ml-2">({item.notes})</span>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">R$ {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}