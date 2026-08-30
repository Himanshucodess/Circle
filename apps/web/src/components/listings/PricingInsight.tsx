import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";

type Rating = "EXCELLENT" | "GOOD" | "COMPETITIVE" | "HIGH" | "TOO_HIGH" | "NO_DATA";

interface Props {
  insight: {
    listingPrice: number;
    medianPrice: number | null;
    comparableCount: number;
    differencePercent: number | null;
    rating: Rating;
    message: string;
    range?: { min: number; max: number };
  };
}

const meta: Record<Rating, { label: string; color: string; icon: any; bg: string }> = {
  EXCELLENT: { label: "Excellent price", color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-50 border-emerald-200" },
  GOOD: { label: "Good price", color: "text-emerald-600", icon: TrendingDown, bg: "bg-emerald-50 border-emerald-200" },
  COMPETITIVE: { label: "Competitive", color: "text-blue-700", icon: Minus, bg: "bg-blue-50 border-blue-200" },
  HIGH: { label: "High", color: "text-amber-700", icon: TrendingUp, bg: "bg-amber-50 border-amber-200" },
  TOO_HIGH: { label: "Too high", color: "text-red-700", icon: AlertTriangle, bg: "bg-red-50 border-red-200" },
  NO_DATA: { label: "No data", color: "text-muted-foreground", icon: Minus, bg: "bg-muted border" },
};

export function PricingInsight({ insight }: Props) {
  const m = meta[insight.rating];
  const Icon = m.icon;
  return (
    <Card className={`overflow-hidden ${m.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`w-4 h-4 ${m.color}`} />
          <span className={`text-sm font-semibold ${m.color}`}>{m.label}</span>
          <Badge variant="outline" className="ml-auto text-xs">{insight.comparableCount} comparable</Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
        {insight.medianPrice && insight.range && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>₹{insight.range.min.toLocaleString()}</span>
              <span>Median ₹{insight.medianPrice.toLocaleString()}</span>
              <span>₹{insight.range.max.toLocaleString()}</span>
            </div>
            <div className="relative h-2 bg-white rounded-full border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 via-blue-200 to-amber-200" />
              {/* marker for listing price */}
              {(() => {
                const min = insight.range!.min;
                const max = insight.range!.max;
                const span = max - min || 1;
                const pct = Math.min(100, Math.max(0, ((insight.listingPrice - min) / span) * 100));
                return <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow" style={{ left: `calc(${pct}% - 6px)` }} />;
              })()}
            </div>
            <div className="text-center text-xs font-medium mt-1">Your price: ₹{insight.listingPrice.toLocaleString()}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
