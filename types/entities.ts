/**
 * Definição das entidades do sistema de gerenciamento de restaurantes
 * Este arquivo serve como base para a modelagem do banco de dados e APIs
 */

// Enums

/**
 * Status possíveis para uma mesa
 */
export enum TableStatus {
  FREE = "FREE", // Mesa livre
  OCCUPIED = "OCCUPIED", // Mesa ocupada
  RESERVED = "RESERVED", // Mesa reservada
  MAINTENANCE = "MAINTENANCE", // Mesa em manutenção
}

/**
 * Status possíveis para um pedido
 */
export enum OrderStatus {
  PENDING = "PENDING", // Aguardando preparo
  PREPARING = "PREPARING", // Em preparo
  READY = "READY", // Pronto para entrega
  DELIVERED = "DELIVERED", // Entregue
  CANCELLED = "CANCELLED", // Cancelado
}

/**
 * Status possíveis para uma fatura
 */
export enum InvoiceStatus {
  PENDING = "PENDING", // Pendente
  PAID = "PAID", // Paga
  OVERDUE = "OVERDUE", // Atrasada
  CANCELLED = "CANCELLED", // Cancelada
}

/**
 * Tipos de pagamento
 */
export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD", // Cartão de crédito
  DEBIT_CARD = "DEBIT_CARD", // Cartão de débito
  PIX = "PIX", // PIX
  CASH = "CASH", // Dinheiro
  BANK_TRANSFER = "BANK_TRANSFER", // Transferência bancária
}

// Entidades

/**
 * Usuário do sistema
 */
export interface User {
  id: string
  name: string
  email: string
  password: string // Armazenar hash, não a senha em texto puro
  phone?: string
  createdAt: Date
  updatedAt: Date
  establishments: Establishment[] // Um usuário pode ter múltiplos estabelecimentos
  role: "OWNER" | "MANAGER" | "STAFF" // Papel do usuário
}

/**
 * Estabelecimento (Restaurante/Bar)
 */
export interface Establishment {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  logo?: string // URL para o logo
  primaryColor?: string // Cor primária para personalização
  secondaryColor?: string // Cor secundária para personalização
  wifiSsid?: string // Nome da rede WiFi
  wifiPassword?: string // Senha da rede WiFi
  createdAt: Date
  updatedAt: Date
  ownerId: string // Referência ao usuário proprietário
  owner: User
  staff: User[] // Funcionários do estabelecimento
  products: Product[] // Produtos do estabelecimento
  categories: Category[] // Categorias de produtos
  tables: Table[] // Mesas do estabelecimento
  orders: Order[] // Pedidos do estabelecimento
  subscription: Subscription // Assinatura do estabelecimento
  active: boolean // Se o estabelecimento está ativo
}

/**
 * Categoria de produtos
 */
export interface Category {
  id: string
  name: string
  description?: string
  establishmentId: string
  establishment: Establishment
  products: Product[] // Produtos nesta categoria
  active: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Produto (item do cardápio)
 */
export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string // URL para a imagem
  stock?: number // Quantidade em estoque (opcional)
  establishmentId: string
  establishment: Establishment
  categoryId?: string // Categoria é opcional
  category?: Category
  orderItems: OrderItem[] // Itens de pedido relacionados a este produto
  available: boolean // Se o produto está disponível
  createdAt: Date
  updatedAt: Date
}

/**
 * Mesa do estabelecimento
 */
export interface Table {
  id: string
  number: number // Número da mesa
  capacity: number // Capacidade de pessoas
  status: TableStatus
  qrCodeUrl?: string // URL para o QR code
  sessionUuid: string // UUID da sessão atual da mesa
  closedAt?: Date // Data de encerramento da sessão atual
  establishmentId: string
  establishment: Establishment
  orders: Order[] // Pedidos feitos nesta mesa
  active: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Pedido
 */
export interface Order {
  id: string
  sessionUuid: string
  tableId: string
  table: Table
  establishmentId: string
  establishment: Establishment
  status: OrderStatus
  items: OrderItem[] // Itens do pedido
  totalAmount: number // Valor total do pedido
  notes?: string // Observações gerais do pedido
  customerName?: string // Nome do cliente (opcional)
  customerPhone?: string // Telefone do cliente (opcional)
  paymentMethod?: PaymentMethod // Método de pagamento
  paymentStatus: "PENDING" | "PAID" // Status do pagamento
  createdAt: Date
  updatedAt: Date
  completedAt?: Date // Data de conclusão do pedido
}

/**
 * Item de um pedido
 */
export interface OrderItem {
  id: string
  orderId: string
  order: Order
  productId: string
  product: Product
  quantity: number
  unitPrice: number // Preço unitário no momento do pedido
  notes?: string // Observações específicas do item
  createdAt: Date
  updatedAt: Date
}

/**
 * Assinatura do estabelecimento
 */
export interface Subscription {
  id: string
  establishmentId: string
  establishment: Establishment
  startDate: Date
  endDate?: Date
  active: boolean
  autoRenew: boolean
  paymentMethod: PaymentMethod
  paymentDetails?: string // Detalhes do pagamento (últimos 4 dígitos do cartão, etc.)
  invoices: Invoice[] // Faturas relacionadas a esta assinatura
  createdAt: Date
  updatedAt: Date
}

/**
 * Fatura
 */
export interface Invoice {
  id: string
  subscriptionId: string
  subscription: Subscription
  amount: number
  status: InvoiceStatus
  dueDate: Date
  paidAt?: Date
  paymentMethod?: PaymentMethod
  paymentId?: string // ID da transação de pagamento
  createdAt: Date
  updatedAt: Date
}

/**
 * Configurações de QR Code
 */
export interface QRCodeSettings {
  id: string
  establishmentId: string
  establishment: Establishment
  primaryColor?: string // Cor do QR code
  backgroundColor?: string // Cor de fundo
  logoUrl?: string // URL para o logo no centro do QR code
  createdAt: Date
  updatedAt: Date
}

