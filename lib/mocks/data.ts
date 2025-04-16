import { User, Establishment, Category, Product, Table, Order, OrderItem, TableStatus, OrderStatus, PaymentMethod } from '@/types/entities';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'hashed_password',
    phone: '11999999999',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    establishments: [],
    role: 'OWNER'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    password: 'hashed_password',
    phone: '11988888888',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    establishments: [],
    role: 'MANAGER'
  }
];

// Mock Establishments
export const mockEstablishments: Establishment[] = [
  {
    id: '1',
    name: 'Restaurante do João',
    description: 'O melhor restaurante da cidade',
    address: 'Rua das Flores, 123',
    phone: '11977777777',
    logo: 'https://example.com/logo1.png',
    primaryColor: '#FF0000',
    secondaryColor: '#00FF00',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ownerId: '1',
    owner: mockUsers[0],
    staff: [mockUsers[1]],
    products: [],
    categories: [],
    tables: [],
    orders: [],
    subscription: {
      id: '1',
      establishmentId: '1',
      establishment: {} as Establishment,
      startDate: new Date('2024-01-01'),
      active: true,
      autoRenew: true,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      invoices: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    active: true
  }
];

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

// Mock Tables
export const mockTables: Table[] = [
  {
    id: '1',
    number: 1,
    capacity: 4,
    status: TableStatus.FREE,
    qrCodeUrl: 'https://example.com/qr-code-1.png',
    sessionUuid: 'session-1',
    establishmentId: '1',
    establishment: mockEstablishments[0],
    orders: [],
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    number: 2,
    capacity: 6,
    status: TableStatus.OCCUPIED,
    qrCodeUrl: 'https://example.com/qr-code-2.png',
    sessionUuid: 'session-2',
    establishmentId: '1',
    establishment: mockEstablishments[0],
    orders: [],
    active: true,
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

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    sessionUuid: 'session-2',
    table: mockTables[1],
    establishmentId: '1',
    establishment: mockEstablishments[0],
    status: OrderStatus.PENDING,
    items: mockOrderItems,
    totalAmount: 37.00,
    notes: 'Cliente com pressa',
    customerName: 'Pedro Silva',
    customerPhone: '11966666666',
    paymentMethod: PaymentMethod.PIX,
    paymentStatus: 'PENDING',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Update references
mockOrderItems[0].order = mockOrders[0];
mockOrderItems[1].order = mockOrders[0];
mockTables[1].orders = [mockOrders[0]];
mockProducts[0].orderItems = [mockOrderItems[0]];
mockProducts[1].orderItems = [mockOrderItems[1]];
mockCategories[0].products = [mockProducts[0]];
mockCategories[1].products = [mockProducts[1]];
mockEstablishments[0].products = mockProducts;
mockEstablishments[0].categories = mockCategories;
mockEstablishments[0].tables = mockTables;
mockEstablishments[0].orders = mockOrders;
mockUsers[0].establishments = [mockEstablishments[0]];
mockUsers[1].establishments = [mockEstablishments[0]];

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