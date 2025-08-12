import type React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import {
  ArrowRight,
  BarChart,
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  Scissors,
  TrendingUp,
  Shield,
} from "lucide-react"

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 py-2 px-0 sticky top-0 z-50 w-full">
        <div className="w-full flex flex-row items-center gap-1 sm:gap-2 pl-5 md:pl-8 lg:pl-12">
          <Logo className="h-8 sm:h-10 mr-1" />
          <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-auto mr-2 md:ml-0 md:mr-4 lg:mr-8 w-auto"
            style={{marginLeft: 'auto'}}
          >
            <Button 
              variant="ghost" 
              className="text-slate-600 hover:text-slate-900 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base min-w-0"
              asChild
            >
              <Link to="/login">Área do Cliente</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-base min-w-0"
              asChild
            >
              <Link to="/login">Área do Proprietário</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative py-20 md:py-28 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="container max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium">
                <Scissors className="h-4 w-4" />
                Sistema #1 para Barbearias
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                Chega de perder
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {" "}
                  tempo e dinheiro
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                Saiba quanto seu negócio fatura, <strong>de verdade</strong>. Controle total da sua barbearia em uma
                plataforma completa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-4 h-auto shadow-xl shadow-amber-500/25"
                  asChild
                >
                  <Link to="/login">
                    Começar agora grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-300 hover:bg-white hover:text-slate-900 text-lg px-8 py-4 h-auto bg-transparent"
                >
                  Agendar demonstração
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-slate-300">+500 barbearias confiam</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-slate-300 ml-1">4.9/5</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-2 shadow-2xl">
                <img
                  src="/dashboard1.jpg"
                  alt="BARBZ Dashboard"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points section */}
      <section className="py-20 px-6 bg-white">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Problemas que <span className="text-red-600">resolvemos</span> para sua barbearia
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Você enfrenta algumas dessas dificuldades no seu dia a dia? Não está sozinho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PainPointCard
              icon={<Clock className="h-12 w-12 text-red-500" />}
              title="Horários desorganizados"
              description="Clientes que não aparecem, sobreposição de horários e tempo ocioso entre atendimentos."
              bgColor="bg-red-50"
              borderColor="border-red-200"
            />
            <PainPointCard
              icon={<DollarSign className="h-12 w-12 text-amber-600" />}
              title="Controle financeiro caótico"
              description="Não saber quanto entra e quanto sai do caixa, despesas inesperadas e dificuldade em planejar."
              bgColor="bg-amber-50"
              borderColor="border-amber-200"
            />
            <PainPointCard
              icon={<MessageSquare className="h-12 w-12 text-blue-600" />}
              title="Comunicação ineficiente"
              description="Clientes que esquecem dos agendamentos e falta de canal direto para avisos importantes."
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
            />
          </div>
        </div>
      </section>

      {/* Solutions section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              A{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                solução completa
              </span>{" "}
              para barbearias
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Veja como o BARBZ resolve todos esses problemas com uma plataforma integrada
            </p>
          </div>

          {/* Agendamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                <img
                  src="/agendamento.jpg"
                  alt="Agendamentos BARBZ"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                <Calendar className="h-5 w-5" />
                AGENDAMENTOS INTELIGENTES
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Agende por horário ou por profissional</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Sistema inteligente que evita conflitos de horários e otimiza seu dia. Envio automático de lembretes
                para diminuir faltas e permitir reagendamentos com antecedência.
              </p>
              <div className="space-y-4">
                <BenefitItem text="Redução de 50% nas faltas de clientes" />
                <BenefitItem text="Visualização diária, semanal e mensal" />
                <BenefitItem text="Interface rápida e fácil de usar" />
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 lg:order-1 space-y-6">
              <div className="inline-flex items-center gap-3 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                <TrendingUp className="h-5 w-5" />
                CONTROLE FINANCEIRO TOTAL
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                Saiba exatamente quanto seu negócio fatura
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Acompanhe entradas e saídas, compare com metas mensais e tenha relatórios completos exportáveis.
                Identifique produtos e serviços mais lucrativos.
              </p>
              <div className="space-y-4">
                <BenefitItem text="Planejamento financeiro mensal" />
                <BenefitItem text="Relatórios detalhados por período" />
                <BenefitItem text="Identifique facilmente tendências e oportunidades" />
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                <img
                  src="/fatura.jpg"
                  alt="Financeiro BARBZ"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Fidelização */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                <img
                  src="/fidelizar.jpg"
                  alt="Clientes VIP BARBZ"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
                <Users className="h-5 w-5" />
                FIDELIZAÇÃO INTELIGENTE
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                Transforme clientes ocasionais em clientes fiéis
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Sistema de fidelidade com pontos e recompensas personalizáveis. Recomendação de serviços baseados no
                histórico para clientes VIP.
              </p>
              <div className="space-y-4">
                <BenefitItem text="Aumento médio de 30% nas visitas recorrentes" />
                <BenefitItem text="Recompensas que estimulam experimentação de novos serviços" />
                <BenefitItem text="Sugestões personalizadas que aumentam o ticket médio" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20 px-6 bg-white">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Tudo que você precisa em <span className="text-blue-600">um único lugar</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Gerencie agendamentos, clientes, financeiro e muito mais em uma plataforma completa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-12 w-12 text-blue-600" />}
              title="Agendamentos"
              description="Sistema de agendamento fácil e rápido, com lembretes automáticos."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-purple-600" />}
              title="Gestão de Clientes"
              description="Cadastro completo e histórico de todos os seus clientes."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<DollarSign className="h-12 w-12 text-green-600" />}
              title="Controle Financeiro"
              description="Acompanhe entradas, saídas e rentabilidade do seu negócio."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<BarChart className="h-12 w-12 text-orange-600" />}
              title="Relatórios e Métricas"
              description="Dados e insights para tomar as melhores decisões."
              gradient="from-orange-500 to-red-500"
            />
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              O que nossos <span className="text-amber-400">clientes dizem</span>
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xl font-semibold ml-2">4.9/5 estrelas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard
              name="Marcelo Costa"
              business="Barbearia Vintage"
              avatar="MC"
              testimonial="Desde que começamos a usar o BARBZ, as faltas dos clientes diminuíram em mais de 60%. O sistema de lembretes é fantástico e o controle financeiro nos ajudou a entender onde investir mais."
            />
            <TestimonialCard
              name="Ricardo Silva"
              business="Barber Shop Premium"
              avatar="RS"
              testimonial="O programa de fidelidade transformou nosso negócio. Os clientes voltam com mais frequência e gastam mais por visita. A gestão de estoque também nos fez economizar muito dinheiro."
            />
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
        <div className="container max-w-5xl mx-auto text-center space-y-8 relative">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Pronto para <span className="text-amber-300">transformar</span> sua barbearia?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Experimente o BARBZ gratuitamente por <strong>14 dias</strong>. Sem compromisso, sem cartão de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xl px-10 py-5 h-auto shadow-2xl shadow-amber-500/25"
              asChild
            >
              <Link to="/login">
                Começar gratuitamente
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <div className="flex items-center gap-3 text-blue-100">
              <Shield className="h-5 w-5" />
              <span>Seguro e confiável</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Logo className="h-10 mb-4" />
              <p className="text-slate-400 mb-4 max-w-md">
                A plataforma completa para gestão de barbearias. Transforme seu negócio com tecnologia de ponta.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">Avaliado por +500 barbearias</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <div className="space-y-2">
                <Link to="#" className="block text-slate-400 hover:text-white transition-colors">
                  Funcionalidades
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-white transition-colors">
                  Preços
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-white transition-colors">
                  Demonstração
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <div className="space-y-2">
                <Link to="#" className="block text-slate-400 hover:text-white transition-colors">
                  Central de Ajuda
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-white transition-colors">
                  Contato
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-white transition-colors">
                  WhatsApp
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">© 2025 BARBZ. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                Termos de Uso
              </Link>
              <Link to="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PainPointCard({
  icon,
  title,
  description,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  bgColor: string
  borderColor: string
}) {
  return (
    <div
      className={`${bgColor} ${borderColor} border-2 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        <CheckCircle className="h-6 w-6 text-green-500" />
      </div>
      <span className="text-slate-700 font-medium">{text}</span>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>
      <div className="relative">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({
  name,
  business,
  avatar,
  testimonial,
}: {
  name: string
  business: string
  avatar: string
  testimonial: string
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-white text-lg">{name}</p>
          <p className="text-blue-200">{business}</p>
        </div>
      </div>
      <p className="text-blue-100 leading-relaxed text-lg">"{testimonial}"</p>
    </div>
  )
}
