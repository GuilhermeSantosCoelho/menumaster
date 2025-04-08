'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Utensils } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/utils/supabase/client';

const formSchema = z
  .object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres' }),
    email: z.string().email({ message: 'E-mail inválido' }),
    establishmentName: z
      .string()
      .min(2, { message: 'O nome do estabelecimento deve ter pelo menos 2 caracteres' }),
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // const { signUp } = useAuth()
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      establishmentName: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Registrar o usuário
      // const { data, error } = await signUp(values.email, values.password, values.name)
      const { data, error } = {
        data: {
          user: {
            id: '123',
          },
        },
        error: true,
      };

      if (error) {
        toast.error('Falha ao criar conta. Verifique seus dados e tente novamente.');
        console.error(error);
        return;
      }

      if (data.user) {
        // Criar o estabelecimento
        const { error: establishmentError } = await supabase.from('establishments').insert({
          name: values.establishmentName,
          owner_id: data.user.id,
        });

        if (establishmentError) {
          toast.error('Falha ao criar estabelecimento.');
          console.error(establishmentError);
          return;
        }

        toast.success('Conta criada com sucesso!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao criar sua conta.');
    } finally {
      setIsLoading(false);
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
          <CardTitle className="text-2xl text-center">Criar uma conta</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="establishmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do estabelecimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Restaurante Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
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
                    <FormLabel>Confirme a senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Cadastrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Entre aqui
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
