import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  delta?: number; // variação em %
  help?: string;
};

export default function MetricCard({ label, value, delta, help }: Props) {
  const isUp = (delta ?? 0) >= 0;
  const showDelta = typeof delta === "number";

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          {label}
          {help && (
            <span className="text-xs text-muted-foreground/70" title={help}>ⓘ</span>
          )}
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>

        {showDelta && (
          <div
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-xs font-medium",
              isUp ? "text-emerald-600" : "text-rose-600"
            )}
          >
            <span className="inline-block w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent"
              style={{
                borderBottomWidth: isUp ? 8 : 0,
                borderTopWidth: isUp ? 0 : 8,
                borderBottomColor: isUp ? "currentColor" : "transparent",
                borderTopColor: isUp ? "transparent" : "currentColor",
              }}
            />
            {isUp ? "↑" : "↓"} {Math.abs(delta!).toFixed(2)}%
            <span className="text-muted-foreground/70 ml-1">vs período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
