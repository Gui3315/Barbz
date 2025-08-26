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
import {FaWhatsapp} from 'react-icons/fa'

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
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg h-12 hover:scale-110 transition-transform"
            asChild
          >
            <Link to="/login">Faça login</Link>
          </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-28 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="container max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                <Scissors className="h-4 w-4" />
                Gestão moderna para barbearias
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                Barbz: Agendamento e Gestão Financeira em um só lugar
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                Plataforma online para barbearias controlarem <strong>agendamentos</strong>, <strong>clientes</strong>, e <strong>caixa</strong> sem complicação. Mais organização, menos faltas e mais lucro para seu negócio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-4 h-auto shadow-xl shadow-amber-500/25 hover:scale-110 transition-transform"
                  asChild
                >
                  <Link to="/login">
                    Cadastre-se e teste grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    
                  </div>
                  
                </div>
                <div className="flex items-center gap-1">
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-2 shadow-2xl">
                <img
                  src="/dashboard1.jpg"
                  alt="Dashboard do Barbz com agendamentos e caixa"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que entregamos */}
      <section className="py-16 px-6 bg-white">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 text-center">
            Tudo que sua barbearia precisa para crescer
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed text-center">
            O Barbz integra agendamento online, gestão de clientes, controle financeiro e notificações automáticas em uma plataforma simples e segura.
          </p>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-16 px-6 bg-slate-50">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Funcionalidades principais
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="h-12 w-12 text-blue-600" />}
              title="Agendamento Online"
              description="Clientes marcam horário pelo site ou aplicativo. Evite sobreposição e reduza faltas com lembretes automáticos."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-purple-600" />}
              title="Gestão de Clientes"
              description="Histórico de visitas, preferências, aniversários e contato fácil. Fidelize e personalize o atendimento."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<DollarSign className="h-12 w-12 text-green-600" />}
              title="Controle Financeiro"
              description="Registre entradas, saídas, veja relatórios e saiba exatamente quanto sua barbearia está lucrando."
              gradient="from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="pq" className="py-16 px-6 bg-white">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
            Por que usar o Barbz?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ul className="space-y-4 text-lg text-slate-700">
              <BenefitItem text="Reduza faltas com lembretes automáticos por WhatsApp, SMS e push" />
              <BenefitItem text="Reagendamento e cancelamento fácil para clientes e equipe" />
              <BenefitItem text="Gestão de múltiplos barbeiros e serviços" />
              <BenefitItem text="Controle de caixa e relatórios financeiros detalhados" />
            </ul>
            <ul className="space-y-4 text-lg text-slate-700">
              <BenefitItem text="Programa de fidelidade e cashback integrado" />
              <BenefitItem text="Cadastro rápido de clientes e histórico de visitas" />
              <BenefitItem text="Plataforma 100% online, segura e responsiva" />
              <BenefitItem text="Suporte dedicado para sua barbearia crescer" />
            </ul>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-16 px-6 bg-slate-100">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
            Escolha o plano ideal para sua barbearia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PlanCard
              title="Basic"
              price="R$29,90"
              description="Ideal para quem está começando e quer organizar a agenda."
              features={[
                "Agenda online",
                "Cadastro de clientes",
                "Acesso em qualquer dispositivo",
              ]}
              highlight={true}
            />
            <PlanCard
              title="Pro"
              price="R$39,90"
              description="Para quem quer controle financeiro e mais visão do negócio."
              features={[
                "Agenda Online",
                "Cadastro de clientes",
                "Dashboard financeiro",                
              ]}
              highlight={true}
            />
            <PlanCard
              title="Premium"
              price="R$49,90"
              description="Para barbearias que querem o máximo em automação e vendas."
              features={[
                "Tudo do Pro",
                "Notificações push avançadas",
                "Vendas de produtos",
              ]}
              highlight={true}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="FAQ" className="py-16 px-6 bg-slate-50">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
            Perguntas Frequentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Preciso instalar algum programa?</h3>
              <p className="text-slate-700 mb-4">Não! O Barbz é 100% online, funciona no computador e no celular, sem instalação.</p>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Como funciona o agendamento?</h3>
              <p className="text-slate-700 mb-4">O cliente escolhe o serviço, o barbeiro e o horário disponível.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">O Barbz é seguro?</h3>
              <p className="text-slate-700 mb-4">Sim! Seus dados e dos clientes são protegidos com criptografia e backups automáticos.</p>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Tem suporte?</h3>
              <p className="text-slate-700 mb-4">Sim, nosso time está pronto para ajudar por WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quem usa, recomenda!
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
              testimonial="O Barbz facilitou demais o controle de horários e caixa. Meus clientes elogiam o lembrete no WhatsApp e o cashback!"
            />
            <TestimonialCard
              name="Ricardo Silva"
              business="Barber Shop Premium"
              avatar="RS"
              testimonial="Consigo ver todos os agendamentos, reagendar fácil e ainda premiar meus clientes fiéis. Recomendo para todo barbeiro!"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white relative overflow-hidden">
        <div className="container max-w-5xl mx-auto text-center space-y-8 relative">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Pronto para profissionalizar sua barbearia?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Teste o Barbz gratuitamente por <strong>7 dias</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xl px-10 py-5 h-auto shadow-2xl shadow-amber-500/25 hover:scale-110 transition-transform"
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
                Barbz: agendamento, fidelidade e gestão financeira para barbearias. Plataforma online, fácil e segura.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">Avaliado por +50 barbearias</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <div className="space-y-2">
                <a href="#funcionalidades" className="block text-slate-400 hover:text-white transition-colors">
                  Funcionalidades
                </a>
                <a href="#pq" className="block text-slate-400 hover:text-white transition-colors">
                  Por que usar o Barbz?
                </a>
                <a href="#planos" className="block text-slate-400 hover:text-white transition-colors">
                  Planos
                </a>
                <a href="#FAQ" className="block text-slate-400 hover:text-white transition-colors">
                  Perguntas frequentes
                </a>
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
      <Whatsapp />
    </div>
  )
}

// Card de funcionalidade
function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode, title: string, description: string, gradient: string }) {
  return (
    <div className={`rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white shadow-lg flex flex-col items-center text-center hover:scale-110 transition-transform`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </div>
  )
}

// Item de benefício
function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-500" />
      <span className="text-slate-700">{text}</span>
    </li>
  )
}

// Card de depoimento
function TestimonialCard({ name, business, avatar, testimonial }: { name: string, business: string, avatar: string, testimonial: string }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 shadow-lg flex flex-col gap-4 hover:scale-110 transition-transform">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">{avatar}</div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-slate-300">{business}</div>
        </div>
      </div>
      <p className="text-white/90 italic">"{testimonial}"</p>
    </div>
  )
}

function PlanCard({
  title,
  price,
  description,
  features,
  highlight,
}: {
  title: string
  price: string
  description: string
  features: string[]
  highlight?: boolean
}) {
  return (
    <div className={`rounded-2xl border  bg-white p-8 flex flex-col items-center text-center hover:scale-110 transition-transform "}`}>
      <h3 className={`text-2xl font-bold mb-2 ${highlight ? "text-blue-700" : "text-slate-900"}`}>{title}</h3>
      <div className="text-3xl font-extrabold mb-2">{price}<span className="text-base font-normal text-slate-500">/mês</span></div>
      <p className="text-slate-600 mb-4">{description}</p>
      <ul className="space-y-2 text-left">
  {features.map((f, i) => (
    <li key={i} className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-500" />
      <span>{f}</span>
    </li>
  ))}
</ul>
<Button className={`w-full mt-6 ${highlight ? "bg-blue-700 hover:bg-blue-800" : ""}`}>
  Assinar {title}
</Button>
    </div>
  )
}

function Whatsapp() {
  return (
    <a
      href="https://wa.me/5515988392811?text=Ol%C3%A1,%20quero%20saber%20mais%20sobre%20o%20Barbz."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <button className="flex items-center justify-center h-20 w-20 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg animate-float">
        <FaWhatsapp size={50} />
      </button>
    </a>
  );
}
