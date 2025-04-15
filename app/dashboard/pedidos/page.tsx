'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, Eye, MoreHorizontal, Search, Utensils, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/use-auth';

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  notes: string | null;
  unit_price: number;
  product: {
    name: string;
  };
};

type Order = {
  id: string;
  table_id: string;
  status: OrderStatus;
  created_at: string;
  total_amount: number;
  items: OrderItem[];
  table: {
    number: number;
    is_open: boolean;
  };
};

type TableOrders = {
  tableNumber: number;
  tableId: string;
  orders: Order[];
  totalAmount: number;
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-500';
    case 'PREPARING':
      return 'bg-blue-500';
    case 'READY':
      return 'bg-green-500';
    case 'DELIVERED':
      return 'bg-slate-500';
    case 'CANCELLED':
      return 'bg-red-500';
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'Aguardando preparo';
    case 'PREPARING':
      return 'Em preparo';
    case 'READY':
      return 'Pronto para entrega';
    case 'DELIVERED':
      return 'Entregue';
    case 'CANCELLED':
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
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();

    const createChannel = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      const channel = supabase
        .channel(`establishment-${establishment?.id}-orders`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `establishment_id=eq.${establishment?.id}`,
          },
          (payload) => {
            console.log('Change received:', payload);
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    createChannel();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!establishment) throw new Error('Establishment not found');

      const { data: orders, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          table:table_id (
            number
          ),
          items:order_items (
            *,
            product:product_id (
              name
            )
          )
        `
        )
        .eq('establishment_id', establishment?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(orders || []);
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

      if (currentStatus === 'PENDING') newStatus = 'PREPARING';
      else if (currentStatus === 'PREPARING') newStatus = 'READY';
      else if (currentStatus === 'READY') newStatus = 'DELIVERED';
      else {
        toast.error('Não é possível avançar o status deste pedido');
        return;
      }

      const { error: updateError } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: newStatus,
      });

      if (updateError) throw updateError;

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
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', orderId);

      if (error) throw error;

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

  const handleCloseTable = async (tableId: string) => {
    try {
      const { error } = await supabase.rpc('close_table', {
        p_table_id: tableId,
      });

      if (error) throw error;

      toast.success('Mesa fechada com sucesso');
    } catch (error) {
      console.error('Error closing table:', error);
      toast.error('Erro ao fechar mesa');
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
          tableId: order.table_id,
          orders: [],
          totalAmount: 0,
        });
      }

      const tableOrders = tableMap.get(tableNumber)!;
      tableOrders.orders.push(order);
      tableOrders.totalAmount += order.total_amount;
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
              <Link href="/dashboard/pedidos/historico">
                Ver Histórico
              </Link>
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
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                <TabsTrigger value="PREPARING">Em preparo</TabsTrigger>
                <TabsTrigger value="READY">Prontos</TabsTrigger>
                <TabsTrigger value="DELIVERED">Entregues</TabsTrigger>
              </TabsList>
            </Tabs>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <DropdownMenuItem onClick={() => handleCloseTable(table.tableId)}>
                            Fechar Mesa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription>
                    Total: R$ {table.totalAmount.toFixed(2)}
                  </CardDescription>
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
                                {new Date(order.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleAdvanceStatus(order.id, order.status)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {order.status === 'PENDING' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCancelOrder(order.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span>
                                  {item.quantity}x {item.product.name}
                                </span>
                                <span className="text-muted-foreground">
                                  R$ {(item.quantity * item.unit_price).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
            <DialogDescription>
              Mesa {selectedOrder?.table.number} -{' '}
              {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
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
                    R$ {(item.quantity * item.unit_price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-medium">Total</span>
              <span className="font-medium">R$ {selectedOrder?.total_amount.toFixed(2)}</span>
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
