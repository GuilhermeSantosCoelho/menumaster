import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopCategory, formatCurrency } from '@/lib/utils/dashboard-utils';

type TopCategoriesProps = {
  categories: TopCategory[];
};

export function TopCategories({ categories }: TopCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias Mais Vendidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {categories.map((category) => (
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
  );
} 