import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatus } from '@/types/entities';
import { PendingOrder, formatCurrency } from '@/lib/utils/dashboard-utils';

type PendingOrdersProps = {
  orders: PendingOrder[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
};

export function PendingOrders({ orders, onUpdateStatus }: PendingOrdersProps) {
  const router = useRouter();

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pedidos Pendentes</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/pedidos')}>
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
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
                    onValueChange={(value) => onUpdateStatus(order.id, value as OrderStatus)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrderStatus.PENDING}>Pendente</SelectItem>
                      <SelectItem value={OrderStatus.PREPARING}>Em Preparo</SelectItem>
                      <SelectItem value={OrderStatus.READY}>Pronto</SelectItem>
                      <SelectItem value={OrderStatus.DELIVERED}>Entregue</SelectItem>
                      <SelectItem value={OrderStatus.CANCELLED}>Cancelado</SelectItem>
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
          {orders.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              Nenhum pedido pendente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 