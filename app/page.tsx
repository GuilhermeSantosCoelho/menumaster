import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight, QrCode, ShoppingBag, Utensils } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6" />
            <span className="text-xl font-bold">MenuMaster</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#recursos" className="text-foreground/70 hover:text-foreground">
              Recursos
            </Link>
            <Link href="#como-funciona" className="text-foreground/70 hover:text-foreground">
              Como Funciona
            </Link>
            <Link href="#precos" className="text-foreground/70 hover:text-foreground">
              Preços
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:flex">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button>Cadastre-se</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-[900px] mb-6">
              Gerencie seu estabelecimento com facilidade
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px] mb-8">
              Automatize pedidos, controle estoque e melhore a experiência do cliente com nossa plataforma completa para
              restaurantes e bares.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-6">
                  Começar agora
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline" className="px-6">
                  Saiba mais
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="recursos" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Recursos Principais</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Gestão de Produtos",
                  description: "Adicione, remova e atualize produtos. Gerencie o estoque com facilidade.",
                  icon: <ShoppingBag className="h-10 w-10" />,
                },
                {
                  title: "Pedidos via QR Code",
                  description: "Clientes fazem pedidos diretamente do celular escaneando o QR code da mesa.",
                  icon: <QrCode className="h-10 w-10" />,
                },
                {
                  title: "Divisão de Conta",
                  description: "Os clientes podem dividir a conta entre várias pessoas facilmente.",
                  icon: <Utensils className="h-10 w-10" />,
                },
                {
                  title: "Gestão de Mesas",
                  description: "Adicione e gerencie mesas com facilidade, cada uma com seu código único.",
                  icon: <Check className="h-10 w-10" />,
                },
                {
                  title: "Acompanhamento em Tempo Real",
                  description: "Acompanhe pedidos em tempo real e notifique os clientes sobre o status.",
                  icon: <Check className="h-10 w-10" />,
                },
                {
                  title: "Personalização",
                  description: "Personalize a aparência da sua página de pedidos com suas cores e logo.",
                  icon: <Check className="h-10 w-10" />,
                },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">{feature.icon}</div>
                  <h3 className="text-xl font-bold mt-4">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Como Funciona</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Cadastre seu estabelecimento",
                  description: "Crie sua conta e configure os detalhes do seu restaurante ou bar.",
                },
                {
                  step: "2",
                  title: "Adicione produtos e mesas",
                  description: "Cadastre seu cardápio e crie QR codes únicos para cada mesa.",
                },
                {
                  step: "3",
                  title: "Comece a receber pedidos",
                  description: "Os clientes escanearão o QR code e farão pedidos diretamente pelo celular.",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="precos" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Preços Acessíveis</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  name: "Básico",
                  price: "R$99",
                  description: "Ideal para pequenos estabelecimentos",
                  features: ["Até 10 mesas", "Gestão de produtos", "QR codes para pedidos", "Suporte por email"],
                },
                {
                  name: "Profissional",
                  price: "R$199",
                  description: "Para estabelecimentos em crescimento",
                  features: [
                    "Até 30 mesas",
                    "Gestão de produtos",
                    "QR codes para pedidos",
                    "Divisão de conta",
                    "Personalização de tema",
                    "Suporte prioritário",
                  ],
                  featured: true,
                },
                {
                  name: "Premium",
                  price: "R$349",
                  description: "Para grandes estabelecimentos",
                  features: [
                    "Mesas ilimitadas",
                    "Gestão de produtos",
                    "QR codes para pedidos",
                    "Divisão de conta",
                    "Personalização completa",
                    "API para integração",
                    "Suporte 24/7",
                  ],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`flex flex-col border rounded-lg p-6 ${
                    plan.featured ? "border-primary shadow-lg scale-105 bg-primary/5" : "bg-card"
                  }`}
                >
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="ml-2 text-muted-foreground">/mês</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{plan.description}</p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`mt-8 ${plan.featured ? "" : "bg-primary/90 hover:bg-primary"}`}>
                    Escolher plano
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 bg-muted">
        <div className="container mx-auto px-4 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="h-6 w-6" />
              <span className="text-lg font-bold">MenuMaster</span>
            </div>
            <p className="text-muted-foreground">Solução completa para gerenciamento de restaurantes e bares.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="#recursos" className="hover:text-foreground">
                  Recursos
                </Link>
              </li>
              <li>
                <Link href="#como-funciona" className="hover:text-foreground">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="#precos" className="hover:text-foreground">
                  Preços
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>contato@menumaster.com.br</li>
              <li>(11) 99999-9999</li>
            </ul>
          </div>
        </div>
        <div className="container mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} MenuMaster. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

