// src/components/dashboard/Charts.tsx
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { fmtMoney } from "@/utils/format";

type Point = { date: string; faturamento: number; roas: number };
type BarItem = { name: string; faturamento: number };

// Paleta: use as vars do tema (hsl(var(--chart-*)))
const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--chart-1))",
  },
  roas: {
    label: "ROAS",
    color: "hsl(var(--chart-2))",
  },
} as const;

export function RevenueOverTime({ data }: { data: Point[] }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="text-lg font-semibold mb-4">
          Evolução de Faturamento e ROAS
        </div>

        <ChartContainer config={chartConfig} className="w-full h-[260px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => fmtMoney(Number(v))}
            />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <ChartTooltip content={
              <ChartTooltipContent indicator="dot" />
            } />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="faturamento"
              stroke="var(--color-faturamento)"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="roas"
              stroke="var(--color-roas)"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function RevenueByCampaign({ data }: { data: BarItem[] }) {
  const config = {
    faturamento: { label: "Faturamento", color: "hsl(var(--chart-1))" },
  } as const;

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="text-lg font-semibold mb-4">Faturamento por Campanha</div>

        <ChartContainer config={config} className="w-full h-[260px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => fmtMoney(Number(v))} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="faturamento"
              fill="var(--color-faturamento)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
