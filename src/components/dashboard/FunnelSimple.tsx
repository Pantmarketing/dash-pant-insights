import { Card, CardContent } from "@/components/ui/card";
import { fmtPercent } from "@/utils/format";

type Step = { label: string; value: number };

export default function FunnelSimple({ steps }: { steps: Step[] }) {
  const max = Math.max(...steps.map(s => s.value), 1);
  const conv = (from: number, to: number) => (from === 0 ? 0 : to / from);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="text-lg font-semibold mb-4">Funil de Vendas</div>
        <div className="space-y-3">
          {steps.map((s, i) => {
            const w = Math.max((s.value / max) * 100, 4);
            const prev = steps[i - 1]?.value ?? 0;
            const rate = i === 0 ? undefined : conv(prev, s.value);
            return (
              <div key={s.label}>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{s.label}</span>
                  <span className="tabular-nums">{s.value}</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${w}%`, background: "var(--chart-1)" }}
                  />
                </div>
                {rate !== undefined && (
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Conversão da etapa anterior: <strong>{fmtPercent(rate)}</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
