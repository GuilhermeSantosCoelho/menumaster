import { mockOrders, mockTables } from '@/lib/mocks/data';
import { Order, OrderStatus } from '@/types/entities';

class HistoricalOrdersService {
  async getHistoricalOrders(): Promise<Order[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter orders from closed tables
    return mockOrders.filter(order => {
      const table = mockTables.find(t => t.id === order.table.id);
      return table && !table.active;
    });
  }
}

export const historicalOrdersService = new HistoricalOrdersService(); 