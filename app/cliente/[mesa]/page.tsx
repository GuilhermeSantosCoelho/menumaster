'use client';

import { createClient } from '@/utils/supabase/client';
import {
  ChevronDown,
  Clock,
  History,
  Minus,
  Plus,
  Receipt,
  ShoppingCart,
  Utensils,
  Wifi
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, Sheet } from '@/components/ui/sheet';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import { Badge } from '@/components/ui/badge';

type DatabaseProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number | null;
  available: boolean;
  created_at: string;
  updated_at: string;
  establishment_id: string;
  category_id: string | null;
  categories?: {
    name: string | null;
  } | null;
};

type Product = DatabaseProduct & {
  category: string | null;
};

type CartItem = {
  product: Product;
  quantity: number;
  observation?: string;
};

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

type OrderItem = {
  id: string;
  product: {
    id: string;
    name: string;
    categories?: {
      name: string | null;
    } | null;
  };
  quantity: number;
  unit_price: number;
  notes?: string;
};

type GroupedOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
};

type Order = {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  notes: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  table_id: string;
  establishment_id: string;
  order_items: OrderItem[];
  table: {
    session_uuid: string;
  };
};

function WiFiConnection({ ssid, password }: { ssid: string; password: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!ssid) return null;

  return (
    <div className="bg-card rounded-lg border shadow-sm mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Wifi className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">WiFi do Estabelecimento</h3>
            <p className="text-xs text-muted-foreground">Toque para ver as informações</p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <span className="font-medium text-sm">Nome da Rede (SSID)</span>
            <span className="font-mono text-sm">{ssid}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <span className="font-medium text-sm">Senha</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{showPassword ? password : '••••••••'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-8 px-2"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-2">Para conectar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra as configurações do seu dispositivo</li>
              <li>Vá para a seção de WiFi</li>
              <li>Selecione a rede "{ssid}"</li>
              <li>Digite a senha quando solicitado</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

const groupOrderItems = (items: OrderItem[]): GroupedOrderItem[] => {
  const grouped = items.reduce((acc, item) => {
    const key = `${item.product.id}-${item.notes || ''}`;
    if (!acc[key]) {
      acc[key] = {
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: 0,
        unit_price: item.unit_price,
        notes: item.notes
      };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {} as Record<string, GroupedOrderItem>);

  return Object.values(grouped);
};

export default function ClientePedido({ params, searchParams }: { 
  params: Promise<{ mesa: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [observation, setObservation] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [orderSent, setOrderSent] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isOrdersSheetOpen, setIsOrdersSheetOpen] = useState(false);
  const [wifiInfo, setWifiInfo] = useState<{ ssid: string; password: string }>({
    ssid: '',
    password: '',
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  // Initialize Supabase client
  const supabase = createClient();

  useEffect(() => {
    if (!resolvedSearchParams.session) {
      router.push('/');
      return;
    }

    fetchTableAndProducts();
    fetchOrders();
    fetchWifiInfo();

    const channel = supabase
      .channel(`table-${resolvedParams.mesa}-orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `table_id=eq.${resolvedParams.mesa}`,
        },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [resolvedParams.mesa, resolvedSearchParams.session]);

  const fetchTableAndProducts = async () => {
    try {
      setLoading(true);

      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('number, session_uuid')
        .eq('id', resolvedParams.mesa)
        .single();

      if (tableError) throw tableError;

      if (table.session_uuid !== resolvedSearchParams.session) {
        router.push('/');
        return;
      }

      setTableNumber(table.number);

      // Get products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('available', true)
        .is('deleted_at', null)
        .order('name');

      if (productsError) throw productsError;

      setProducts(
        products.map((product) => ({
          ...product,
          category: product.categories?.name || null,
        }))
      );

      // Get categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (categoriesError) throw categoriesError;

      setCategories(categories);
    } catch (error) {
      console.error('Error fetching table and products:', error);
      toast.error('Erro ao carregar informações da mesa');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      // First, verify if the session is valid
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('session_uuid')
        .eq('id', resolvedParams.mesa)
        .single();

      if (tableError) throw tableError;

      if (table.session_uuid !== resolvedSearchParams.session) {
        router.push('/');
        return;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:product_id (
              id,
              name,
              categories (
                name
              )
            )
          )
        `)
        .eq('table_id', resolvedParams.mesa)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchWifiInfo = async () => {
    try {
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('establishment_id')
        .eq('id', resolvedParams.mesa)
        .single();

      if (tableError) throw tableError;

      const { data, error } = await supabase
        .from('establishments')
        .select('wifi_ssid, wifi_password')
        .eq('id', table?.establishment_id)
        .single();

      if (error) throw error;

      if (data) {
        setWifiInfo({
          ssid: data.wifi_ssid || '',
          password: data.wifi_password || '',
        });
      }
    } catch (error) {
      console.error('Error fetching WiFi info:', error);
    }
  };

  // Filter products by category
  const filteredProducts =
    currentCategory === 'todos'
      ? products
      : products.filter((p) => p.category_id === currentCategory);

  const addToCart = (product: Product) => {
    if (!product || selectedQuantity <= 0) return;

    const existingItem = cart.findIndex(
      (item) => item.product.id === product.id && item.observation === observation
    );

    if (existingItem >= 0) {
      const newCart = [...cart];
      newCart[existingItem].quantity += selectedQuantity;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          quantity: selectedQuantity,
          observation: observation || undefined,
        },
      ]);
    }

    setSelectedProduct(null);
    setObservation('');
    setSelectedQuantity(1);
    setIsDialogOpen(false);
    setOrderSent(false);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const changeQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const sendOrder = async () => {
    try {
      // First, get the establishment_id from the table
      const { data: table, error: tableError } = await supabase
        .from('tables')
        .select('establishment_id')
        .eq('id', resolvedParams.mesa)
        .single();

      if (tableError) throw tableError;
      if (!table) throw new Error('Table not found');

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: resolvedParams.mesa,
          establishment_id: table.establishment_id,
          status: 'PENDING',
          total_amount: total,
          notes: cart
            .map(
              (item) =>
                `${item.quantity}x ${item.product.name}${
                  item.observation ? ` (${item.observation})` : ''
                }`
            )
            .join(', '),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        notes: item.observation || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSent(true);
      setCart([]);
      toast.success('Pedido enviado com sucesso!');
    } catch (error) {
      console.error('Error sending order:', error);
      toast.error('Erro ao enviar pedido');
    }
  };

  const splitBill = (numberOfPeople: number) => {
    return (total / numberOfPeople).toFixed(2);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'PREPARING':
        return 'Preparando';
      case 'READY':
        return 'Pronto';
      case 'DELIVERED':
        return 'Entregue';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-md">
              <Utensils className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">MenuMaster</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-muted px-4 py-2 rounded-full">
              <h2 className="text-lg font-medium">Mesa {tableNumber}</h2>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Content - Menu */}
        <main className="flex-1 container py-8 px-4 lg:pr-[400px]">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-2">Cardápio</h1>
              <p className="text-muted-foreground text-lg">Escolha os itens e faça seu pedido</p>
            </div>

            <WiFiConnection ssid={wifiInfo.ssid} password={wifiInfo.password} />

            <Tabs defaultValue="todos" className="w-full" onValueChange={setCurrentCategory}>
              <TabsList className="mb-6 w-full justify-start overflow-x-auto">
                <TabsTrigger value="todos" className="min-w-fit">
                  Todos
                </TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="min-w-fit">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={currentCategory} className="space-y-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      {product.image && (
                        <div className="w-full sm:w-40 h-40">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                            <CardDescription className="text-base">
                              {product.description}
                            </CardDescription>
                          </div>
                          <div className="text-lg font-semibold">R$ {product.price.toFixed(2)}</div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={() => {
                              setIsDialogOpen(true);
                              addToCart(product);
                            }}
                            className="w-full sm:w-auto"
                          >
                            Adicionar ao carrinho
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="bg-muted/30 rounded-lg p-8">
                      <p className="text-muted-foreground text-lg">
                        Nenhum produto encontrado nesta categoria.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Sidebar - Order History */}
        <aside className="hidden lg:block fixed top-[65px] right-0 w-[400px] h-[calc(100vh-65px)] border-l bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">Pedidos da Mesa</h2>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => {
                  const groupedItems = groupOrderItems(order.order_items);
                  return (
                    <div
                      key={order.id}
                      className="bg-card rounded-lg border shadow-sm overflow-hidden"
                    >
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          {groupedItems.map((item) => (
                            <div key={`${item.product_id}-${item.notes || ''}`} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{item.product_name}</span>
                              <span className="text-sm text-muted-foreground">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="bg-muted/30 rounded-lg p-8">
                  <p className="text-muted-foreground text-lg">
                    Nenhum pedido encontrado para esta mesa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Order History Button */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden fixed left-4 bottom-4 gap-2 shadow-lg rounded-full"
          onClick={() => setIsOrdersSheetOpen(true)}
        >
          <History className="h-5 w-5" />
          Ver Pedidos
          {orders.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {orders.length}
            </Badge>
          )}
        </Button>

        {/* Mobile Order History Sheet */}
        <Sheet open={isOrdersSheetOpen} onOpenChange={setIsOrdersSheetOpen}>
          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="space-y-3 pb-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <span>Pedidos da Mesa {tableNumber}</span>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const groupedItems = groupOrderItems(order.order_items);
                    return (
                      <div
                        key={order.id}
                        className="bg-card rounded-lg border shadow-sm overflow-hidden"
                      >
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {formatDate(order.created_at)}
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            {groupedItems.map((item) => (
                              <div key={`${item.product_id}-${item.notes || ''}`} className="py-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{item.product_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.quantity}x R$ {item.unit_price.toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    R$ {(item.quantity * item.unit_price).toFixed(2)}
                                  </div>
                                </div>
                                {item.notes && (
                                  <div className="mt-1 text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-1">
                                    {item.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-2 flex justify-between items-center">
                            <span className="text-sm font-medium">Total</span>
                            <span className="font-semibold">R$ {order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Nenhum pedido realizado ainda</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Cart Sheet */}
        <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-4 right-4 gap-2 shadow-lg rounded-full px-6"
              size="sm"
              disabled={cart.length === 0 || orderSent}
            >
              <ShoppingCart className="h-5 w-5" />
              Ver Carrinho
              {cart.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader className="space-y-3 pb-4 border-b">
              <SheetTitle className="text-2xl">Seu Pedido</SheetTitle>
              <SheetDescription className="text-base">Mesa {tableNumber}</SheetDescription>
            </SheetHeader>

            {orderSent ? (
              <div className="py-12 flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-full bg-green-100 p-4 text-green-600 mb-6">
                  <Receipt className="h-8 w-8" />
                </div>

                <h3 className="text-2xl font-medium mb-3">Pedido recebido!</h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-sm">
                  Seu pedido foi enviado para a cozinha e já está sendo preparado.
                </p>
                <p className="text-sm text-muted-foreground">
                  Você pode acompanhar o status do seu pedido nesta tela.
                </p>
              </div>
            ) : (
              <>
                {cart.length > 0 ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-auto py-6">
                      <div className="space-y-4">
                        {cart.map((item, index) => (
                          <div key={index} className="bg-muted/30 rounded-lg p-4">
                            <div className="flex justify-between mb-3">
                              <div className="font-medium text-lg">{item.product.name}</div>
                              <div className="font-semibold">
                                R$ {(item.product.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-background rounded-md p-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => changeQuantity(index, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => changeQuantity(index, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(index)}
                                className="text-destructive hover:text-destructive/90"
                              >
                                Remover
                              </Button>
                            </div>
                            {item.observation && (
                              <div className="mt-3 text-sm text-muted-foreground bg-background rounded-md px-3 py-2">
                                {item.observation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="text-lg">Total</div>
                        <div className="text-xl font-semibold">R$ {total.toFixed(2)}</div>
                      </div>

                      <div className="space-y-3">
                        <Button className="w-full gap-2 h-12 text-lg" onClick={sendOrder}>
                          <ShoppingCart className="h-5 w-5" />
                          Enviar pedido
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full h-12">
                              Dividir conta
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-xl">Dividir a conta</DialogTitle>
                              <DialogDescription className="text-base">
                                Divida o valor total entre várias pessoas
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                              <div className="flex justify-between items-center mb-6 text-lg">
                                <div>Total do pedido:</div>
                                <div className="font-semibold">R$ {total.toFixed(2)}</div>
                              </div>
                              <div className="space-y-3">
                                {[2, 3, 4, 5].map((num) => (
                                  <div
                                    key={num}
                                    className="flex justify-between items-center p-4 bg-muted/30 rounded-lg"
                                  >
                                    <div>Dividir entre {num} pessoas:</div>
                                    <div className="font-semibold">R$ {splitBill(num)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" className="w-full">
                                Fechar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground mb-2">Seu carrinho está vazio!</p>
                    <p className="text-base text-muted-foreground max-w-sm">
                      Adicione itens do cardápio para fazer seu pedido
                    </p>
                  </div>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}