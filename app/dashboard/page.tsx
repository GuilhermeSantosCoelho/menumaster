'use client';

import { useEstablishment } from "@/components/establishment-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { orderService } from "@/lib/services/order-service";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types/entities";
import { useEffect, useState } from 'react';

type OrderStats = {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
};

type TopProduct = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
};

type TopCategory = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
};

type PendingOrder = {
  id: string;
  tableNumber: number;
  items: { id: string; name: string; quantity: number; notes: string }[];
  createdAt: Date;
  status: OrderStatus;
};

export default function DashboardPage() {
  const { currentEstablishment } = useEstablishment();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  useEffect(() => {
    if (currentEstablishment) {
      loadDashboardData();
    }
  }, [currentEstablishment]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const orders = await orderService.getOrders();
      
      // Calculate statistics
      const stats: OrderStats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === OrderStatus.PENDING).length,
        preparingOrders: orders.filter(order => order.status === OrderStatus.PREPARING).length,
        deliveredOrders: orders.filter(order => order.status === OrderStatus.DELIVERED).length,
        totalRevenue: orders.reduce((sum, order) => 
          sum + order.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0), 0)
      };
      setStats(stats);

      // Calculate top products
      const productStats = new Map<string, { count: number; revenue: number }>();
      orders.forEach(order => {
        order.items.forEach(item => {
          const productId = item.product.id;
          const current = productStats.get(productId) || { count: 0, revenue: 0 };
          productStats.set(productId, {
            count: current.count + item.quantity,
            revenue: current.revenue + (item.unitPrice * item.quantity)
          });
        });
      });

      const topProducts: TopProduct[] = Array.from(productStats.entries())
        .map(([productId, stats]) => ({
          id: productId,
          name: orders.find(order => 
            order.items.find(item => item.product.id === productId)
          )?.items.find(item => item.product.id === productId)?.product.name || '',
          quantity: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      setTopProducts(topProducts);

      // Calculate top categories
      const categoryStats = new Map<string, { count: number; revenue: number }>();
      orders.forEach(order => {
        order.items.forEach(item => {
          const categoryId = item.product.category?.id;
          if (categoryId) {
            const current = categoryStats.get(categoryId) || { count: 0, revenue: 0 };
            categoryStats.set(categoryId, {
              count: current.count + item.quantity,
              revenue: current.revenue + (item.unitPrice * item.quantity)
            });
          }
        });
      });

      const topCategories: TopCategory[] = Array.from(categoryStats.entries())
        .map(([categoryId, stats]) => ({
          id: categoryId,
          name: orders.find(order => 
            order.items.find(item => item.product.category?.id === categoryId)
          )?.items.find(item => item.product.category?.id === categoryId)?.product.category?.name || '',
          quantity: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      setTopCategories(topCategories);

      // Get pending orders
      const pendingOrders: PendingOrder[] = orders
        .filter(order => order.status === OrderStatus.PENDING)
        .map(order => ({
          id: order.id,
          tableNumber: order.table.number,
          items: order.items.map(item => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            notes: item.notes || ''
          })),
          createdAt: order.createdAt,
          status: order.status
        }));
      setPendingOrders(pendingOrders);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (orderId: string) => {
    try {
      const order = pendingOrders.find(o => o.id === orderId);
      if (!order) return;

      const currentStatus = order.status;
      let newStatus: OrderStatus;

      switch (currentStatus) {
        case OrderStatus.PENDING:
          newStatus = OrderStatus.PREPARING;
          break;
        case OrderStatus.PREPARING:
          newStatus = OrderStatus.DELIVERED;
          break;
        default:
          return;
      }

      await orderService.updateOrderStatus(orderId, newStatus);
      await loadDashboardData();
      toast({
        title: 'Sucesso',
        description: 'Status do pedido atualizado com sucesso.'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preparing Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.preparingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} orders
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.quantity} orders
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(category.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Table {order.tableNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAdvanceStatus(order.id)}
                        disabled={order.status === OrderStatus.DELIVERED}
                      >
                        Advance
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
