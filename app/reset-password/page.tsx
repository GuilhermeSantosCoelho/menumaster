"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Utensils } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

const formSchema = z
  .object({
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        toast.error("Erro ao redefinir senha. Tente novamente.")
        console.error(error)
        return
      }

      toast.success("Senha redefinida com sucesso!")
      router.push("/login")
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      toast.error("Ocorreu um erro ao redefinir sua senha.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <Utensils className="h-6 w-6" />
              <span className="text-xl font-bold">MenuMaster</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Redefinir senha</CardTitle>
          <CardDescription className="text-center">Digite sua nova senha abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirme a nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-primary hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

