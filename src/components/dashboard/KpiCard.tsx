import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: number;
  format?: "currency" | "percent" | "number";
  precision?: number;
}

function formatValue(value: number, format: KpiCardProps["format"], precision = 2) {
  if (format === "currency") return value.toLocaleString(undefined, { style: "currency", currency: "BRL" });
  if (format === "percent") return `${(value * 100).toFixed(precision)}%`;
  if (format === "number") return value.toFixed(precision);
  return value.toLocaleString();
}

const KpiCard = ({ label, value, format, precision }: KpiCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{formatValue(value, format, precision)}</div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
