import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Dash Pant Marketing | Portal de Dashboards";
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
      <section className="text-center space-y-6 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Dash Pant Marketing — Portal de Dashboards</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Gestão de clientes com dashboards personalizados para Geração de Leads e E-commerce. KPIs claros, gráficos e funis para decisões melhores.</p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/dashboard">Entrar no Dashboard</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/admin/clients">Administração de Clientes</Link>
          </Button>
        </div>
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Conecte sua conta Supabase para ativar login e leitura de dados. Enquanto isso, os dashboards exibem dados de exemplo.</CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default Index;
