import { User, Establishment, Category, Product, Table, Order, OrderItem, TableStatus, OrderStatus, PaymentMethod } from '@/types/entities';

// Create base objects first without circular references
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'OWNER',
    establishments: []
  }
];

export const mockEstablishments: Establishment[] = [
  {
    id: '1',
    name: 'Restaurant Example',
    description: undefined,
    address: undefined,
    phone: undefined,
    logo: undefined,
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    wifiSsid: undefined,
    wifiPassword: undefined,
    showWifiInMenu: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: '1',
    owner: mockUsers[0],
    staff: [],
    products: [],
    categories: [],
    tables: [],
    orders: [],
    subscription: {
      id: '1',
      establishmentId: '1',
      establishment: null as any,
      startDate: new Date(),
      endDate: undefined,
      active: true,
      autoRenew: true,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentDetails: undefined,
      invoices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    active: true
  }
];

export const mockTables: Table[] = [
  {
    id: '1',
    number: 1,
    capacity: 4,
    status: TableStatus.FREE,
    sessionUuid: '',
    establishmentId: '1',
    establishment: mockEstablishments[0],
    orders: [],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    sessionUuid: '',
    tableId: '1',
    table: mockTables[0],
    establishmentId: '1',
    establishment: mockEstablishments[0],
    status: OrderStatus.PENDING,
    items: [],
    totalAmount: 0,
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Update references after all objects are created
mockEstablishments[0].tables = mockTables;
mockEstablishments[0].orders = mockOrders;
mockUsers[0].establishments = mockEstablishments;

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Bebidas',
    description: 'Bebidas alcoólicas e não alcoólicas',
    establishmentId: '1',
    establishment: mockEstablishments[0],
    products: [],
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Pratos Principais',
    description: 'Pratos principais do cardápio',
    establishmentId: '1',
    establishment: mockEstablishments[0],
    products: [],
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola',
    description: 'Refrigerante Coca-Cola 350ml',
    price: 6.00,
    image: 'https://example.com/coca-cola.png',
    stock: 100,
    establishmentId: '1',
    establishment: mockEstablishments[0],
    categoryId: '1',
    category: mockCategories[0],
    orderItems: [],
    available: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'X-Burger',
    description: 'Hambúrguer com queijo e salada',
    price: 25.00,
    image: 'https://example.com/x-burger.png',
    stock: 50,
    establishmentId: '1',
    establishment: mockEstablishments[0],
    categoryId: '2',
    category: mockCategories[1],
    orderItems: [],
    available: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Mock OrderItems
export const mockOrderItems: OrderItem[] = [
  {
    id: '1',
    orderId: '1',
    order: {} as Order,
    productId: '1',
    product: mockProducts[0],
    quantity: 2,
    unitPrice: 6.00,
    notes: 'Sem gelo',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    orderId: '1',
    order: {} as Order,
    productId: '2',
    product: mockProducts[1],
    quantity: 1,
    unitPrice: 25.00,
    notes: 'Sem cebola',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Update references
mockOrderItems[0].order = mockOrders[0];
mockOrderItems[1].order = mockOrders[0];
mockTables[0].orders = [mockOrders[0]];
mockProducts[0].orderItems = [mockOrderItems[0]];
mockProducts[1].orderItems = [mockOrderItems[1]];
mockCategories[0].products = [mockProducts[0]];
mockCategories[1].products = [mockProducts[1]];
mockEstablishments[0].products = mockProducts;
mockEstablishments[0].categories = mockCategories;

export const mockInvoices = [
  {
    id: "INV-001",
    data: "01/05/2023",
    vencimento: "15/05/2023",
    valor: 199.0,
    status: "paga",
    plano: "Profissional",
  },
  {
    id: "INV-002",
    data: "01/06/2023",
    vencimento: "15/06/2023",
    valor: 199.0,
    status: "paga",
    plano: "Profissional",
  },
  {
    id: "INV-003",
    data: "01/07/2023",
    vencimento: "15/07/2023",
    valor: 199.0,
    status: "paga",
    plano: "Profissional",
  },
  {
    id: "INV-004",
    data: "01/08/2023",
    vencimento: "15/08/2023",
    valor: 199.0,
    status: "pendente",
    plano: "Profissional",
  },
]; 