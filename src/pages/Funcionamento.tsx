import { DashboardLayout } from "@/components/dashboard/layout";
import ConfiguracoesFuncionamento from "./ConfiguracoesFuncionamento";

export default function Funcionamento() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="header-text">Funcionamento</h1>
        </div>
        
        <ConfiguracoesFuncionamento />
      </div>
    </DashboardLayout>
  );
}
