
import { CreditCard, Scissors, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
  return (
    <Card className="barber-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <span className={`text-xs font-medium flex items-center ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${
                trend.isPositive ? '' : 'transform rotate-180'
              }`} />
              {trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickStats() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Agendamentos hoje"
        value="8"
        description="2 concluídos, 6 restantes"
        icon={<Calendar className="h-4 w-4 text-barber-gold" />}
      />
      <StatsCard
        title="Atendimentos"
        value="24"
        description="Esta semana"
        icon={<Scissors className="h-4 w-4 text-barber-gold" />}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Faturamento"
        value="R$ 1.240"
        description="Esta semana"
        icon={<CreditCard className="h-4 w-4 text-barber-gold" />}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard
        title="Ticket médio"
        value="R$ 52"
        description="Esta semana"
        icon={<TrendingUp className="h-4 w-4 text-barber-gold" />}
        trend={{ value: 3, isPositive: true }}
      />
    </div>
  );
}
