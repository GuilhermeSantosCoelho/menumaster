'use client';

import { createClient } from '@/utils/supabase/client';
import {
  Clock,
  DollarSign,
  ShoppingCart,
  Utensils
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type OrderStats = {
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_sales: number;
};

type TopProduct = {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_description: string | null;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
};

type TopCategory = {
  category_id: string;
  category_name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
};

type PendingOrder = {
  id: string;
  table_id: string;
  table_number: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
  total_amount: number;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    total_orders: 0,
    pending_orders: 0,
    preparing_orders: 0,
    ready_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    total_sales: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('day');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const getDateRange = (range: 'day' | 'month' | 'year'): string => {
    const now = new Date();
    const start = new Date(now);

    switch (range) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return start.toISOString();
  };

  const fetchDashboardData = async () => {
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

      if (!establishment) throw new Error('No establishment found');

      // Get order statistics
      const { data: orderStats } = await supabase
        .from('order_statistics')
        .select('*')
        .eq('establishment_id', establishment.id)
        .gte('order_date', getDateRange(timeRange));

      if (orderStats && orderStats.length > 0) {
        const aggregatedStats = orderStats.reduce((acc, curr) => ({
          total_orders: acc.total_orders + curr.total_orders,
          pending_orders: acc.pending_orders + curr.pending_orders,
          preparing_orders: acc.preparing_orders + curr.preparing_orders,
          ready_orders: acc.ready_orders + curr.ready_orders,
          delivered_orders: acc.delivered_orders + curr.delivered_orders,
          cancelled_orders: acc.cancelled_orders + curr.cancelled_orders,
          total_sales: acc.total_sales + curr.total_sales
        }), {
          total_orders: 0,
          pending_orders: 0,
          preparing_orders: 0,
          ready_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_sales: 0
        });

        setStats(aggregatedStats);
      }

      // Get pending orders
      const { data: pendingOrdersData } = await supabase
        .from('pending_orders')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('created_at', { ascending: false });

      if (pendingOrdersData) {
        setPendingOrders(pendingOrdersData);
      }

      // Get top products
      const { data: products } = await supabase
        .from('top_products')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('total_quantity', { ascending: false })
        .limit(5);

      if (products) {
        setTopProducts(products);
      }

      // Get top categories
      const { data: categories } = await supabase
        .from('top_categories')
        .select('*')
        .eq('establishment_id', establishment.id)
        .order('total_revenue', { ascending: false })
        .limit(5);

      if (categories) {
        setTopCategories(categories);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const updateOrderStatus = async (orderId: string, newStatus: PendingOrder['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Status do pedido atualizado com sucesso');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const getStatusColor = (status: PendingOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PendingOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'PREPARING':
        return 'Em Preparo';
      case 'READY':
        return 'Pronto';
      case 'DELIVERED':
        return 'Entregue';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu estabelecimento</p>
      </div>

      <Tabs
        defaultValue="day"
        onValueChange={(value) => setTimeRange(value as 'day' | 'month' | 'year')}
      >
        <TabsList>
          <TabsTrigger value="day">Hoje</TabsTrigger>
          <TabsTrigger value="month">Este Mês</TabsTrigger>
          <TabsTrigger value="year">Este Ano</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === 'day' ? 'Hoje' : timeRange === 'month' ? 'Este mês' : 'Este ano'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_sales)}</div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === 'day' ? 'Hoje' : timeRange === 'month' ? 'Este mês' : 'Este ano'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_orders}</div>
                <p className="text-xs text-muted-foreground">Aguardando preparo</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos em Preparo</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.preparing_orders}</div>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pedidos Pendentes</CardTitle>
                <Button variant="outline" onClick={() => router.push('/dashboard/pedidos')}>
                  Ver Todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium">Mesa {order.table_number}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value as PendingOrder['status'])}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pendente</SelectItem>
                              <SelectItem value="PREPARING">Em Preparo</SelectItem>
                              <SelectItem value="READY">Pronto</SelectItem>
                              <SelectItem value="DELIVERED">Entregue</SelectItem>
                              <SelectItem value="CANCELLED">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </span>
                        <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  ))}
                  {pendingOrders.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      Nenhum pedido pendente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {topProducts.map((product) => (
                    <div key={product.product_id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={product.product_image || ''} alt={product.product_name} />
                        <AvatarFallback>{product.product_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.product_name}</p>
                        {product.product_description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {product.product_description}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {product.total_quantity} unidades vendidas
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {formatCurrency(product.total_revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Categorias Mais Vendidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {topCategories.map((category) => (
                  <div key={category.category_id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{category.category_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.total_orders} pedidos
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(category.total_revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
