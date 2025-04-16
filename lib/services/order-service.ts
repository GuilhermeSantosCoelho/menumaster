import { Order, OrderStatus } from '@/types/entities';
import { mockOrders } from '../mocks/data';

class OrderService {
  async getOrders(): Promise<Order[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  }

  async getOrderById(id: string): Promise<Order | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders.find(o => o.id === id) || null;
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newOrder: Order = {
      ...order,
      id: (mockOrders.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockOrders.push(newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) return null;

    mockOrders[index] = {
      ...mockOrders[index],
      status,
      updatedAt: new Date()
    };

    return mockOrders[index];
  }

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders.filter(o => o.table.id === tableId);
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders.filter(o => o.status === status);
  }
}

export const orderService = new OrderService(); 