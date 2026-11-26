import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BellRing, Info, Layers, Loader2, LogIn, QrCode, AlertCircle } from 'lucide-react';
import BrandMark from '../components/ui/BrandMark';
import Field from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { usePageTitle } from '../hooks/usePageTitle';
import { env } from '../config/env';
import { isBlank } from '../utils/validators';

const DESTAQUES = [
  { icon: Layers, title: 'Etapas rastreadas', text: 'Corte, costura, acabamento e expedição.' },
  { icon: QrCode, title: 'Lotes com QR Code', text: 'Identificação única para cada lote produzido.' },
  { icon: BarChart3, title: 'Indicadores de produção', text: 'Peças aprovadas, defeitos e prazos.' },
  { icon: BellRing, title: 'Alertas de prazo', text: 'Notificações de atrasos e conclusões.' },
];

const validate = (v) => ({
  codigoEmpresa: isBlank(v.codigoEmpresa) ? 'Informe seu e-mail.' : undefined,
  senha: isBlank(v.senha) ? 'Informe a senha.' : undefined,
});

export default function Login() {
  usePageTitle('Entrar');
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const form = useForm({ codigoEmpresa: '', senha: '' }, validate);
  const { values: v, errors: e, setValue } = form;

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const entrar = async (data) => {
    await login({ codigoEmpresa: data.codigoEmpresa, senha: data.senha });
    navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
  };

  return (
    <div className="auth-page">
      <section
        className="auth-hero"
        role="img"
        aria-label="Linha de produção de costura em uma confecção têxtil"
        style={{ backgroundImage: `linear-gradient(160deg, rgba(16,20,33,.88), rgba(89,88,23,.78)), url("${env.HERO_IMAGE_URL}")` }}
      >
        <div className="auth-hero__inner">
          <div className="auth-brand">
            <BrandMark size={44} />
            <div>
              <strong>Trama Conecta</strong>
              <span>Gestão da produção têxtil</span>
            </div>
          </div>
          <h1>Da facção à expedição, tudo sob controle.</h1>
          <p>Acompanhe clientes, pedidos, lotes e cada etapa produtiva do Agreste pernambucano em uma única plataforma, com rastreabilidade e transparência.</p>
          <ul className="feature-list">
            {DESTAQUES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="feature-list__icon"><Icon size={20} aria-hidden="true" /></span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-brand auth-brand--dark">
            <BrandMark size={36} />
            <strong>Trama Conecta</strong>
          </div>
          <span className="eyebrow">Acesso da empresa</span>
          <h2>Entrar no sistema</h2>
          <p className="muted">{env.DEMO_MODE ? 'Informe o código da empresa e a senha de demonstração.' : 'Informe o e-mail do usuário cadastrado e sua senha para acessar o painel de produção.'}</p>

          <form onSubmit={form.submit(entrar)} noValidate className="form">
            {form.serverError && (
              <div className="alert alert--error" role="alert">
                <AlertCircle size={18} />
                <span>{form.serverError}</span>
              </div>
            )}
            <Field label={env.DEMO_MODE ? 'Código da empresa' : 'E-mail do usuário'} name="codigoEmpresa" value={v.codigoEmpresa} onChange={setValue} error={e.codigoEmpresa} autoComplete="username" autoCapitalize="none" />
            <Field label="Senha" name="senha" type="password" value={v.senha} onChange={setValue} error={e.senha} autoComplete="current-password" />
            <button type="submit" className="btn btn--primary btn--block" disabled={form.saving}>
              {form.saving ? <><Loader2 size={16} className="spin" /> Entrando…</> : <><LogIn size={16} /> Entrar</>}
            </button>
            <button type="button" className="link-btn" onClick={() => setShowHelp((s) => !s)} aria-expanded={showHelp}>
              Esqueci minha senha
            </button>
            {showHelp && (
              <div className="alert alert--info" role="note">
                <Info size={18} />
                <span>
                  Solicite ao administrador da sua empresa a redefinição de sua senha. Não compartilhe suas credenciais.
                </span>
              </div>
            )}
          </form>

          <p className="auth-switch">
            Ainda não tem uma conta? <Link to="/cadastro">Cadastre sua empresa</Link>
          </p>

          {env.DEMO_MODE && (
            <div className="demo-hint">
              <strong>Acesso de demonstração</strong>
              <span>Código <code>TRAMA2026</code> · Senha <code>demo1234</code></span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
