import { Clock, DollarSign, ShoppingCart, Utensils } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStats } from '@/lib/utils/dashboard-utils';
import { formatCurrency } from '@/lib/utils/dashboard-utils';

type StatsCardsProps = {
  stats: OrderStats;
  timeRange: 'day' | 'month' | 'year';
};

export function StatsCards({ stats, timeRange }: StatsCardsProps) {
  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'day':
        return 'Hoje';
      case 'month':
        return 'Este mês';
      case 'year':
        return 'Este ano';
      default:
        return '';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_orders}</div>
          <p className="text-xs text-muted-foreground">{getTimeRangeText()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.total_sales)}</div>
          <p className="text-xs text-muted-foreground">{getTimeRangeText()}</p>
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
  );
} 