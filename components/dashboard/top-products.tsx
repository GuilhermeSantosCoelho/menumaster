import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopProduct, formatCurrency } from '@/lib/utils/dashboard-utils';

type TopProductsProps = {
  products: TopProduct[];
};

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {products.map((product) => (
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
  );
} 