import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import { useForm } from '../../hooks/useForm';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { clientesService } from '../../services/clientesService';
import { pedidosService } from '../../services/pedidosService';
import { SITUACOES_PEDIDO } from '../../constants/domain';
import { toInputDate, todayInput } from '../../utils/format';
import { isBlank, isPositiveInt } from '../../utils/validators';

function validate(v) {
  const e = {};
  if (isBlank(v.clienteId)) e.clienteId = 'Selecione o cliente.';
  if (isBlank(v.descricao)) e.descricao = 'Descreva o pedido.';
  if (!isPositiveInt(v.quantidadePecas)) e.quantidadePecas = 'Informe uma quantidade inteira maior que zero.';
  if (isBlank(v.situacao)) e.situacao = 'Selecione a situação.';
  if (isBlank(v.dataRecebimento)) e.dataRecebimento = 'Informe a data de recebimento.';
  if (isBlank(v.prazoEntrega)) e.prazoEntrega = 'Informe o prazo de entrega.';
  else if (!isBlank(v.dataRecebimento) && v.prazoEntrega < v.dataRecebimento) e.prazoEntrega = 'O prazo não pode ser anterior ao recebimento.';
  return e;
}

export default function PedidoFormModal({ pedido, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(pedido);
  const clientes = useAsync(() => clientesService.list(), []);
  const form = useForm(
    {
      clienteId: pedido ? String(pedido.clienteId ?? '') : '',
      descricao: pedido?.descricao ?? '',
      quantidadePecas: pedido?.quantidadePecas ?? '',
      situacao: pedido?.situacao ?? 'aguardando',
      dataRecebimento: toInputDate(pedido?.dataRecebimento) || todayInput(),
      prazoEntrega: toInputDate(pedido?.prazoEntrega),
    },
    validate,
  );
  const { values: v, errors: e, setValue } = form;
  const options = (clientes.data ?? []).map((c) => ({ value: String(c.id), label: c.nome }));

  const save = async (data) => {
    const payload = { ...data, quantidadePecas: Number(data.quantidadePecas) };
    const saved = isEdit ? await pedidosService.update(pedido.id, payload) : await pedidosService.create(payload);
    toast.success(isEdit ? 'Pedido atualizado com sucesso.' : 'Pedido cadastrado com sucesso.');
    onSaved(saved);
  };

  return (
    <FormModal
      title={isEdit ? `Editar pedido ${pedido.codigo ?? ''}` : 'Novo pedido'}
      note={isEdit ? undefined : 'O código do pedido é gerado automaticamente ao salvar.'}
      onClose={onClose}
      onSubmit={form.submit(save)}
      saving={form.saving}
      serverError={form.serverError}
      submitLabel="Salvar pedido"
    >
      <Field
        label="Cliente"
        name="clienteId"
        as="select"
        options={options}
        placeholder={clientes.loading ? 'Carregando clientes…' : 'Selecione o cliente'}
        value={v.clienteId}
        onChange={setValue}
        error={e.clienteId}
        hint={clientes.error ? 'Não foi possível carregar os clientes.' : !clientes.loading && !options.length ? 'Cadastre um cliente antes de criar o pedido.' : undefined}
        required
        wide
      />
      <Field label="Descrição do pedido" name="descricao" as="textarea" value={v.descricao} onChange={setValue} error={e.descricao} required wide />
      <Field label="Quantidade de peças" name="quantidadePecas" type="number" min="1" step="1" inputMode="numeric" value={v.quantidadePecas} onChange={setValue} error={e.quantidadePecas} required />
      <Field label="Situação" name="situacao" as="select" options={SITUACOES_PEDIDO} value={v.situacao} onChange={setValue} error={e.situacao} required />
      <Field label="Data de recebimento" name="dataRecebimento" type="date" value={v.dataRecebimento} onChange={setValue} error={e.dataRecebimento} required />
      <Field label="Prazo de entrega" name="prazoEntrega" type="date" value={v.prazoEntrega} onChange={setValue} error={e.prazoEntrega} required />
    </FormModal>
  );
}
