"use client"

import React, { useEffect, useState } from "react"
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { salonSchedule } from "@/config/salonSchedule"

// Máscara de telefone (XX) XXXXX-XXXX
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  let formatted = "";
  if (digits.length > 0) formatted += "(" + digits.substring(0, 2);
  if (digits.length > 2) formatted += ") " + digits.substring(2, 7);
  if (digits.length > 7) formatted += "-" + digits.substring(7, 11);
  return formatted;
}

// Máscara de CEP XXXXX-XXX
function formatCEP(value: string) {
  const digits = value.replace(/\D/g, "")
  let formatted = ""
  if (digits.length > 0) formatted += digits.substring(0, 5)
  if (digits.length > 5) formatted += "-" + digits.substring(5, 8)
  return formatted
}

// Função para aplicar máscara de CNPJ
function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "")
  let formatted = ""
  if (digits.length > 0) formatted += digits.substring(0, 2)
  if (digits.length > 2) formatted += "." + digits.substring(2, 5)
  if (digits.length > 5) formatted += "." + digits.substring(5, 8)
  if (digits.length > 8) formatted += "/" + digits.substring(8, 12)
  if (digits.length > 12) formatted += "-" + digits.substring(12, 14)
  return formatted
}

// Função auxiliar para determinar a mensagem de erro do CNPJ
function getErrorMessage(cnpjInfo: any) {
  if (cnpjInfo.descricao_situacao_cadastral !== "ATIVA") {
    return `CNPJ inativo (Situação: ${cnpjInfo.descricao_situacao_cadastral})`;
  }
  const cnaesValidos = ["9602501", "9602-5/01", 96025, 9602501];
  const cnaeString = String(cnpjInfo.cnae_fiscal);
  const cnaeDescricao = String(cnpjInfo.cnae_fiscal_descricao || "").toLowerCase();
  const cnaeValido = cnaesValidos.some(
    (cnae) => cnaeString === String(cnae) || cnaeString.replace(/[^0-9]/g, "") === String(cnae).replace(/[^0-9]/g, "")
  );
  const palavrasChave = ["cabeleireiro", "manicure", "pedicure", "salão", "beleza", "estética"];
  const descricaoValida = palavrasChave.some((palavra) => cnaeDescricao.includes(palavra));
  if (!cnaeValido && !descricaoValida) {
    return `CNPJ não é da área de beleza. CNAE: ${cnpjInfo.cnae_fiscal} - ${cnpjInfo.cnae_fiscal_descricao}`;
  }
  return "CNPJ inválido";
}

// Validação forte de senha
function isPasswordStrong(pw: string) {
  return pw.length >= 6 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)
}

export default function Login() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Redireciona se já estiver logado
  useEffect(() => {
    if (user) {
      const targetRoute = user.user_type === "proprietario" ? "/agendamentos" : "/cliente";
      navigate(targetRoute);
    }
  }, [user, navigate]);

  const [phone, setPhone] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [cep, setCep] = useState("")
  const [mode, setMode] = useState<"login" | "signup" | "reset" | "resend">("login")
  const [userType, setUserType] = useState<"cliente" | "proprietario">("cliente")
  const [cnpj, setCnpj] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle")
  const [cnpjInfo, setCnpjInfo] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const emailNorm = email.trim().toLowerCase();
    
    try {
      // 1. Faz login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNorm,
        password
      });
      
      if (error) {
        console.error("❌ Erro no login:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Erro inesperado - usuário não encontrado");
        setLoading(false);
        return;
      }

      // 2. Busca o perfil do usuário para pegar o user_type
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        console.error("❌ Erro ao buscar perfil:", profileError);
        setError("Perfil não encontrado. Entre em contato com o suporte.");
        setLoading(false);
        return;
      }

      // 3. Cria objeto do usuário
      const authUser = {
        id: data.user.id,
        email: data.user.email!,
        user_type: profile.user_type as "proprietario" | "cliente"
      };

      // 4. Salva no context (que vai salvar no localStorage automaticamente)
      setUser(authUser);

      // 5. OBTÉM O TOKEN FCM E SALVA NO BACKEND
      if (Notification.permission !== "denied") {
        console.log("Permissão atual:", Notification.permission);
        Notification.requestPermission().then(async (permission) => {
          console.log("Permissão:", permission);
          if (permission === "granted") {
            try {
              const token = await getToken(messaging, {
                vapidKey: "BEpssaIfMV9-bdgf4_MMcJMM80NKT8axxCvXJeq3B6idOzLY0HXPXrewwMmLqnqE6vzro466LDqj-RFLDda3JCw"
              });
              if (token) {
              // Salva o token diretamente no Supabase
              await supabase
                .from("push_tokens")
                .upsert([
                  { user_id: authUser.id, token }
                ]);
            }
            } catch (err) {
              console.error("Erro ao obter token FCM:", err);
            }
          }
        });
      }

      // 6. Redireciona baseado no tipo
      const targetRoute = profile.user_type === "proprietario" ? "/agendamentos" : "/cliente";
      navigate(targetRoute);

    } catch (err: any) {
      console.error("❌ Erro inesperado no login:", err);
      setError(err?.message || "Erro inesperado ao tentar login.");
    } finally {
      setLoading(false);
    }
  }

  // Validação de CNPJ via BrasilAPI
  const validarCNPJ = async (cnpj: string) => {
    setCnpjStatus("validating")
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, "")
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      const data = await response.json()
      // Verifica se está ativo e se o CNAE principal é 9602-5/01
      const cnaePrincipal = String(data.cnae_fiscal)
      const cnaeDescricao = String(data.cnae_fiscal_descricao).toLowerCase()
      // Aceita apenas se cnae_fiscal for 9602501 ou cnae_fiscal_descricao for exatamente 'Cabeleireiros, manicure e pedicure'
      const cnaeAceito = cnaePrincipal === "9602501"
      const descricaoAceita = cnaeDescricao.trim() === "cabeleireiros, manicure e pedicure"
      if (data.cnpj && data.descricao_situacao_cadastral === "ATIVA" && (cnaeAceito || descricaoAceita)) {
        setCnpjStatus("valid")
        setCnpjInfo(data)
        return true
      }
      setCnpjStatus("invalid")
      setCnpjInfo(data) // Mantém info para mostrar motivo
      return false
    } catch {
      setCnpjStatus("invalid")
      setCnpjInfo(null)
      return false
    }
  }

  // Cadastro
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  setSuccess(null)

  const emailNorm = email.trim().toLowerCase()

  // Validação do telefone
  const phoneDigits = phone.replace(/\D/g, "")
  if (phoneDigits.length !== 11) {
    setError("Informe um telefone válido no formato (XX) XXXXX-XXXX")
    setLoading(false)
    return
  }
  
  // Validação forte de senha
  if (!isPasswordStrong(password)) {
    setError(
      "A senha deve ter no mínimo 6 caracteres, 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial.",
    )
    setLoading(false)
    return
  }

  if (userType === "proprietario") {
    // Valida CNPJ antes de cadastrar (BrasilAPI)
    const cnpjValido = await validarCNPJ(cnpj)
    if (!cnpjValido) {
      setError("CNPJ inválido ou inativo")
      setLoading(false)
      return
    }
    
    // Valida atividade econômica principal (CNAE)
    const cnaePrincipal = String(cnpjInfo?.cnae_fiscal)
    const cnaeDescricao = String(cnpjInfo?.cnae_fiscal_descricao).toLowerCase()
    const cnaeAceito = cnaePrincipal === "9602501"
    const descricaoAceita = cnaeDescricao.trim() === "cabeleireiros, manicure e pedicure"
    if (!cnaeAceito && !descricaoAceita) {
      setError("O CNPJ informado não é de cabeleireiro, manicure ou pedicure (CNAE 9602501)")
      setLoading(false)
      return
    }

    // Validações de campos obrigatórios para proprietário
    const camposObrigatorios = [
      { valor: businessName.trim(), nome: "nome do salão" },
      { valor: address.trim(), nome: "endereço do salão" },
      { valor: city.trim(), nome: "cidade" },
      { valor: state.trim(), nome: "estado" },
      { valor: cep.trim(), nome: "CEP" },
      { valor: cnpj.trim(), nome: "CNPJ" }
    ]

    for (const campo of camposObrigatorios) {
      if (!campo.valor) {
        setError(`Informe o ${campo.nome}`)
        setLoading(false)
        return
      }
    }
  }

  try {
    // Validação: impedir cadastro com e-mail já existente
    const { data: existingEmailProfile, error: emailCheckError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", emailNorm)
      .maybeSingle()
      
    if (emailCheckError) {
      setError("Erro ao verificar e-mail existente: " + emailCheckError.message)
      setLoading(false)
      return
    }
    
    if (existingEmailProfile) {
      setError("Já existe um cadastro com este e-mail. Faça login ou recupere sua senha.")
      setLoading(false)
      return
    }

    // Validação: impedir cadastro com CNPJ já existente para proprietários
    if (userType === "proprietario") {
      const { data: existingCnpjProfile, error: cnpjProfileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("cnpj", cnpj)
        .maybeSingle()
        
      if (cnpjProfileError) {
        setError("Erro ao verificar CNPJ existente: " + cnpjProfileError.message)
        setLoading(false)
        return
      }
      
      if (existingCnpjProfile) {
        setError("Já existe um cadastro de proprietário com este CNPJ.")
        setLoading(false)
        return
      }
    }

    // 1. Cadastrar usuário no Auth
    console.log("🔄 Iniciando cadastro no Supabase Auth...")
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: emailNorm,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/",
      },
    })

    if (authError) {
      console.error("❌ Erro no Auth:", authError)
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!signUpData?.user?.id) {
      setError("Erro inesperado durante o cadastro")
      setLoading(false)
      return
    }

    console.log("✅ Usuário criado no Auth:", signUpData.user.id)

    // 2. Completar cadastro usando RPC
    console.log("🔄 Completando cadastro com RPC...")
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('complete_user_signup' as any, {
        p_user_id: signUpData.user.id,
        p_user_name: name,
        p_user_type: userType,
        p_phone: phone,
        p_email: emailNorm,
        p_cnpj: userType === "proprietario" ? cnpj : null,
        p_business_name: userType === "proprietario" ? businessName : null,
        p_address: userType === "proprietario" ? address : null,
        p_city: userType === "proprietario" ? city : null,
        p_state: userType === "proprietario" ? state : null,
        p_cep: userType === "proprietario" ? cep : null
      })

    if (rpcError) {
      console.error("❌ Erro no RPC:", rpcError)
      setError(`Erro ao completar cadastro: ${rpcError.message}`)
      setLoading(false)
      return
    }

    // Definir tipo para o resultado RPC
    const result = rpcResult as { success: boolean; error?: string; barbershop_id?: string; message?: string }

    if (!result?.success) {
      console.error("❌ RPC retornou erro:", result)
      setError(`Erro: ${result?.error || 'Erro desconhecido no cadastro'}`)
      setLoading(false)
      return
    }

    console.log("✅ Cadastro completo realizado via RPC:", rpcResult)

    // Sucesso - limpar formulário
    setSuccess("Cadastro realizado! Faça login.")
    setMode("login")
    setEmail("")
    setPassword("")
    setName("")
    setCnpj("")
    setPhone("")
    setBusinessName("")
    setAddress("")
    setCity("")
    setState("")
    setCep("")
    setCnpjStatus("idle")
    setCnpjInfo(null)

  } catch (err: any) {
    console.error("❌ Erro inesperado no cadastro:", err)
    setError(err?.message || "Erro inesperado durante o cadastro.")
  } finally {
    setLoading(false)
  }
}

  // Recuperação de senha
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const emailNorm = email.trim().toLowerCase()
    const { error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
      redirectTo: "https://barbz.vercel.app/createpassword",
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada.")
      setMode("login")
      setEmail("")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="flex flex-col items-center pb-6 pt-8">
          <Logo className="h-16 mb-6" />
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {mode === "login" && "Bem-vindo de volta"}
            {mode === "signup" && "Criar sua conta"}
            {mode === "reset" && "Recuperar senha"}
            {mode === "resend" && "Reenviar confirmação"}
          </CardTitle>
          <p className="text-slate-600 text-center mt-2">
            {mode === "login" && "Entre na sua conta para continuar"}
            {mode === "signup" && "Junte-se à revolução das barbearias"}
            {mode === "reset" && "Vamos ajudar você a recuperar o acesso"}
            {mode === "resend" && "Confirme seu email para ativar a conta"}
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {mode === "signup" && (
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
              <Button
                variant={userType === "cliente" ? "default" : "ghost"}
                type="button"
                onClick={() => setUserType("cliente")}
                className={`flex-1 rounded-lg transition-all duration-200 ${
                  userType === "cliente"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                Cliente
              </Button>
              <Button
                variant={userType === "proprietario" ? "default" : "ghost"}
                type="button"
                onClick={() => setUserType("proprietario")}
                className={`flex-1 rounded-lg transition-all duration-200 ${
                  userType === "proprietario"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                Proprietário
              </Button>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg pr-20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Entrando...
                  </div>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                  onClick={() => {
                    setMode("resend")
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Reenviar email de confirmação
                </button>
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                    onClick={() => {
                      setMode("signup")
                      setError(null)
                      setSuccess(null)
                    }}
                  >
                    Criar conta
                  </button>
                  <button
                    type="button"
                    className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                    onClick={() => {
                      setMode("reset")
                      setError(null)
                      setSuccess(null)
                    }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nome completo</label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Telefone</label>
                <Input
                  type="text"
                  placeholder="(XX) XXXXX-XXXX"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha forte"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg pr-20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mínimo 6 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo
                </p>
              </div>

              {userType === "proprietario" && (
                <div className="space-y-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 text-sm">Dados do estabelecimento</h3>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nome do salão</label>
                    <Input
                      type="text"
                      placeholder="Nome da sua barbearia"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Endereço</label>
                    <Input
                      type="text"
                      placeholder="Rua, número, bairro"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Cidade</label>
                      <Input
                        type="text"
                        placeholder="Cidade"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Estado</label>
                      <Input
                        type="text"
                        placeholder="UF"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">CEP</label>
                    <Input
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(formatCEP(e.target.value))}
                      required
                      className="h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">CNPJ</label>
                    <Input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                      maxLength={18}
                      required
                      className="h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-lg"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg font-medium bg-transparent"
                    onClick={async () => await validarCNPJ(cnpj)}
                    disabled={cnpjStatus === "validating" || !cnpj}
                  >
                    {cnpjStatus === "validating" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"></div>
                        Validando...
                      </div>
                    ) : (
                      "Validar CNPJ"
                    )}
                  </Button>

                  {cnpjStatus === "valid" && cnpjInfo && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-800 font-medium text-sm">CNPJ válido</p>
                          <p className="text-green-700 text-sm">{cnpjInfo.razao_social}</p>
                          <p className="text-green-600 text-xs mt-1">
                            <strong>CNAE:</strong> {cnpjInfo.cnae_fiscal} - {cnpjInfo.cnae_fiscal_descricao}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {cnpjStatus === "invalid" && cnpjInfo && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-red-800 font-medium text-sm">CNPJ inválido</p>
                          <p className="text-red-700 text-sm">{getErrorMessage(cnpjInfo)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full h-12 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                  userType === "proprietario"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                } text-white`}
                disabled={loading || (userType === "proprietario" && cnpjStatus !== "valid")}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Cadastrando...
                  </div>
                ) : (
                  "Criar conta"
                )}
              </Button>

              <div className="flex justify-center mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Já tenho conta
                </button>
              </div>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>

              <div className="flex justify-center mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          )}

          {mode === "resend" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setLoading(true)
                setError(null)
                setSuccess(null)
                const emailNorm = email.trim().toLowerCase()
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: "signup",
                    email: emailNorm,
                    options: {
                      emailRedirectTo: window.location.origin + "/",
                    },
                  })
                  if (resendError) {
                    // opcional: log
                  }
                  setSuccess("Se este e-mail existir e ainda não estiver confirmado, reenviamos o link de confirmação.")
                } catch (err) {
                  setSuccess("Se este e-mail existir e ainda não estiver confirmado, reenviamos o link de confirmação.")
                } finally {
                  setLoading(false)
                }
              }}
              className="space-y-5"
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  "Reenviar confirmação"
                )}
              </Button>

              <div className="flex justify-center mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  className="text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                    setSuccess(null)
                  }}
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="w-full max-w-md mx-auto flex justify-center z-20 relative mt-6">
        <Button
          asChild
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
        >
          <Link to="/">Voltar para início</Link>
        </Button>
      </div>
    </div>
  )
}