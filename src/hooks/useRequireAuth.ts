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
      navigate(redirectTo);
      return;
    }

    // Se tem tipo específico requerido e o usuário não é desse tipo
    if (requiredUserType && user.user_type !== requiredUserType) {
      
      // Redireciona para a tela correta baseado no tipo do usuário
      const correctRoute = user.user_type === 'proprietario' ? '/agendamentos' : '/cliente';
      navigate(correctRoute);
      return;
    }
  }, [user, navigate, redirectTo, requiredUserType]);

  return user;
}