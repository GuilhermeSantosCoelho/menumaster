-- Criação das tabelas no Supabase

-- Tabela de usuários (complementar à tabela auth.users do Supabase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estabelecimentos
CREATE TABLE public.establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  logo TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabela de relacionamento entre estabelecimentos e funcionários
CREATE TABLE public.establishment_staff (
  establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (establishment_id, user_id)
);

-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE
);

-- Tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  stock INTEGER,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Tabela de mesas
CREATE TABLE public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'FREE' CHECK (status IN ('FREE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
  qr_code_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  UNIQUE (establishment_id, number)
);

-- Tabela de pedidos
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  payment_method TEXT CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'BANK_TRANSFER')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE
);

-- Tabela de itens de pedido
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT
);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan TEXT NOT NULL CHECK (plan IN ('BASIC', 'PROFESSIONAL', 'PREMIUM')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'BANK_TRANSFER')),
  payment_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  UNIQUE (establishment_id)
);

-- Tabela de faturas
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'BANK_TRANSFER')),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE
);

-- Tabela de configurações de QR code
CREATE TABLE public.qr_code_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_color TEXT,
  background_color TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  UNIQUE (establishment_id)
);

-- Tabela de relatórios de vendas
CREATE TABLE public.sales_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_sales DECIMAL(10, 2) NOT NULL,
  total_orders INTEGER NOT NULL,
  average_ticket DECIMAL(10, 2) NOT NULL,
  top_products JSONB NOT NULL,
  sales_by_day JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE
);

-- Tabela de notificações
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabela de divisão de conta
CREATE TABLE public.bill_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number_of_people INTEGER NOT NULL,
  amount_per_person DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  UNIQUE (order_id)
);

-- Funções e gatilhos para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o gatilho a todas as tabelas com campo updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_qr_code_settings_updated_at BEFORE UPDATE ON qr_code_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bill_splits_updated_at BEFORE UPDATE ON bill_splits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Configurações de RLS (Row Level Security)
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_code_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_splits ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para usuários
CREATE POLICY "Usuários podem ver seus próprios dados" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas de acesso para estabelecimentos
CREATE POLICY "Proprietários podem ver seus estabelecimentos" ON establishments
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Funcionários podem ver estabelecimentos onde trabalham" ON establishments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM establishment_staff
      WHERE establishment_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Proprietários podem gerenciar seus estabelecimentos" ON establishments
  FOR ALL USING (auth.uid() = owner_id);

-- Políticas para as demais tabelas seguem o mesmo padrão
-- Proprietários e funcionários podem ver dados do estabelecimento
-- Apenas proprietários podem modificar dados importantes

-- Exemplo para produtos
CREATE POLICY "Usuários podem ver produtos dos estabelecimentos" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE id = establishment_id AND (owner_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM establishment_staff
          WHERE establishment_id = establishments.id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Proprietários podem gerenciar produtos" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM establishments
      WHERE id = establishment_id AND owner_id = auth.uid()
    )
  );

-- Índices para melhorar performance
CREATE INDEX idx_products_establishment ON products(establishment_id);
CREATE INDEX idx_tables_establishment ON tables(establishment_id);
CREATE INDEX idx_orders_establishment ON orders(establishment_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_categories_establishment ON categories(establishment_id);

