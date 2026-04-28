import { useNavigate } from 'react-router-dom';

import RegisterForm from '../../components/Auth/RegisterForm';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/login');
  };

  return <RegisterForm onRegister={handleRegister} />;
}
