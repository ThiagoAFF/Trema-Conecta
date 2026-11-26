import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../context/ToastContext';
import { usuariosService } from '../../services/usuariosService';
import { PERFIS, STATUS_USUARIO } from '../../constants/domain';
import { isBlank, isEmail, isTelefone, maskTelefone } from '../../utils/validators';

function validate(v) {
  const e = {};
  if (isBlank(v.nome)) e.nome = 'Informe o nome completo.';
  if (isBlank(v.email)) e.email = 'Informe o e-mail.';
  else if (!isEmail(v.email)) e.email = 'E-mail inválido.';
  if (isBlank(v.telefone)) e.telefone = 'Informe o telefone.';
  else if (!isTelefone(v.telefone)) e.telefone = 'Informe DDD + número (10 ou 11 dígitos).';
  if (isBlank(v.perfil)) e.perfil = 'Selecione o perfil de acesso.';
  if (isBlank(v.status)) e.status = 'Selecione o status.';
  if (!v.id && (!v.senha || v.senha.length < 8)) e.senha = 'Crie uma senha de pelo menos 8 caracteres.';
  return e;
}

export default function UsuarioFormModal({ usuario, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(usuario);
  const form = useForm(
    {
      id: usuario?.id ?? '',
      senha: '',
      nome: usuario?.nome ?? '',
      email: usuario?.email ?? '',
      telefone: usuario?.telefone ?? '',
      perfil: usuario?.perfil ?? 'funcionario',
      status: usuario?.status ?? 'ativo',
    },
    validate,
  );
  const { values: v, errors: e, setValue } = form;

  const save = async (data) => {
    const saved = isEdit ? await usuariosService.update(usuario.id, data) : await usuariosService.create(data);
    toast.success(isEdit ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.');
    onSaved(saved);
  };

  return (
    <FormModal
      title={isEdit ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
      onSubmit={form.submit(save)}
      saving={form.saving}
      serverError={form.serverError}
      submitLabel="Salvar usuário"
    >
      <Field label="Nome completo" name="nome" value={v.nome} onChange={setValue} error={e.nome} required wide autoComplete="name" />
      <Field label="E-mail" name="email" type="email" value={v.email} onChange={setValue} error={e.email} required />
      <Field label="Telefone" name="telefone" value={v.telefone} onChange={setValue} error={e.telefone} mask={maskTelefone} inputMode="tel" required />
      <Field label="Perfil de acesso" name="perfil" as="select" options={PERFIS} value={v.perfil} onChange={setValue} error={e.perfil} required />
      {!isEdit && <Field label="Senha inicial" name="senha" type="password" value={v.senha} onChange={setValue} error={e.senha} required />}
      <Field label="Status" name="status" as="select" options={STATUS_USUARIO} value={v.status} onChange={setValue} error={e.status} required />
    </FormModal>
  );
}
