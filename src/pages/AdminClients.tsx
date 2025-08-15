// Em src/pages/AdminClients.tsx

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessType } from './Dashboard'; // Importando o tipo do seu Dashboard.tsx

const AdminClients = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('LEAD_GEN');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Passo 1: Criar o usuário de autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      setError(`Erro ao criar o usuário: ${authError.message}`);
      return;
    }

    if (!authData.user) {
      setError("Não foi possível criar o usuário, tente novamente.");
      return;
    }

    // Passo 2: Salvar os dados do cliente na tabela 'clients'
    const { error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: authData.user.id, // Conecta o cliente ao usuário recém-criado
        name: name,
        email: email,
        business_type: businessType,
      });
    
    if (clientError) {
      setError(`Erro ao salvar os dados do cliente: ${clientError.message}`);
      // Aqui você poderia adicionar uma lógica para deletar o usuário criado no passo 1,
      // para evitar que ele fique "órfão".
      return;
    }

    setSuccess(`Cliente "${name}" criado com sucesso!`);
    // Limpar o formulário
    setName('');
    setEmail('');
    setPassword('');
  };


  return (
    <main className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Administração de Clientes</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha Temporária</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Negócio</Label>
              <Select value={businessType} onValueChange={(v: BusinessType) => setBusinessType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD_GEN">Geração de Leads</SelectItem>
                  <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" className="w-full">Criar Cliente</Button>
          </form>
        </CardContent>
      </Card>

      {/* Aqui você pode adicionar a lógica para listar os clientes existentes no futuro */}
    </main>
  );
};

export default AdminClients;