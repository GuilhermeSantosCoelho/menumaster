import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { OrderStatus } from '@/types/entities';
import { orderService } from '@/lib/services/order-service';
import { useEstablishment } from '@/components/establishment-context';
import {
  OrderStats,
  TopProduct,
  TopCategory,
  PendingOrder,
  calculateOrderStats,
  getPendingOrders,
  getTopProducts,
  getTopCategories,
  getDateRange
} from '@/lib/utils/dashboard-utils';

type TimeRange = 'day' | 'month' | 'year';

export const useDashboard = (initialTimeRange: TimeRange = 'day') => {
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
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  
  const { currentEstablishment } = useEstablishment();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (!currentEstablishment) {
        setLoading(false);
        return;
      }

      // Get orders for the current establishment
      const orders = await orderService.getOrders();
      const filteredOrders = orders.filter(order => 
        order.establishmentId === currentEstablishment.id && 
        new Date(order.createdAt) >= getDateRange(timeRange)
      );

      // Calculate order statistics
      const orderStats = calculateOrderStats(filteredOrders);
      setStats(orderStats);

      // Get pending orders
      const pendingOrdersData = getPendingOrders(filteredOrders);
      setPendingOrders(pendingOrdersData);

      // Get top products
      const topProductsData = getTopProducts(filteredOrders);
      setTopProducts(topProductsData);

      // Get top categories
      const topCategoriesData = getTopCategories(filteredOrders);
      setTopCategories(topCategoriesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      if (!updatedOrder) throw new Error('Failed to update order status');

      toast.success('Status do pedido atualizado com sucesso');
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, currentEstablishment]);

  return {
    loading,
    stats,
    topProducts,
    topCategories,
    pendingOrders,
    timeRange,
    setTimeRange,
    updateOrderStatus,
    refreshData: fetchDashboardData
  };
}; 