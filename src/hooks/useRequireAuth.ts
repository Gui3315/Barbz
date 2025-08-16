import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UseRequireAuthOptions {
  redirectTo?: string;
  requiredUserType?: 'proprietario' | 'cliente';
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { redirectTo = '/login', requiredUserType } = options;

  useEffect(() => {
    // Se não tem usuário, redireciona para login
    if (!user) {
      console.log('🚫 useRequireAuth: Usuário não encontrado, redirecionando para:', redirectTo);
      navigate(redirectTo);
      return;
    }

    // Se tem tipo específico requerido e o usuário não é desse tipo
    if (requiredUserType && user.user_type !== requiredUserType) {
      console.log('🚫 useRequireAuth: Tipo de usuário inválido:', {
        required: requiredUserType,
        actual: user.user_type
      });
      
      // Redireciona para a tela correta baseado no tipo do usuário
      const correctRoute = user.user_type === 'proprietario' ? '/agendamentos' : '/cliente';
      navigate(correctRoute);
      return;
    }

    console.log('✅ useRequireAuth: Usuário autenticado:', {
      id: user.id,
      type: user.user_type,
      email: user.email
    });
  }, [user, navigate, redirectTo, requiredUserType]);

  return user;
}