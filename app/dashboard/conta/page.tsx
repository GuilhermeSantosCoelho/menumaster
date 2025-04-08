'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Mail, Phone } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function ContaPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user profile data from the users table
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("Erro ao carregar dados do usuário");
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Update user table
      const { error } = await supabase
        .from('users')
        .update({
          name,
          email,
          phone,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Perfil atualizado com sucesso");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.error("As senhas não conferem");
        return;
      }
      
      setPasswordLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error("Erro ao atualizar senha");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="nome" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-l-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-l-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="telefone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none" 
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-atual">Senha Atual</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="senha-atual" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-l-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="nova-senha" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-l-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border rounded-l-md bg-muted">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input 
                    id="confirmar-senha" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-l-none" 
                  />
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={updatePassword}
                disabled={passwordLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                {passwordLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

