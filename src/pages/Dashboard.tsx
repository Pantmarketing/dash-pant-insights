import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // Verifique se o caminho está correto

// Import de todos os seus componentes de UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

// Import do Recharts para gráficos
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

// Tipos de dados
export type BusinessType = "LEAD_GEN" | "ECOMMERCE";

interface CampaignRow {
  data_do_relatorio: string; // YYYY-MM-DD
  nome_campanha: string;
  nome_conjunto_anuncios: string;
  nome_anuncio: string;
  investimento: number;
  impressoes: number;
  cliques: number;
  visualizacoes_pagina: number;
  leads?: number | null;
  adicoes_carrinho?: number | null;
  inicios_checkout?: number | null;
  compras?: number | null;
  faturamento?: number | null;
}

const Dashboard = () => {
  // --- ESTADOS DA APLICAÇÃO ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para os dados vindos do Supabase
  const [allData, setAllData] = useState<CampaignRow[]>([]);
  const [businessType, setBusinessType] = useState<BusinessType>("LEAD_GEN");

  // Estados para os controles do usuário
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [operationalCosts, setOperationalCosts] = useState<number>(0);

  // --- BUSCA DE DADOS DO SUPABASE ---
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Pega o usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado.");

        // 2. Busca o tipo de negócio do cliente na tabela 'clients'
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id, business_type')
          .eq('user_id', user.id)
          .single();

        if (clientError || !clientData) throw new Error("Cliente não encontrado.");

        setBusinessType(clientData.business_type as BusinessType);

        // 3. Busca os dados de campanha para este cliente
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaign_data')
          .select('*')
          .eq('client_id', clientData.id);

        if (campaignError) throw campaignError;

        setAllData(campaignData || []);

      } catch (err: any) {
        setError(err.message);
        console.error("Erro no fetch de dados: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // --- CÁLCULOS E MEMORIZAÇÃO (Seu código, agora usando os dados do Supabase) ---

  const filtered = useMemo(() => {
    if (!range.from || !range.to) return allData;
    const from = new Date(range.from.toDateString());
    const to = new Date(range.to.toDateString());
    return allData.filter((r) => {
      const d = new Date(r.data_do_relatorio);
      return d >= from && d <= to;
    });
  }, [allData, range]);

  const totals = useMemo(() => {
    // ... (Seu código de reduce e cálculo de KPIs continua exatamente o mesmo aqui)
    const sum = filtered.reduce(
        (acc, r) => {
            acc.investimento += r.investimento;
            acc.impressoes += r.impressoes;
            acc.cliques += r.cliques;
            acc.visualizacoes_pagina += r.visualizacoes_pagina;
            acc.leads += r.leads ?? 0;
            acc.adicoes_carrinho += r.adicoes_carrinho ?? 0;
            acc.inicios_checkout += r.inicios_checkout ?? 0;
            acc.compras += r.compras ?? 0;
            acc.faturamento += r.faturamento ?? 0;
            return acc;
        },
        { investimento: 0, impressoes: 0, cliques: 0, visualizacoes_pagina: 0, leads: 0, adicoes_carrinho: 0, inicios_checkout: 0, compras: 0, faturamento: 0, }
    );

    const CPL = sum.leads > 0 ? sum.investimento / sum.leads : 0;
    const CPC = sum.cliques > 0 ? sum.investimento / sum.cliques : 0;
    const convLeads = sum.visualizacoes_pagina > 0 ? sum.leads / sum.visualizacoes_pagina : 0;
    const CPA = sum.compras > 0 ? sum.investimento / sum.compras : 0;
    const ROAS = sum.investimento > 0 ? sum.faturamento / sum.investimento : 0;
    const ROI = sum.investimento + operationalCosts > 0 ? (sum.faturamento - sum.investimento - operationalCosts) / (sum.investimento + operationalCosts) : 0;
    const ticketMedio = sum.compras > 0 ? sum.faturamento / sum.compras : 0;

    return { sum, CPL, CPC, convLeads, CPA, ROAS, ROI, ticketMedio };
  }, [filtered, operationalCosts]);

  // ... (Seus outros useMemo para lineDataLead, barDataLead, etc., continuam os mesmos)
    const lineDataLead = useMemo(() => {
        const byDay: Record<string, { leads: number; investimento: number }> = {};
        filtered.forEach((r) => {
            byDay[r.data_do_relatorio] ||= { leads: 0, investimento: 0 };
            byDay[r.data_do_relatorio].leads += r.leads ?? 0;
            byDay[r.data_do_relatorio].investimento += r.investimento;
        });
        return Object.entries(byDay).map(([date, v]) => ({ date, leads: v.leads, cpl: v.leads > 0 ? v.investimento / v.leads : 0, }));
    }, [filtered]);

    const barDataLead = useMemo(() => {
        const byCamp: Record<string, number> = {};
        filtered.forEach((r) => { byCamp[r.nome_campanha] = (byCamp[r.nome_campanha] ?? 0) + (r.leads ?? 0); });
        return Object.entries(byCamp).map(([nome_campanha, leads]) => ({ nome_campanha, leads }));
    }, [filtered]);

    const lineDataEcom = useMemo(() => {
        const byDay: Record<string, { faturamento: number; investimento: number }> = {};
        filtered.forEach((r) => {
            byDay[r.data_do_relatorio] ||= { faturamento: 0, investimento: 0 };
            byDay[r.data_do_relatorio].faturamento += r.faturamento ?? 0;
            byDay[r.data_do_relatorio].investimento += r.investimento;
        });
        return Object.entries(byDay).map(([date, v]) => ({ date, faturamento: v.faturamento, roas: v.investimento > 0 ? v.faturamento / v.investimento : 0, }));
    }, [filtered]);

    const barDataEcom = useMemo(() => {
        const byCamp: Record<string, number> = {};
        filtered.forEach((r) => { byCamp[r.nome_campanha] = (byCamp[r.nome_campanha] ?? 0) + (r.faturamento ?? 0); });
        return Object.entries(byCamp).map(([nome_campanha, faturamento]) => ({ nome_campanha, faturamento }));
    }, [filtered]);

    const funnelLead = [
        { label: "Impressões", value: totals.sum.impressoes },
        { label: "Cliques", value: totals.sum.cliques },
        { label: "Visitas", value: totals.sum.visualizacoes_pagina },
        { label: "Leads", value: totals.sum.leads },
    ];

    const funnelEcom = [
        { label: "Visitas", value: totals.sum.visualizacoes_pagina },
        { label: "Carrinho", value: totals.sum.adicoes_carrinho },
        { label: "Checkout", value: totals.sum.inicios_checkout },
        { label: "Compras", value: totals.sum.compras },
    ];


  // --- RENDERIZAÇÃO DO COMPONENTE ---

  if (loading) {
    return (
      <main className="container py-6 text-center">
        <p>Carregando dados do cliente...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-6">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Dados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard do Cliente</h1>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 items-end">
        <Card>
          <CardContent className="p-4">
            <label className="text-sm text-muted-foreground">Período de Análise</label>
            <DateRangePicker value={range} onChange={setRange} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Custos Operacionais</label>
              <Input type="number" min={0} value={operationalCosts} onChange={(e) => setOperationalCosts(Number(e.target.value))} placeholder="0" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Renderização Condicional do Dashboard */}
      {businessType === "LEAD_GEN" ? (
        // ... Seu JSX para o dashboard LEAD_GEN continua o mesmo
        <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <KpiCard label="Investimento Total" value={totals.sum.investimento} format="currency" />
                <KpiCard label="Leads Gerados" value={totals.sum.leads} />
                <KpiCard label="CPL" value={totals.CPL} format="currency" />
                <KpiCard label="Cliques" value={totals.sum.cliques} />
                <KpiCard label="CPC" value={totals.CPC} format="currency" />
                <KpiCard label="Visualizações de Página" value={totals.sum.visualizacoes_pagina} />
                <KpiCard label="Taxa de Conversão de Leads" value={totals.convLeads} format="percent" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Evolução de Leads e CPL</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineDataLead}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="leads" stroke="hsl(var(--primary))" />
                                <Line yAxisId="right" type="monotone" dataKey="cpl" stroke="hsl(var(--primary-variant))" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Leads por Campanha</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barDataLead}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nome_campanha" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="leads" fill="hsl(var(--primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Funil de Conversão</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {funnelLead.map((s, i) => {
                        const max = funnelLead[0].value || 1;
                        const pct = Math.min(100, Math.round((s.value / (max || 1)) * 100));
                        return (
                            <div key={i}>
                                <div className="flex justify-between text-sm text-muted-foreground"><span>{s.label}</span><span>{s.value.toLocaleString()}</span></div>
                                <div className="h-3 bg-muted rounded-md overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Detalhamento</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Campanha</TableHead>
                                <TableHead>Conjunto</TableHead>
                                <TableHead>Anúncio</TableHead>
                                <TableHead className="text-right">Investimento</TableHead>
                                <TableHead className="text-right">Impressões</TableHead>
                                <TableHead className="text-right">Cliques</TableHead>
                                <TableHead className="text-right">Visitas</TableHead>
                                <TableHead className="text-right">Leads</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {filtered.map((r, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{r.data_do_relatorio}</TableCell>
                                        <TableCell>{r.nome_campanha}</TableCell>
                                        <TableCell>{r.nome_conjunto_anuncios}</TableCell>
                                        <TableCell>{r.nome_anuncio}</TableCell>
                                        <TableCell className="text-right">{r.investimento.toLocaleString(undefined, { style: "currency", currency: "BRL" })}</TableCell>
                                        <TableCell className="text-right">{r.impressoes.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{r.cliques.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{r.visualizacoes_pagina.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(r.leads ?? 0).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </section>
      ) : (
        // ... Seu JSX para o dashboard ECOMMERCE continua o mesmo
        <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <KpiCard label="Investimento Total" value={totals.sum.investimento} format="currency" />
                <KpiCard label="Faturamento Total" value={totals.sum.faturamento} format="currency" />
                <KpiCard label="ROAS" value={totals.ROAS} format="number" precision={2} />
                <KpiCard label="ROI" value={totals.ROI} format="percent" />
                <KpiCard label="Vendas Totais" value={totals.sum.compras} />
                <KpiCard label="CPA" value={totals.CPA} format="currency" />
                <KpiCard label="Ticket Médio" value={totals.ticketMedio} format="currency" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Evolução de Faturamento e ROAS</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineDataEcom}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="faturamento" stroke="hsl(var(--primary))" />
                                <Line yAxisId="right" type="monotone" dataKey="roas" stroke="hsl(var(--primary-variant))" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Faturamento por Campanha</CardTitle></CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barDataEcom}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nome_campanha" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="faturamento" fill="hsl(var(--primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Funil de Vendas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {funnelEcom.map((s, i) => {
                        const max = funnelEcom[0].value || 1;
                        const pct = Math.min(100, Math.round((s.value / (max || 1)) * 100));
                        return (
                            <div key={i}>
                                <div className="flex justify-between text-sm text-muted-foreground"><span>{s.label}</span><span>{s.value.toLocaleString()}</span></div>
                                <div className="h-3 bg-muted rounded-md overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Detalhamento</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Campanha</TableHead>
                                <TableHead>Conjunto</TableHead>
                                <TableHead>Anúncio</TableHead>
                                <TableHead className="text-right">Investimento</TableHead>
                                <TableHead className="text-right">Visitas</TableHead>
                                <TableHead className="text-right">Carrinho</TableHead>
                                <TableHead className="text-right">Checkout</TableHead>
                                <TableHead className="text-right">Compras</TableHead>
                                <TableHead className="text-right">Faturamento</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {filtered.map((r, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{r.data_do_relatorio}</TableCell>
                                        <TableCell>{r.nome_campanha}</TableCell>
                                        <TableCell>{r.nome_conjunto_anuncios}</TableCell>
                                        <TableCell>{r.nome_anuncio}</TableCell>
                                        <TableCell className="text-right">{r.investimento.toLocaleString(undefined, { style: "currency", currency: "BRL" })}</TableCell>
                                        <TableCell className="text-right">{r.visualizacoes_pagina.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(r.adicoes_carrinho ?? 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(r.inicios_checkout ?? 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(r.compras ?? 0).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{(r.faturamento ?? 0).toLocaleString(undefined, { style: "currency", currency: "BRL" })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
