import { useState } from 'react';
import { AlertCircle, Copy, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import { ErrorState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useForm } from '../hooks/useForm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { empresaService } from '../services/empresaService';
import { PREFERENCIAS_NOTIFICACAO, UFS } from '../constants/domain';
import { copyText } from '../utils/clipboard';
import { getErrorMessage } from '../utils/errors';
import { isBlank, isEmail, isTelefone, isValidCnpj, maskCnpj, maskTelefone } from '../utils/validators';

function validateEmpresa(v) {
  const e = {};
  if (isBlank(v.razaoSocial)) e.razaoSocial = 'Informe a razão social.';
  if (isBlank(v.cnpj)) e.cnpj = 'Informe o CNPJ.';
  else if (!isValidCnpj(v.cnpj)) e.cnpj = 'CNPJ inválido.';
  if (isBlank(v.telefone)) e.telefone = 'Informe o telefone ou WhatsApp.';
  else if (!isTelefone(v.telefone)) e.telefone = 'Informe DDD + número (10 ou 11 dígitos).';
  if (isBlank(v.cidade)) e.cidade = 'Informe a cidade.';
  if (isBlank(v.estado)) e.estado = 'Selecione o estado.';
  if (isBlank(v.responsavel)) e.responsavel = 'Informe o responsável.';
  if (isBlank(v.email)) e.email = 'Informe o e-mail.';
  else if (!isEmail(v.email)) e.email = 'E-mail inválido.';
  return e;
}

function validateSenha(v) {
  const e = {};
  if (isBlank(v.senhaAtual)) e.senhaAtual = 'Informe a senha atual.';
  if (isBlank(v.novaSenha)) e.novaSenha = 'Informe a nova senha.';
  else if (v.novaSenha.length < 8) e.novaSenha = 'A nova senha deve ter pelo menos 8 caracteres.';
  else if (v.novaSenha === v.senhaAtual) e.novaSenha = 'A nova senha deve ser diferente da atual.';
  if (isBlank(v.confirmarNovaSenha)) e.confirmarNovaSenha = 'Confirme a nova senha.';
  else if (v.confirmarNovaSenha !== v.novaSenha) e.confirmarNovaSenha = 'As senhas não coincidem.';
  return e;
}

function EmpresaSection({ empresa }) {
  const toast = useToast();
  const { updateEmpresa } = useAuth();
  const form = useForm(
    {
      razaoSocial: empresa.razaoSocial ?? '',
      cnpj: empresa.cnpj ?? '',
      telefone: empresa.telefone ?? '',
      cidade: empresa.cidade ?? '',
      estado: empresa.estado ?? '',
      responsavel: empresa.responsavel ?? '',
      email: empresa.email ?? '',
    },
    validateEmpresa,
  );
  const { values: v, errors: e, setValue } = form;

  const salvar = async (data) => {
    const saved = await empresaService.atualizar(data);
    updateEmpresa({ ...data, ...saved });
    toast.success('Dados da empresa atualizados.');
  };
  const copiar = async () => ((await copyText(empresa.codigo)) ? toast.success('Código copiado.') : toast.error('Não foi possível copiar o código.'));

  return (
    <Card title="Dados da empresa" description="Informações cadastrais da sua confecção.">
      {empresa.codigo && (
        <div className="code-inline">
          <span>Código da empresa</span>
          <strong>{empresa.codigo}</strong>
          <button type="button" className="btn btn--ghost btn--sm" onClick={copiar}>
            <Copy size={14} /> Copiar
          </button>
        </div>
      )}
      <form onSubmit={form.submit(salvar)} noValidate className="form">
        {form.serverError && <div className="alert alert--error" role="alert"><AlertCircle size={18} /><span>{form.serverError}</span></div>}
        <div className="form-grid">
          <Field label="Razão social" name="razaoSocial" value={v.razaoSocial} onChange={setValue} error={e.razaoSocial} required wide />
          <Field label="CNPJ" name="cnpj" value={v.cnpj} onChange={setValue} error={e.cnpj} mask={maskCnpj} inputMode="numeric" required />
          <Field label="Telefone / WhatsApp" name="telefone" value={v.telefone} onChange={setValue} error={e.telefone} mask={maskTelefone} inputMode="tel" required />
          <Field label="Cidade" name="cidade" value={v.cidade} onChange={setValue} error={e.cidade} required />
          <Field label="Estado" name="estado" as="select" options={UFS} value={v.estado} onChange={setValue} error={e.estado} required />
          <Field label="Responsável" name="responsavel" value={v.responsavel} onChange={setValue} error={e.responsavel} required />
          <Field label="E-mail" name="email" type="email" value={v.email} onChange={setValue} error={e.email} required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={form.saving}>
            {form.saving ? <><Loader2 size={16} className="spin" /> Salvando…</> : 'Salvar dados'}
          </button>
        </div>
      </form>
    </Card>
  );
}

function SenhaSection() {
  const toast = useToast();
  const form = useForm({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' }, validateSenha);
  const { values: v, errors: e, setValue } = form;

  const atualizar = async (data) => {
    await authService.alterarSenha({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha });
    form.reset({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
    toast.success('Senha atualizada com sucesso.');
  };

  return (
    <Card title="Alterar senha" description="Use uma senha com pelo menos 8 caracteres.">
      <form onSubmit={form.submit(atualizar)} noValidate className="form">
        {form.serverError && <div className="alert alert--error" role="alert"><AlertCircle size={18} /><span>{form.serverError}</span></div>}
        <div className="form-grid">
          <Field label="Senha atual" name="senhaAtual" type="password" value={v.senhaAtual} onChange={setValue} error={e.senhaAtual} autoComplete="current-password" required wide />
          <Field label="Nova senha" name="novaSenha" type="password" value={v.novaSenha} onChange={setValue} error={e.novaSenha} autoComplete="new-password" required />
          <Field label="Confirmar nova senha" name="confirmarNovaSenha" type="password" value={v.confirmarNovaSenha} onChange={setValue} error={e.confirmarNovaSenha} autoComplete="new-password" required />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={form.saving}>
            {form.saving ? <><Loader2 size={16} className="spin" /> Atualizando…</> : 'Atualizar senha'}
          </button>
        </div>
      </form>
    </Card>
  );
}

function PreferenciasSection({ inicial }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState(inicial);
  const [saving, setSaving] = useState(false);

  const salvar = async () => {
    setSaving(true);
    try {
      await empresaService.salvarPreferencias(prefs);
      toast.success('Preferências de notificações salvas.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Preferências de notificações" description="Escolha quais avisos do sistema você quer receber.">
      <ul className="prefs">
        {PREFERENCIAS_NOTIFICACAO.map((p) => (
          <li key={p.key}>
            <label className="switch">
              <input type="checkbox" role="switch" checked={Boolean(prefs[p.key])} onChange={(e) => setPrefs((cur) => ({ ...cur, [p.key]: e.target.checked }))} />
              <span className="switch__track" aria-hidden="true" />
              <span className="switch__text">
                <strong>{p.label}</strong>
                <small>{p.description}</small>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="form-actions">
        <button type="button" className="btn btn--primary" onClick={salvar} disabled={saving}>
          {saving ? <><Loader2 size={16} className="spin" /> Salvando…</> : 'Salvar preferências'}
        </button>
      </div>
    </Card>
  );
}

export default function Configuracoes() {
  usePageTitle('Configurações');
  const empresa = useAsync(() => empresaService.getAtual(), []);
  const prefs = useAsync(() => empresaService.getPreferencias(), []);

  return (
    <>
      <PageHeader eyebrow="Administração" title="Configurações" description="Dados da empresa, segurança do acesso e preferências de aviso." />
      <div className="stack">
        {empresa.loading && !empresa.data ? <Card><LoadingState /></Card> : empresa.error && !empresa.data ? <Card title="Dados da empresa"><ErrorState error={empresa.error} onRetry={empresa.reload} /></Card> : <EmpresaSection empresa={empresa.data} />}
        <SenhaSection />
        {prefs.loading && !prefs.data ? <Card title="Preferências de notificações"><LoadingState /></Card> : prefs.error && !prefs.data ? <Card title="Preferências de notificações"><ErrorState error={prefs.error} onRetry={prefs.reload} /></Card> : <PreferenciasSection inicial={prefs.data} />}
      </div>
    </>
  );
}
