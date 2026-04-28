import { useNavigate } from 'react-router-dom';

import LoginForm from '../../components/Auth/LoginForm';

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = (data) => {
    onLogin(data);
    navigate('/');
  };

  return <LoginForm onLogin={handleLogin} />;
}
