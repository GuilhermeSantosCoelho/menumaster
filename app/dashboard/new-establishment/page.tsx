"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { PaymentMethod } from "@/types/entities"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { establishmentService } from "@/lib/services/establishment-service"

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
})

export default function NovoEstabelecimentoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error("Você precisa estar logado para criar um estabelecimento")
      return
    }

    setIsLoading(true)

    try {
      const newEstablishment = await establishmentService.createEstablishment({
        name: values.name,
        description: values.description || undefined,
        address: values.address || undefined,
        phone: values.phone || undefined,
        ownerId: user.id,
        owner: user,
        staff: [],
        products: [],
        categories: [],
        tables: [],
        orders: [],
        subscription: {
          id: crypto.randomUUID(),
          establishmentId: '',
          establishment: {} as any,
          startDate: new Date(),
          active: true,
          autoRenew: true,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          invoices: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        active: true
      })

      toast.success("Estabelecimento criado com sucesso!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao criar estabelecimento:", error)
      toast.error("Ocorreu um erro ao criar o estabelecimento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Novo Estabelecimento</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Estabelecimento</CardTitle>
          <CardDescription>Preencha os dados do seu restaurante ou bar</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Estabelecimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Restaurante Silva" {...field} />
                    </FormControl>
                    <FormDescription>Este é o nome que será exibido para seus clientes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Restaurante especializado em comida italiana" {...field} />
                    </FormControl>
                    <FormDescription>Uma breve descrição do seu estabelecimento (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Rua Exemplo, 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: (11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Estabelecimento"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Você poderá editar essas informações posteriormente nas configurações
        </CardFooter>
      </Card>
    </div>
  )
}

