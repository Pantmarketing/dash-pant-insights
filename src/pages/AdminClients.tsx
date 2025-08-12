import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminClients = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("LEAD_GEN");

  useEffect(() => {
    document.title = "Administração de Clientes | Dash Pant Marketing";
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Conecte o Supabase",
      description: "Após conectar, salvaremos o cliente na tabela clients com business_type.",
    });
  };

  return (
    <main className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de Negócio</Label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD_GEN">Geração de Leads</SelectItem>
                  <SelectItem value="ECOMMERCE">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="secondary" onClick={() => { setName(""); setEmail(""); setBusinessType("LEAD_GEN"); }}>Limpar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Conecte a integração Supabase. Criaremos as tabelas clients e campaign_data com RLS e ligaremos este formulário para inserir/editar clientes. O dashboard passará a ler os dados reais filtrando pelo business_type do cliente logado.
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminClients;
