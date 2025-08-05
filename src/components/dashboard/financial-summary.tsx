
import { BarChart2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const mockData = [
  {
    name: "Seg",
    total: 180.00
  },
  {
    name: "Ter",
    total: 240.00
  },
  {
    name: "Qua",
    total: 320.00
  },
  {
    name: "Qui",
    total: 280.00
  },
  {
    name: "Sex",
    total: 420.00
  },
  {
    name: "Sáb",
    total: 560.00
  },
  {
    name: "Dom",
    total: 0
  }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-md shadow-md border text-sm">
        <p className="font-medium">R$ {payload[0].value.toFixed(2)}</p>
      </div>
    );
  }

  return null;
};

export function FinancialSummary() {
  // Calcular o total da semana
  const weekTotal = mockData.reduce((acc, curr) => acc + curr.total, 0);
  
  return (
    <Card className="barber-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumo financeiro</CardTitle>
        <div className="flex items-center bg-secondary rounded-md px-2 py-1 text-sm">
          <span>Esta semana</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-barber-gold" />
            <span className="text-2xl font-bold">
              R$ {weekTotal.toFixed(2)}
            </span>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis 
                  dataKey="name" 
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="total" 
                  radius={[4, 4, 0, 0]}
                >
                  {mockData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={index === 5 ? "#d4af37" : "#1e293b"}
                      opacity={index === 6 ? 0.3 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
