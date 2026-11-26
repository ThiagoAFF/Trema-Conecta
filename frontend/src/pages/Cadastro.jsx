import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Copy, Loader2 } from 'lucide-react';
import BrandMark from '../components/ui/BrandMark';
import Field from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useForm } from '../hooks/useForm';
import { usePageTitle } from '../hooks/usePageTitle';
import { empresaService } from '../services/empresaService';
import { UFS } from '../constants/domain';
import { copyText } from '../utils/clipboard';
import { getErrorMessage } from '../utils/errors';
import { isBlank, isEmail, isTelefone, isValidCnpj, maskCnpj, maskTelefone } from '../utils/validators';

function validate(v) {
  const e = {};
  if (isBlank(v.razaoSocial)) e.razaoSocial = 'Informe a razão social.';
  if (isBlank(v.cnpj)) e.cnpj = 'Informe o CNPJ.';
  else if (!isValidCnpj(v.cnpj)) e.cnpj = 'CNPJ inválido.';
  if (isBlank(v.telefone)) e.telefone = 'Informe o telefone ou WhatsApp.';
  else if (!isTelefone(v.telefone)) e.telefone = 'Informe DDD + número (10 ou 11 dígitos).';
  if (isBlank(v.cidade)) e.cidade = 'Informe a cidade.';
  if (isBlank(v.estado)) e.estado = 'Selecione o estado.';
  if (isBlank(v.responsavel)) e.responsavel = 'Informe o nome do responsável.';
  if (isBlank(v.email)) e.email = 'Informe o e-mail.';
  else if (!isEmail(v.email)) e.email = 'E-mail inválido.';
  if (isBlank(v.senha)) e.senha = 'Crie uma senha.';
  else if (v.senha.length < 8) e.senha = 'A senha deve ter pelo menos 8 caracteres.';
  if (isBlank(v.confirmarSenha)) e.confirmarSenha = 'Confirme a senha.';
  else if (v.confirmarSenha !== v.senha) e.confirmarSenha = 'As senhas não coincidem.';
  return e;
}

const INITIAL = { razaoSocial: '', cnpj: '', telefone: '', cidade: '', estado: '', responsavel: '', email: '', senha: '', confirmarSenha: '' };

export default function Cadastro() {
  usePageTitle('Cadastro da empresa');
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm(INITIAL, validate);
  const { values: v, errors: e, setValue } = form;
  const [result, setResult] = useState(null); // { codigo, senha }
  const [entering, setEntering] = useState(false);
  const [enterError, setEnterError] = useState(null);

  const cadastrar = async (data) => {
    const { confirmarSenha, ...payload } = data;
    const res = await empresaService.cadastrar(payload);
    if (!res?.codigo) throw new Error('O servidor não retornou o código da empresa.');
    setResult({ codigo: res.codigo, email: data.email, senha: data.senha });
    toast.success('Empresa cadastrada com sucesso!');
    window.scrollTo({ top: 0 });
  };

  const copiar = async () => {
    (await copyText(result.codigo)) ? toast.success('Código copiado.') : toast.error('Não foi possível copiar. Selecione e copie manualmente.');
  };

  const entrarNoPainel = async () => {
    setEntering(true);
    setEnterError(null);
    try {
      await login({ codigoEmpresa: result.email, senha: result.senha });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setEnterError(getErrorMessage(error));
      setEntering(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Voltar para o acesso
        </Link>
        <div className="auth-brand auth-brand--dark">
          <BrandMark size={36} />
          <strong>Trama Conecta</strong>
        </div>

        {!result ? (
          <>
            <span className="eyebrow">Cadastro da empresa</span>
            <h1>Registre sua confecção</h1>
            <p className="muted">Preencha os dados da confecção ou facção. Ao concluir, seu e-mail será utilizado para acessar o sistema.</p>
            <form onSubmit={form.submit(cadastrar)} noValidate className="form">
              {form.serverError && (
                <div className="alert alert--error" role="alert">
                  <AlertCircle size={18} />
                  <span>{form.serverError}</span>
                </div>
              )}
              <div className="form-grid">
                <Field label="Razão social" name="razaoSocial" value={v.razaoSocial} onChange={setValue} error={e.razaoSocial} required wide autoComplete="organization" />
                <Field label="CNPJ" name="cnpj" value={v.cnpj} onChange={setValue} error={e.cnpj} mask={maskCnpj} inputMode="numeric" required />
                <Field label="Telefone / WhatsApp" name="telefone" value={v.telefone} onChange={setValue} error={e.telefone} mask={maskTelefone} inputMode="tel" autoComplete="tel" required />
                <Field label="Cidade" name="cidade" value={v.cidade} onChange={setValue} error={e.cidade} required />
                <Field label="Estado" name="estado" as="select" options={UFS} value={v.estado} onChange={setValue} error={e.estado} required />
                <Field label="Nome do responsável" name="responsavel" value={v.responsavel} onChange={setValue} error={e.responsavel} required autoComplete="name" />
                <Field label="E-mail" name="email" type="email" value={v.email} onChange={setValue} error={e.email} required autoComplete="email" />
                <Field label="Senha" name="senha" type="password" value={v.senha} onChange={setValue} error={e.senha} hint="Mínimo de 8 caracteres." required autoComplete="new-password" />
                <Field label="Confirmar senha" name="confirmarSenha" type="password" value={v.confirmarSenha} onChange={setValue} error={e.confirmarSenha} required autoComplete="new-password" />
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={form.saving}>
                {form.saving ? <><Loader2 size={16} className="spin" /> Cadastrando…</> : 'Concluir cadastro'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-box">
            <CheckCircle2 size={44} className="success-box__icon" aria-hidden="true" />
            <h1>Empresa cadastrada com sucesso!</h1>
            <p className="muted">Guarde o código exclusivo abaixo. Ele é um identificador da empresa. Para entrar no sistema, utilize seu e-mail e senha.</p>
            <div className="code-box">
              <span>Identificador da empresa</span>
              <strong data-testid="codigo-empresa">{result.codigo}</strong>
              <button type="button" className="btn btn--ghost btn--sm" onClick={copiar}>
                <Copy size={14} /> Copiar código
              </button>
            </div>
            {enterError && (
              <div className="alert alert--error" role="alert">
                <AlertCircle size={18} />
                <span>{enterError}</span>
              </div>
            )}
            <div className="form-actions form-actions--center">
              <Link to="/" className="btn btn--ghost">
                Ir para o acesso
              </Link>
              <button type="button" className="btn btn--primary" onClick={entrarNoPainel} disabled={entering}>
                {entering ? <Loader2 size={16} className="spin" /> : null} Entrar no painel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
