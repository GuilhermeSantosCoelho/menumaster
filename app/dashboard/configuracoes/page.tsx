'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Paintbrush, Save, UploadCloud } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const perfilFormSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  address: z.string().min(5, {
    message: 'O endereço deve ter pelo menos 5 caracteres.',
  }),
  phone: z.string().min(8, {
    message: 'O telefone deve ter pelo menos 8 caracteres.',
  }),
  description: z.string().max(500, {
    message: 'A descrição não pode ter mais de 500 caracteres.',
  }),
});

const temaFormSchema = z.object({
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Cor inválida, use formato hexadecimal (#RRGGBB)',
  }),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Cor inválida, use formato hexadecimal (#RRGGBB)',
  }),
});

export default function ConfiguracoesPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Form para dados do perfil
  const perfilForm = useForm<z.infer<typeof perfilFormSchema>>({
    resolver: zodResolver(perfilFormSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      description: '',
    },
  });

  // Form para tema
  const temaForm = useForm<z.infer<typeof temaFormSchema>>({
    resolver: zodResolver(temaFormSchema),
    defaultValues: {
      primary_color: '#0f172a',
      secondary_color: '#f97316',
    },
  });

  useEffect(() => {
    fetchEstablishmentData();
  }, []);

  const fetchEstablishmentData = async () => {
    try {
      setLoading(true);

      // Get the current user's establishment
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: establishment, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      if (!establishment) throw new Error('No establishment found');

      // Set form values
      perfilForm.reset({
        name: establishment.name || '',
        address: establishment.address || '',
        phone: establishment.phone || '',
        description: establishment.description || '',
      });

      temaForm.reset({
        primary_color: establishment.primary_color || '#0f172a',
        secondary_color: establishment.secondary_color || '#f97316',
      });

      if (establishment.logo) {
        setLogo(establishment.logo);
      }
    } catch (error) {
      console.error('Error fetching establishment data:', error);
      toast.error('Erro ao carregar dados do estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPerfil = async (data: z.infer<typeof perfilFormSchema>) => {
    try {
      setSaving(true);

      // Get the current user's establishment
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('establishments')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          description: data.description,
        })
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success('Dados do estabelecimento atualizados com sucesso');
    } catch (error) {
      console.error('Error updating establishment:', error);
      toast.error('Erro ao atualizar dados do estabelecimento');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitTema = async (data: z.infer<typeof temaFormSchema>) => {
    try {
      setSaving(true);

      // Get the current user's establishment
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('establishments')
        .update({
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
        })
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success('Tema atualizado com sucesso');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Erro ao atualizar tema');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setSaving(true);

      // Get the current user's establishment
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('establishmentlogos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('establishmentlogos').getPublicUrl(fileName);

      // Update the establishment with the new logo URL
      const { error: updateError } = await supabase
        .from('establishments')
        .update({ logo: publicUrl })
        .eq('owner_id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      setLogo(publicUrl);
      toast.success('Logo atualizada com sucesso');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao atualizar logo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize seu estabelecimento e ajuste suas preferências
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perfil">Perfil do Estabelecimento</TabsTrigger>
          <TabsTrigger value="tema">Tema e Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Estabelecimento</CardTitle>
              <CardDescription>
                Defina as informações básicas do seu restaurante ou bar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...perfilForm}>
                <form onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} className="space-y-4">
                  <FormField
                    control={perfilForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Estabelecimento</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={loading} />
                        </FormControl>
                        <FormDescription>
                          Este nome será exibido para seus clientes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={perfilForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={perfilForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={perfilForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[100px]"
                            placeholder="Descreva seu estabelecimento..."
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta descrição será exibida na página de pedidos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="block mb-2">Logo</FormLabel>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 border rounded-md overflow-hidden flex items-center justify-center bg-muted">
                        {logo ? (
                          <img
                            src={logo}
                            alt="Logo preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UploadCloud className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          disabled={loading || saving}
                        />
                        <FormDescription className="mt-1">
                          Imagem quadrada recomendada, tamanho máximo 5MB.
                        </FormDescription>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading || saving} className="w-full">
                    {saving ? (
                      'Salvando...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Informações
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>
                Personalize o tema e a aparência da página de pedidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...temaForm}>
                <form onSubmit={temaForm.handleSubmit(onSubmitTema)} className="space-y-4">
                  <FormField
                    control={temaForm.control}
                    name="primary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Primária</FormLabel>
                        <div className="flex gap-4">
                          <FormControl>
                            <Input {...field} disabled={loading} />
                          </FormControl>
                          <div
                            className="h-10 w-12 rounded border"
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>Cor principal do seu estabelecimento.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={temaForm.control}
                    name="secondary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Secundária</FormLabel>
                        <div className="flex gap-4">
                          <FormControl>
                            <Input {...field} disabled={loading} />
                          </FormControl>
                          <div
                            className="h-10 w-12 rounded border"
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
                        <FormDescription>
                          Cor de destaque para botões e elementos importantes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-lg p-4">
                    <div className="font-medium mb-2">Pré-visualização</div>
                    <div
                      className="p-4 rounded-md text-white"
                      style={{ backgroundColor: temaForm.watch('primary_color') }}
                    >
                      <div className="text-lg font-bold mb-2">Restaurante Exemplo</div>
                      <div className="text-sm opacity-80">
                        Restaurante especializado em comida contemporânea
                      </div>
                      <div className="mt-4">
                        <button
                          className="px-4 py-2 rounded-md text-white"
                          style={{ backgroundColor: temaForm.watch('secondary_color') }}
                        >
                          Botão de exemplo
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading || saving} className="w-full">
                    {saving ? (
                      'Salvando...'
                    ) : (
                      <>
                        <Paintbrush className="mr-2 h-4 w-4" />
                        Salvar Tema
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="text-muted-foreground text-sm">
              As cores escolhidas serão aplicadas à página de pedidos vista pelos seus clientes.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
