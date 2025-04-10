'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, Eye, MoreHorizontal, Search, Utensils } from 'lucide-react';
import { toast } from 'sonner';

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
  };
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

    // Set up real-time subscription for order updates
    console.log('Setting up subscription for establishment orders');

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
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to order changes');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error subscribing to order changes');
          }
        });

      return () => {
        console.log('Cleaning up subscription');
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

      // Get orders for this establishment
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

      // @ts-ignore
      const { error: updateError } = await supabase.rpc('update_order_status', {
        p_order_id: orderId,
        p_new_status: newStatus,
      });

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError);
        throw updateError;
      }

      // Atualizar o estado local
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

  const filteredOrders = orders
    .filter((order) => statusFilter === 'all' || order.status === statusFilter)
    .filter((order) => tableSearch === '' || order.table.number.toString().includes(tableSearch));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie os pedidos do seu estabelecimento</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mesa..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="pl-8 w-[180px]"
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="PENDING">Aguardando</TabsTrigger>
          <TabsTrigger value="PREPARING">Em Preparo</TabsTrigger>
          <TabsTrigger value="READY">Prontos</TabsTrigger>
          <TabsTrigger value="DELIVERED">Entregues</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter}>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xl">
                {statusFilter === 'all'
                  ? 'Todos os Pedidos'
                  : getStatusText(statusFilter as OrderStatus)}
              </CardTitle>
              <CardDescription>
                {loading ? 'Carregando...' : `${filteredOrders.length} pedidos encontrados`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Carregando pedidos...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b"
                    >
                      <div className="flex items-center gap-4 mb-2 md:mb-0">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <Utensils className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            Mesa {order.table.number}
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            <span className="text-xs">•</span>
                            <span>R$ {order.total_amount.toFixed(2)}</span>
                            <span className="text-xs">•</span>
                            <span>{order.items.length} itens</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {order.items.map((item, index) => (
                              <span key={item.id}>
                                {item.quantity}x {item.product.name}
                                {index < order.items.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleAdvanceStatus(order.id, order.status)}
                          >
                            <Check className="h-4 w-4" />
                            {order.status === 'PENDING'
                              ? 'Preparar'
                              : order.status === 'PREPARING'
                              ? 'Pronto'
                              : 'Entregar'}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(order)}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="gap-2 text-red-600 cursor-pointer"
                                >
                                  <Check className="h-4 w-4" />
                                  Cancelar pedido
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Mesa {selectedOrder?.table.number} •{' '}
              {selectedOrder?.created_at
                ? new Date(selectedOrder.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <Badge
                className={`${
                  selectedOrder?.status ? getStatusColor(selectedOrder.status) : ''
                } text-white`}
              >
                {selectedOrder?.status ? getStatusText(selectedOrder.status) : ''}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Itens do Pedido</h4>
              <div className="border rounded-md">
                {selectedOrder?.items.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 ${i < selectedOrder.items.length - 1 ? 'border-b' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {item.quantity}x {item.product.name}
                      </div>
                      <div>R$ {(item.unit_price * item.quantity).toFixed(2)}</div>
                    </div>
                    {item.notes && (
                      <div className="text-sm text-muted-foreground mt-1">Obs: {item.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-medium">
              <div>Total</div>
              <div>R$ {selectedOrder?.total_amount.toFixed(2)}</div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
