'use client';

import { Check, Eye, MoreHorizontal, Search, Utensils, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order, OrderStatus } from '@/types/entities';
import { orderService } from '@/lib/services/order-service';

type TableOrders = {
  tableNumber: number;
  sessionUuid: string;
  orders: Order[];
  totalAmount: number;
};

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orders = await orderService.getOrders();
      setOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    try {
      let newStatus: OrderStatus = currentStatus;

      if (currentStatus === OrderStatus.PENDING) newStatus = OrderStatus.PREPARING;
      else if (currentStatus === OrderStatus.PREPARING) newStatus = OrderStatus.READY;
      else if (currentStatus === OrderStatus.READY) newStatus = OrderStatus.DELIVERED;
      else {
        toast.error('Não é possível avançar o status deste pedido');
        return;
      }

      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      if (!updatedOrder) throw new Error('Failed to update order status');

      setOrders(
        orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );

      toast.success(`Pedido atualizado para: ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);
      if (!updatedOrder) throw new Error('Failed to cancel order');

      setOrders(
        orders.map((order) => (order.id === orderId ? { ...order, status: OrderStatus.CANCELLED } : order))
      );

      toast.success('Pedido cancelado com sucesso');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Erro ao cancelar pedido');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseTable = async (sessionUuid: string) => {
    try {
      // In a real app, this would call an API to close the table
      toast.success('Mesa fechada com sucesso!');
      fetchOrders();
    } catch (error) {
      console.error('Error closing table:', error);
      toast.error('Erro ao fechar a mesa');
    }
  };

  const groupOrdersByTable = (orders: Order[]): TableOrders[] => {
    const tableMap = new Map<number, TableOrders>();

    orders.forEach((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return;
      if (tableSearch && !order.table.number.toString().includes(tableSearch)) return;

      const tableNumber = order.table.number;
      if (!tableMap.has(tableNumber)) {
        tableMap.set(tableNumber, {
          tableNumber,
          sessionUuid: order.sessionUuid,
          orders: [],
          totalAmount: 0,
        });
      }

      const tableOrders = tableMap.get(tableNumber)!;
      tableOrders.orders.push(order);
      tableOrders.totalAmount += order.totalAmount;
    });

    return Array.from(tableMap.values()).sort((a, b) => a.tableNumber - b.tableNumber);
  };

  const tableOrders = groupOrdersByTable(orders);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pedidos Ativos</h1>
            <p className="text-muted-foreground">Pedidos das mesas que estão abertas</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard/pedidos/historico">Ver Histórico</Link>
            </Button>
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tableOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Utensils className="h-12 w-12 mb-4" />
            <p className="text-lg">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value={OrderStatus.PENDING}>Pendentes</TabsTrigger>
                <TabsTrigger value={OrderStatus.PREPARING}>Em preparo</TabsTrigger>
                <TabsTrigger value={OrderStatus.READY}>Prontos</TabsTrigger>
                <TabsTrigger value={OrderStatus.DELIVERED}>Entregues</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tableOrders.map((table) => (
                <Card key={table.tableNumber} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Mesa {table.tableNumber}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {table.orders.length} {table.orders.length === 1 ? 'pedido' : 'pedidos'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCloseTable(table.sessionUuid)}>
                              Fechar Mesa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription>Total: R$ {table.totalAmount.toFixed(2)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {table.orders.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(order.status)}>
                                  {getStatusText(order.status)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span>
                                    {item.quantity}x {item.product.name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    R$ {(item.quantity * item.unitPrice).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <Button
                                variant="ghost"
                                className="bg-gray-400"
                                size="icon"
                                onClick={() => handleViewDetails(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                                <Button
                                  variant="ghost"
                                  className="bg-green-400"
                                  size="icon"
                                  onClick={() => handleAdvanceStatus(order.id, order.status)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === OrderStatus.PENDING && (
                                <Button
                                  variant="ghost"
                                  className="bg-red-400"
                                  size="icon"
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Mesa {selectedOrder?.table.number} -{' '}
              {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {selectedOrder?.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {item.quantity}x {item.product.name}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">Observação: {item.notes}</p>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    R$ {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-medium">Total</span>
              <span className="font-medium">R$ {selectedOrder?.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
