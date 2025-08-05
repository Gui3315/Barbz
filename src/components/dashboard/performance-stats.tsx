
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

function Stat({ title, value, target, unit, color }: StatProps) {
  const percentage = Math.min(Math.round((value / target) * 100), 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">Meta: {target} {unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={percentage} className="h-2" indicatorColor={color} />
        <span className="text-sm font-medium min-w-[45px] text-right">
          {value} {unit}
        </span>
      </div>
    </div>
  );
}

export function PerformanceStats() {
  return (
    <Card className="barber-card">
      <CardHeader>
        <CardTitle>Metas da semana</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Stat
          title="Atendimentos"
          value={24}
          target={35}
          unit="un"
          color="bg-barber-gold"
        />
        <Stat
          title="Faturamento"
          value={1240}
          target={2000}
          unit="R$"
          color="bg-barber-copper"
        />
        <Stat
          title="Novos clientes"
          value={5}
          target={10}
          unit="un"
          color="bg-barber-red"
        />
        <Stat
          title="Produtos vendidos"
          value={8}
          target={15}
          unit="un"
          color="bg-blue-500"
        />
      </CardContent>
    </Card>
  );
}
