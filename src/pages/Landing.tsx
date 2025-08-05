
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowRight, 
  BarChart, 
  Calendar, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Clock,
  Layers 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="container max-w-6xl mx-auto flex justify-between items-center">
          <Logo className="h-10" />
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link to="/cliente">Área do Cliente</Link>
            </Button>
            <Button className="btn-primary" asChild>
              <Link to="/">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="py-16 md:py-24 px-6 bg-barber-gold/5">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Chega de perder tempo e dinheiro com gestão ineficiente
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Saiba quanto seu negócio fatura, de verdade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="btn-primary text-lg" size="lg" asChild>
                  <Link to="/">
                    Começar agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Agendar demonstração
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="BARBZ Dashboard" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Pain Points section */}
      <section className="py-16 px-6 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Problemas que resolvemos para sua barbearia</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Você enfrenta algumas dessas dificuldades no seu dia a dia?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="mb-4 p-3 bg-red-100 rounded-lg w-fit">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Horários desorganizados</h3>
              <p className="text-muted-foreground">
                Clientes que não aparecem, sobreposição de horários e tempo ocioso entre atendimentos.
              </p>
            </div>
            
            <div className="border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="mb-4 p-3 bg-amber-100 rounded-lg w-fit">
                <DollarSign className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Controle financeiro caótico</h3>
              <p className="text-muted-foreground">
                Não saber quanto entra e quanto sai do caixa, despesas inesperadas e dificuldade em planejar.
              </p>
            </div>
            
            <div className="border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="mb-4 p-3 bg-blue-100 rounded-lg w-fit">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Comunicação ineficiente</h3>
              <p className="text-muted-foreground">
                Clientes que esquecem dos agendamentos e falta de canal direto para avisos importantes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Screenshots section */}
      <section className="py-16 px-6 bg-barber-gold/5">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O sistema completo para barbearias</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Veja como o BARBZ resolve todos esses problemas com uma plataforma integrada
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="Agendamentos BARBZ" 
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-barber-gold font-medium mb-2">
                <Calendar className="h-5 w-5" />
                <span>AGENDAMENTOS SIMPLIFICADOS</span>
              </div>
              <h3 className="text-2xl font-bold">Agende por horário ou por profissional</h3>
              <p className="text-lg text-muted-foreground">
                Sistema inteligente que evita conflitos de horários e otimiza seu dia. Envio automático 
                de lembretes para diminuir faltas e permitir reagendamentos com antecedência.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Redução de 50% nas faltas de clientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Visualização diária, semanal e mensal</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Interface rápida e fácil de usar</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-barber-gold font-medium mb-2">
                <DollarSign className="h-5 w-5" />
                <span>CONTROLE FINANCEIRO TOTAL</span>
              </div>
              <h3 className="text-2xl font-bold">Saiba exatamente quanto seu negócio fatura</h3>
              <p className="text-lg text-muted-foreground">
                Acompanhe entradas e saídas, compare com metas mensais e tenha relatórios 
                completos exportáveis. Identifique produtos e serviços mais lucrativos.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Planejamento financeiro mensal</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Relatórios detalhados por período</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Identifique facilmente tendências e oportunidades</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-xl overflow-hidden shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="Financeiro BARBZ" 
                className="w-full h-auto"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl overflow-hidden shadow-xl">
              <img 
                src="/placeholder.svg" 
                alt="Clientes VIP BARBZ" 
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-barber-gold font-medium mb-2">
                <Users className="h-5 w-5" />
                <span>FIDELIZAÇÃO INTELIGENTE</span>
              </div>
              <h3 className="text-2xl font-bold">Transforme clientes ocasionais em clientes fiéis</h3>
              <p className="text-lg text-muted-foreground">
                Sistema de fidelidade com pontos e recompensas personalizáveis. 
                Recomendação de serviços baseados no histórico para clientes VIP.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Aumento médio de 30% nas visitas recorrentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Recompensas que estimulam experimentação de novos serviços</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Sugestões personalizadas que aumentam o ticket médio</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tudo que você precisa em um único lugar</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gerencie agendamentos, clientes, financeiro e muito mais em uma plataforma completa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Calendar className="h-10 w-10 text-barber-gold" />}
              title="Agendamentos"
              description="Sistema de agendamento fácil e rápido, com lembretes automáticos."
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-barber-gold" />}
              title="Gestão de Clientes"
              description="Cadastro completo e histórico de todos os seus clientes."
            />
            <FeatureCard 
              icon={<DollarSign className="h-10 w-10 text-barber-gold" />}
              title="Controle Financeiro"
              description="Acompanhe entradas, saídas e rentabilidade do seu negócio."
            />
            <FeatureCard 
              icon={<BarChart className="h-10 w-10 text-barber-gold" />}
              title="Relatórios e Métricas"
              description="Dados e insights para tomar as melhores decisões."
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials section */}
      <section className="py-16 px-6 bg-barber-gold/5">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">O que nossos clientes dizem</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-barber-light flex items-center justify-center text-white font-bold">
                  MC
                </div>
                <div>
                  <p className="font-medium">Marcelo Costa</p>
                  <p className="text-sm text-muted-foreground">Barbearia Vintage</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Desde que começamos a usar o BARBZ, as faltas dos clientes diminuíram em mais de 60%. 
                O sistema de lembretes é fantástico e o controle financeiro nos ajudou a entender onde 
                investir mais."
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-barber-light flex items-center justify-center text-white font-bold">
                  RS
                </div>
                <div>
                  <p className="font-medium">Ricardo Silva</p>
                  <p className="text-sm text-muted-foreground">Barber Shop Premium</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "O programa de fidelidade transformou nosso negócio. Os clientes voltam com mais 
                frequência e gastam mais por visita. A gestão de estoque também nos fez economizar 
                muito dinheiro."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 px-6 bg-barber bg-opacity-10">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Pronto para transformar sua barbearia?</h2>
          <p className="text-xl text-muted-foreground">
            Experimente o BARBZ gratuitamente por 14 dias. Sem compromisso.
          </p>
          <Button className="btn-primary text-lg" size="lg" asChild>
            <Link to="/">
              Começar gratuitamente
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-8 px-6 mt-auto">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo className="h-8 mb-2" />
            <p className="text-sm text-muted-foreground">
              © 2025 BARBZ. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Termos de Uso
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Privacidade
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="border rounded-xl p-6 hover:shadow-md transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
