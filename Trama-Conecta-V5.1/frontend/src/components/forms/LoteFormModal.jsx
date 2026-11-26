import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import { useForm } from '../../hooks/useForm';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { pedidosService } from '../../services/pedidosService';
import { lotesService } from '../../services/lotesService';
import { ETAPAS_COM_CONCLUIDO, SITUACOES_LOTE } from '../../constants/domain';
import { todayInput } from '../../utils/format';
import { isBlank, isPositiveInt } from '../../utils/validators';

function validate(v) {
  const e = {};
  if (isBlank(v.pedidoId)) e.pedidoId = 'Selecione o pedido vinculado.';
  if (!isPositiveInt(v.quantidadePecas)) e.quantidadePecas = 'Informe uma quantidade inteira maior que zero.';
  if (isBlank(v.etapaAtual)) e.etapaAtual = 'Selecione a etapa atual.';
  if (isBlank(v.dataInicio)) e.dataInicio = 'Informe a data de início.';
  if (isBlank(v.previsaoConclusao)) e.previsaoConclusao = 'Informe a previsão de conclusão.';
  else if (!isBlank(v.dataInicio) && v.previsaoConclusao < v.dataInicio) e.previsaoConclusao = 'A previsão não pode ser anterior ao início.';
  if (isBlank(v.situacao)) e.situacao = 'Selecione a situação.';
  return e;
}

export default function LoteFormModal({ defaults, onClose, onSaved }) {
  const toast = useToast();
  const pedidos = useAsync(() => pedidosService.list(), []);
  const form = useForm(
    {
      pedidoId: defaults?.pedidoId ? String(defaults.pedidoId) : '',
      quantidadePecas: '',
      etapaAtual: 'corte',
      dataInicio: todayInput(),
      previsaoConclusao: '',
      situacao: 'ativo',
    },
    validate,
  );
  const { values: v, errors: e, setValue } = form;
  const options = (pedidos.data ?? [])
    .filter((p) => p.situacao !== 'concluido' || String(p.id) === v.pedidoId)
    .map((p) => ({ value: String(p.id), label: `${p.codigo} — ${p.clienteNome ?? 'Cliente'}` }));

  const save = async (data) => {
    const saved = await lotesService.create({ ...data, quantidadePecas: Number(data.quantidadePecas) });
    toast.success('Lote cadastrado com sucesso.');
    onSaved(saved);
  };

  return (
    <FormModal
      title="Novo lote"
      note="O código do lote e o QR Code são gerados automaticamente ao salvar."
      onClose={onClose}
      onSubmit={form.submit(save)}
      saving={form.saving}
      serverError={form.serverError}
      submitLabel="Salvar lote"
    >
      <Field
        label="Pedido vinculado"
        name="pedidoId"
        as="select"
        options={options}
        placeholder={pedidos.loading ? 'Carregando pedidos…' : 'Selecione o pedido'}
        value={v.pedidoId}
        onChange={setValue}
        error={e.pedidoId}
        hint={pedidos.error ? 'Não foi possível carregar os pedidos.' : !pedidos.loading && !options.length ? 'Cadastre um pedido antes de criar o lote.' : undefined}
        required
        wide
      />
      <Field label="Quantidade de peças" name="quantidadePecas" type="number" min="1" step="1" inputMode="numeric" value={v.quantidadePecas} onChange={setValue} error={e.quantidadePecas} required />
      <Field label="Etapa atual" name="etapaAtual" as="select" options={ETAPAS_COM_CONCLUIDO} value={v.etapaAtual} onChange={setValue} error={e.etapaAtual} required />
      <Field label="Data de início" name="dataInicio" type="date" value={v.dataInicio} onChange={setValue} error={e.dataInicio} required />
      <Field label="Previsão de conclusão" name="previsaoConclusao" type="date" value={v.previsaoConclusao} onChange={setValue} error={e.previsaoConclusao} required />
      <Field label="Situação" name="situacao" as="select" options={SITUACOES_LOTE} value={v.situacao} onChange={setValue} error={e.situacao} required />
    </FormModal>
  );
}
