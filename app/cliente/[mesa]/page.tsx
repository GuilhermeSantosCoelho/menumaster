'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category, Order, OrderItem, OrderStatus, Product, Table } from '@/types/entities';
import { mockCategories } from '@/lib/mocks/data';
import { mockProducts } from '@/lib/mocks/data';
import { mockTables } from '@/lib/mocks/data';
import { orderService } from '@/lib/services/order-service';

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const [table, setTable] = useState<Table | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.mesa]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real app, these would be API calls
      const tableData = mockTables.find(t => t.number.toString() === params.mesa);
      if (!tableData) {
        toast.error('Mesa não encontrada');
        router.push('/');
        return;
      }
      setTable(tableData);

      setProducts(mockProducts);
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: Math.random().toString(),
        orderId: '',
        order: {} as Order,
        productId: product.id,
        product: product,
        quantity: 1,
        unitPrice: product.price,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
    toast.success('Item adicionado ao carrinho');
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
    toast.success('Item removido do carrinho');
  };

  const updateCartItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, quantity }
        : item
    ));
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart(cart.map(item => 
      item.id === itemId 
        ? { ...item, notes }
        : item
    ));
  };

  const handleSubmitOrder = async () => {
    if (!table) return;
    if (cart.length === 0) {
      toast.error('Adicione itens ao carrinho');
      return;
    }
    if (!customerName || !customerPhone) {
      toast.error('Preencha os dados do cliente');
      return;
    }

    try {
      const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        sessionUuid: table.sessionUuid,
        table: table,
        establishmentId: table.establishmentId,
        establishment: table.establishment,
        status: OrderStatus.PENDING,
        items: cart,
        totalAmount: cart.reduce((total, item) => total + (item.quantity * item.unitPrice), 0),
        notes: '',
        customerName,
        customerPhone,
        paymentMethod: undefined,
        paymentStatus: 'PENDING'
      };

      await orderService.createOrder(order);
      toast.success('Pedido realizado com sucesso!');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Erro ao realizar pedido');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!table) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Cardápio</h1>
                <p className="text-muted-foreground">Mesa {table.number}</p>
              </div>
              <div className="relative">
                <Input
                  placeholder="Buscar item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <Button onClick={() => addToCart(product)}>
                        Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Carrinho</CardTitle>
              <CardDescription>
                {cart.length} {cart.length === 1 ? 'item' : 'itens'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex flex-col gap-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {(item.quantity * item.unitPrice).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <span className="sr-only">Remover</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <Input
                        placeholder="Observações..."
                        value={item.notes}
                        onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome do Cliente</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Digite o nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone do Cliente</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Digite o telefone do cliente"
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    R$ {cart.reduce((total, item) => total + (item.quantity * item.unitPrice), 0).toFixed(2)}
                  </span>
                </div>
                <Button className="w-full" onClick={handleSubmitOrder}>
                  Finalizar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}