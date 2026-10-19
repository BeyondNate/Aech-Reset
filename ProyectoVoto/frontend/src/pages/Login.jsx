import { supabase } from '../services/supabaseClient';

function Login() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/votacion'
      }
    });
    if (error) console.error('Error de login:', error.message);
  };

  return (
    <div>
      <h1>🗳️ Elecciones UPCH</h1>
      <button onClick={handleLogin}>Continuar con correo institucional</button>
    </div>
  );
}

export default Login;