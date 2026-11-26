import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import { useForm } from '../../hooks/useForm';
import { useToast } from '../../context/ToastContext';
import { clientesService } from '../../services/clientesService';
import { UFS } from '../../constants/domain';
import { isBlank, isEmail, isTelefone, isValidDocumento, maskDocumento, maskTelefone } from '../../utils/validators';

function validate(v) {
  const e = {};
  if (isBlank(v.nome)) e.nome = 'Informe o nome ou a razão social.';
  if (isBlank(v.documento)) e.documento = 'Informe o CNPJ ou CPF.';
  else if (!isValidDocumento(v.documento)) e.documento = 'CNPJ ou CPF inválido.';
  if (isBlank(v.telefone)) e.telefone = 'Informe o telefone ou WhatsApp.';
  else if (!isTelefone(v.telefone)) e.telefone = 'Informe DDD + número (10 ou 11 dígitos).';
  if (isBlank(v.cidade)) e.cidade = 'Informe a cidade.';
  if (isBlank(v.estado)) e.estado = 'Selecione o estado.';
  if (isBlank(v.email)) e.email = 'Informe o e-mail.';
  else if (!isEmail(v.email)) e.email = 'E-mail inválido.';
  return e;
}

export default function ClienteFormModal({ cliente, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(cliente);
  const form = useForm(
    {
      nome: cliente?.nome ?? '',
      documento: cliente?.documento ?? '',
      telefone: cliente?.telefone ?? '',
      cidade: cliente?.cidade ?? '',
      estado: cliente?.estado ?? '',
      email: cliente?.email ?? '',
      observacoes: cliente?.observacoes ?? '',
    },
    validate,
  );
  const { values: v, errors: e, setValue } = form;

  const save = async (data) => {
    const saved = isEdit ? await clientesService.update(cliente.id, data) : await clientesService.create(data);
    toast.success(isEdit ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.');
    onSaved(saved);
  };

  return (
    <FormModal
      title={isEdit ? 'Editar cliente' : 'Novo cliente'}
      onClose={onClose}
      onSubmit={form.submit(save)}
      saving={form.saving}
      serverError={form.serverError}
      submitLabel="Salvar cliente"
    >
      <Field label="Nome / Razão social" name="nome" value={v.nome} onChange={setValue} error={e.nome} required wide autoComplete="organization" />
      <Field label="CNPJ / CPF" name="documento" value={v.documento} onChange={setValue} error={e.documento} mask={maskDocumento} inputMode="numeric" required />
      <Field label="Telefone / WhatsApp" name="telefone" value={v.telefone} onChange={setValue} error={e.telefone} mask={maskTelefone} inputMode="tel" required />
      <Field label="Cidade" name="cidade" value={v.cidade} onChange={setValue} error={e.cidade} required />
      <Field label="Estado" name="estado" as="select" options={UFS} value={v.estado} onChange={setValue} error={e.estado} required />
      <Field label="E-mail" name="email" type="email" value={v.email} onChange={setValue} error={e.email} required wide />
      <Field label="Observações" name="observacoes" as="textarea" value={v.observacoes} onChange={setValue} wide />
    </FormModal>
  );
}
