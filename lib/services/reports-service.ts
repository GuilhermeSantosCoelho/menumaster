import { mockOrders, mockProducts, mockTables } from '@/lib/mocks/data';

export type ReportPeriod = 'today' | 'week' | 'month' | 'year';

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
}

export interface ProductReport {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface TableReport {
  id: string;
  number: number;
  orders: number;
  revenue: number;
}

class ReportsService {
  async getSalesReport(period: ReportPeriod): Promise<SalesReport> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const orders = mockOrders;
    const totalSales = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => {
        return itemSum + (item.unitPrice * item.quantity);
      }, 0);
    }, 0);

    return {
      totalSales,
      totalOrders: orders.length,
      averageTicket: totalSales / (orders.length || 1)
    };
  }

  async getTopProducts(period: ReportPeriod): Promise<ProductReport[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const productSales = new Map<string, { quantity: number; revenue: number }>();

    mockOrders.forEach(order => {
      order.items.forEach(item => {
        const current = productSales.get(item.product.id) || { quantity: 0, revenue: 0 };
        productSales.set(item.product.id, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.unitPrice * item.quantity)
        });
      });
    });

    return Array.from(productSales.entries()).map(([id, data]) => {
      const product = mockProducts.find(p => p.id === id);
      return {
        id,
        name: product?.name || 'Unknown Product',
        quantity: data.quantity,
        revenue: data.revenue
      };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }

  async getTablePerformance(period: ReportPeriod): Promise<TableReport[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const tableSales = new Map<string, { orders: number; revenue: number }>();

    mockOrders.forEach(order => {
      const current = tableSales.get(order.table.id) || { orders: 0, revenue: 0 };
      tableSales.set(order.table.id, {
        orders: current.orders + 1,
        revenue: current.revenue + order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
      });
    });

    return Array.from(tableSales.entries()).map(([id, data]) => {
      const table = mockTables.find(t => t.id === id);
      return {
        id,
        number: table?.number || 0,
        orders: data.orders,
        revenue: data.revenue
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }
}

export const reportsService = new ReportsService(); 