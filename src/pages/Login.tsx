
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

// Máscara de telefone (XX) XXXXX-XXXX
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  let formatted = '';
  if (digits.length > 0) formatted += '(' + digits.substring(0, 2);
  if (digits.length > 2) formatted += ') ' + digits.substring(2, 7);
  if (digits.length > 7) formatted += '-' + digits.substring(7, 11);
  return formatted;
}
// Função auxiliar para determinar a mensagem de erro do CNPJ
function getErrorMessage(cnpjInfo: any) {
  if (cnpjInfo.descricao_situacao_cadastral !== 'ATIVA') {
    return `CNPJ inativo (Situação: ${cnpjInfo.descricao_situacao_cadastral})`;
  }
  const cnaesValidos = [
    '9602501',
    '9602-5/01',
    96025,
    9602501
  ];
  const cnaeString = String(cnpjInfo.cnae_fiscal);
  const cnaeDescricao = String(cnpjInfo.cnae_fiscal_descricao || '').toLowerCase();
  const cnaeValido = cnaesValidos.some(cnae => 
    cnaeString === String(cnae) || 
    cnaeString.replace(/[^0-9]/g, '') === String(cnae).replace(/[^0-9]/g, '')
  );
  const palavrasChave = ['cabeleireiro', 'manicure', 'pedicure', 'salão', 'beleza', 'estética'];
  const descricaoValida = palavrasChave.some(palavra => cnaeDescricao.includes(palavra));
  if (!cnaeValido && !descricaoValida) {
    return `CNPJ não é da área de beleza. CNAE: ${cnpjInfo.cnae_fiscal} - ${cnpjInfo.cnae_fiscal_descricao}`;
  }
  return 'CNPJ inválido';
}

export default function Login() {
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cep, setCep] = useState('');
  // Máscara de CEP XXXXX-XXX
  function formatCEP(value: string) {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted += digits.substring(0, 5);
    if (digits.length > 5) formatted += '-' + digits.substring(5, 8);
    return formatted;
  }
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [userType, setUserType] = useState<'cliente' | 'proprietario'>('cliente');
  const [cnpj, setCnpj] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Função para aplicar máscara de CNPJ
  function formatCNPJ(value: string) {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted += digits.substring(0, 2);
    if (digits.length > 2) formatted += '.' + digits.substring(2, 5);
    if (digits.length > 5) formatted += '.' + digits.substring(5, 8);
    if (digits.length > 8) formatted += '/' + digits.substring(8, 12);
    if (digits.length > 12) formatted += '-' + digits.substring(12, 14);
    return formatted;
  }
  // Removido campo de código de validação do admin
  const [cnpjStatus, setCnpjStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [cnpjInfo, setCnpjInfo] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Buscar dados do usuário logado
    const user = data?.user;
    if (!user) {
      setError('Usuário não encontrado.');
      setLoading(false);
      return;
    }
    // Buscar perfil do usuário para pegar o campo type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    if (profileError || !profileData) {
      setError('Não foi possível obter o tipo de usuário.');
      setLoading(false);
      return;
    }
    if (profileData.user_type === 'proprietario') {
      window.location.href = '/areadoproprietario';
    } else {
      window.location.href = '/cliente';
    }
    setLoading(false);
  };

  // Validação de CNPJ via BrasilAPI
  const validarCNPJ = async (cnpj: string) => {
    setCnpjStatus('validating');
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      const data = await response.json();
      // Verifica se está ativo e se o CNAE principal é 9602-5/01
      const cnaePrincipal = String(data.cnae_fiscal);
      const cnaeDescricao = String(data.cnae_fiscal_descricao).toLowerCase();
      // Aceita apenas se cnae_fiscal for 9602501 ou cnae_fiscal_descricao for exatamente 'Cabeleireiros, manicure e pedicure'
      const cnaeAceito = cnaePrincipal === '9602501';
      const descricaoAceita = cnaeDescricao.trim() === 'cabeleireiros, manicure e pedicure';
      if (data.cnpj && data.descricao_situacao_cadastral === 'ATIVA' && (cnaeAceito || descricaoAceita)) {
        setCnpjStatus('valid');
        setCnpjInfo(data);
        return true;
      }
      setCnpjStatus('invalid');
      setCnpjInfo(data); // Mantém info para mostrar motivo
      return false;
    } catch {
      setCnpjStatus('invalid');
      setCnpjInfo(null);
      return false;
    }
  };

  // Validação forte de senha
  function isPasswordStrong(pw: string) {
    return (
      pw.length >= 6 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
    );
  }

  // Cadastro
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validação do telefone
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      setError('Informe um telefone válido no formato (XX) XXXXX-XXXX');
      setLoading(false);
      return;
    }
    // Validação forte de senha
    if (!isPasswordStrong(password)) {
      setError('A senha deve ter no mínimo 6 caracteres, 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial.');
      setLoading(false);
      return;
    }
    if (userType === 'proprietario') {
      // Valida CNPJ antes de cadastrar
      const cnpjValido = await validarCNPJ(cnpj);
      if (!cnpjValido) {
        setError('CNPJ inválido ou inativo');
        setLoading(false);
        return;
      }
      // Valida atividade econômica principal (CNAE)
      const cnaePrincipal = String(cnpjInfo?.cnae_fiscal);
      const cnaeDescricao = String(cnpjInfo?.cnae_fiscal_descricao).toLowerCase();
      const cnaeAceito = cnaePrincipal === '9602501';
      const descricaoAceita = cnaeDescricao.trim() === 'cabeleireiros, manicure e pedicure';
      if (!cnaeAceito && !descricaoAceita) {
        setError('O CNPJ informado não é de cabeleireiro, manicure ou pedicure (CNAE 9602501)');
        setLoading(false);
        return;
      }
      if (!businessName.trim()) {
        setError('Informe o nome do salão');
        setLoading(false);
        return;
      }
      if (!address.trim()) {
        setError('Informe o endereço do salão');
        setLoading(false);
        return;
      }
      if (!city.trim()) {
        setError('Informe a cidade');
        setLoading(false);
        return;
      }
      if (!state.trim()) {
        setError('Informe o estado');
        setLoading(false);
        return;
      }
      if (!cep.trim()) {
        setError('Informe o CEP');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: name,
          user_type: userType,
          phone: phone,
          cnpj: userType === 'proprietario' ? cnpj : '',
          business_name: userType === 'proprietario' ? businessName : '',
          address: userType === 'proprietario' ? address : '',
          city: userType === 'proprietario' ? city : '',
          state: userType === 'proprietario' ? state : '',
          cep: userType === 'proprietario' ? cep : '',
          status: 'ativo',
        },
        emailRedirectTo: window.location.origin + '/'
      }
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Cadastro realizado! Verifique seu email para confirmar.');
      setMode('login');
      setEmail('');
      setPassword('');
      setName('');
      setCnpj('');
      setPhone('');
      setBusinessName('');
      setAddress('');
      setCity('');
      setState('');
      setCep('');
      setCnpjStatus('idle');
      setCnpjInfo(null);
    }
    setLoading(false);
  };

  // Recuperação de senha
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/'
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setMode('login');
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <Logo className="h-12 mb-4" />
          <CardTitle className="text-2xl font-bold text-center">
            {mode === 'login' && 'Entrar'}
            {mode === 'signup' && 'Cadastro'}
            {mode === 'reset' && 'Recuperar Senha'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Seleção de tipo de usuário no cadastro */}
          {mode === 'signup' && (
            <div className="flex justify-center gap-4 mb-4">
              <Button variant={userType === 'cliente' ? 'default' : 'outline'} type="button" onClick={() => setUserType('cliente')}>Cliente</Button>
              <Button variant={userType === 'proprietario' ? 'default' : 'outline'} type="button" onClick={() => setUserType('proprietario')}>Proprietário</Button>
            </div>
          )}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-xs px-2 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <div className="flex justify-between mt-2 text-sm">
                <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}>
                  Criar conta
                </button>
                <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode('reset'); setError(null); setSuccess(null); }}>
                  Esqueci minha senha
                </button>
              </div>
            </form>
          )}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="(XX) XXXXX-XXXX"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                maxLength={15}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-xs px-2 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-2">
              </div>
              {/* Campos extras para proprietário */}
              {userType === 'proprietario' && (
                <>
                  <Input
                    type="text"
                    placeholder="Nome do salão"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Endereço do salão"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Cidade"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Estado"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="CEP"
                    value={cep}
                    onChange={e => setCep(formatCEP(e.target.value))}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="CNPJ"
                    value={cnpj}
                    onChange={e => setCnpj(formatCNPJ(e.target.value))}
                    maxLength={18}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={async () => await validarCNPJ(cnpj)} 
                    disabled={cnpjStatus === 'validating' || !cnpj}
                  >
                    {cnpjStatus === 'validating' ? 'Validando...' : 'Validar CNPJ'}
                  </Button>
                  {cnpjStatus === 'valid' && cnpjInfo && (
                    <div className="text-green-600 text-sm mb-2 p-2 bg-green-50 rounded">
                      ✅ CNPJ válido: {cnpjInfo.razao_social}
                      <br />
                      <strong>CNAE:</strong> {cnpjInfo.cnae_fiscal} - {cnpjInfo.cnae_fiscal_descricao}
                    </div>
                  )}
                  {cnpjStatus === 'invalid' && cnpjInfo && (
                    <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
                      ❌ {getErrorMessage(cnpjInfo)}
                    </div>
                  )}
                </>
              )}
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full" disabled={loading || (userType === 'proprietario' && cnpjStatus !== 'valid')}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
              <div className="flex justify-center mt-2 text-sm">
                <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode('login'); setError(null); setSuccess(null); }}>
                  Já tenho conta
                </button>
              </div>
            </form>
          )}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
              <div className="flex justify-center mt-2 text-sm">
                <button type="button" className="text-blue-600 hover:underline" onClick={() => { setMode('login'); setError(null); setSuccess(null); }}>
                  Voltar ao login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
