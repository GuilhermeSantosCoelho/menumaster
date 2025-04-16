import { Order, OrderStatus } from '@/types/entities';
import { mockProducts, mockCategories } from '@/lib/mocks/data';

export type OrderStats = {
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_sales: number;
};

export type TopProduct = {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_description: string | null;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
};

export type TopCategory = {
  category_id: string;
  category_name: string;
  total_orders: number;
  total_quantity: number;
  total_revenue: number;
};

export type PendingOrder = {
  id: string;
  table_id: string;
  table_number: number;
  status: OrderStatus;
  created_at: string;
  total_amount: number;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
};

/**
 * Calcula estatísticas de pedidos com base em uma lista de pedidos
 */
export const calculateOrderStats = (orders: Order[]): OrderStats => {
  return {
    total_orders: orders.length,
    pending_orders: orders.filter(o => o.status === OrderStatus.PENDING).length,
    preparing_orders: orders.filter(o => o.status === OrderStatus.PREPARING).length,
    ready_orders: orders.filter(o => o.status === OrderStatus.READY).length,
    delivered_orders: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    cancelled_orders: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
    total_sales: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };
};

/**
 * Obtém pedidos pendentes a partir de uma lista de pedidos
 */
export const getPendingOrders = (orders: Order[]): PendingOrder[] => {
  return orders
    .filter(order => order.status === OrderStatus.PENDING || order.status === OrderStatus.PREPARING)
    .map(order => ({
      id: order.id,
      table_id: order.table.id,
      table_number: order.table.number,
      status: order.status,
      created_at: order.createdAt.toISOString(),
      total_amount: order.totalAmount,
      items: order.items.map(item => ({
        id: item.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
    }));
};

/**
 * Calcula os produtos mais vendidos a partir de uma lista de pedidos
 */
export const getTopProducts = (orders: Order[]): TopProduct[] => {
  const productMap = new Map<string, TopProduct>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const productId = item.productId;
      if (!productMap.has(productId)) {
        const product = mockProducts.find(p => p.id === productId);
        if (product) {
          productMap.set(productId, {
            product_id: product.id,
            product_name: product.name,
            product_image: product.image || null,
            product_description: product.description || null,
            total_orders: 0,
            total_quantity: 0,
            total_revenue: 0,
          });
        }
      }

      const productStats = productMap.get(productId);
      if (productStats) {
        productStats.total_orders += 1;
        productStats.total_quantity += item.quantity;
        productStats.total_revenue += item.quantity * item.unitPrice;
      }
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 5);
};

/**
 * Calcula as categorias mais vendidas a partir de uma lista de pedidos
 */
export const getTopCategories = (orders: Order[]): TopCategory[] => {
  const categoryMap = new Map<string, TopCategory>();

  orders.forEach(order => {
    order.items.forEach(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product && product.categoryId) {
        const categoryId = product.categoryId;
        if (!categoryMap.has(categoryId)) {
          const category = mockCategories.find(c => c.id === categoryId);
          if (category) {
            categoryMap.set(categoryId, {
              category_id: category.id,
              category_name: category.name,
              total_orders: 0,
              total_quantity: 0,
              total_revenue: 0,
            });
          }
        }

        const categoryStats = categoryMap.get(categoryId);
        if (categoryStats) {
          categoryStats.total_orders += 1;
          categoryStats.total_quantity += item.quantity;
          categoryStats.total_revenue += item.quantity * item.unitPrice;
        }
      }
    });
  });

  return Array.from(categoryMap.values())
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 5);
};

/**
 * Obtém a data de início com base no intervalo de tempo selecionado
 */
export const getDateRange = (range: 'day' | 'month' | 'year'): Date => {
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

  return start;
};

/**
 * Formata um valor numérico como moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Obtém a cor de fundo e texto com base no status do pedido
 */
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.PREPARING:
      return 'bg-blue-100 text-blue-800';
    case OrderStatus.READY:
      return 'bg-green-100 text-green-800';
    case OrderStatus.DELIVERED:
      return 'bg-gray-100 text-gray-800';
    case OrderStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtém o texto de exibição com base no status do pedido
 */
export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pendente';
    case OrderStatus.PREPARING:
      return 'Em Preparo';
    case OrderStatus.READY:
      return 'Pronto';
    case OrderStatus.DELIVERED:
      return 'Entregue';
    case OrderStatus.CANCELLED:
      return 'Cancelado';
    default:
      return status;
  }
}; 