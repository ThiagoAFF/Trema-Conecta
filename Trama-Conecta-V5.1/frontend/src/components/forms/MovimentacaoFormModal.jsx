import FormModal from '../ui/FormModal';
import Field from '../ui/Field';
import { useForm } from '../../hooks/useForm';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { lotesService } from '../../services/lotesService';
import { movimentacoesService } from '../../services/movimentacoesService';
import { ETAPAS_COM_CONCLUIDO, LABELS } from '../../constants/domain';
import { nowInput } from '../../utils/format';
import { isBlank, isNonNegativeInt } from '../../utils/validators';

function validate(v) {
  const e = {};
  if (isBlank(v.loteId)) e.loteId = 'Selecione o lote.';
  if (isBlank(v.etapa)) e.etapa = 'Selecione a etapa da produção.';
  if (isBlank(v.responsavel)) e.responsavel = 'Informe o responsável.';
  if (isBlank(v.dataHora)) e.dataHora = 'Informe a data e o horário.';
  if (!isNonNegativeInt(v.aprovadas)) e.aprovadas = 'Informe um número inteiro (0 ou mais).';
  if (!isNonNegativeInt(v.defeitos)) e.defeitos = 'Informe um número inteiro (0 ou mais).';
  if (!e.aprovadas && !e.defeitos && v.etapa !== 'concluido' && Number(v.aprovadas) + Number(v.defeitos) === 0) {
    e.aprovadas = 'Registre ao menos uma peça aprovada ou com defeito.';
  }
  return e;
}

export default function MovimentacaoFormModal({ defaults, onClose, onSaved }) {
  const toast = useToast();
  const { usuario } = useAuth();
  const lotes = useAsync(() => lotesService.list(), []);
  const form = useForm(
    {
      loteId: defaults?.loteId ? String(defaults.loteId) : '',
      etapa: '',
      responsavel: usuario?.nome ?? '',
      dataHora: nowInput(),
      aprovadas: '0',
      defeitos: '0',
      observacoes: '',
    },
    validate,
  );
  const { values: v, errors: e, setValue } = form;
  const lista = lotes.data ?? [];
  const options = lista
    .filter((l) => l.situacao !== 'concluido')
    .map((l) => ({ value: String(l.id), label: `${l.codigo} — ${LABELS[l.etapaAtual] ?? l.etapaAtual}` }));

  // Ao escolher o lote, sugere a etapa atual dele (se a etapa ainda não foi escolhida).
  const handleChange = (name, value) => {
    setValue(name, value);
    if (name === 'loteId' && !v.etapa) {
      const lote = lista.find((l) => String(l.id) === value);
      if (lote && lote.etapaAtual !== 'concluido') setValue('etapa', lote.etapaAtual);
    }
  };

  const save = async (data) => {
    const saved = await movimentacoesService.create({
      ...data,
      aprovadas: Number(data.aprovadas),
      defeitos: Number(data.defeitos),
      dataHora: new Date(data.dataHora).toISOString(),
    });
    toast.success('Movimentação registrada com sucesso.');
    onSaved(saved);
  };

  return (
    <FormModal
      title="Registrar movimentação"
      note="Cada registro é uma movimentação realizada e fica no histórico do lote."
      onClose={onClose}
      onSubmit={form.submit(save)}
      saving={form.saving}
      serverError={form.serverError}
      submitLabel="Salvar movimentação"
    >
      <Field
        label="Lote"
        name="loteId"
        as="select"
        options={options}
        placeholder={lotes.loading ? 'Carregando lotes…' : 'Selecione o lote'}
        value={v.loteId}
        onChange={handleChange}
        error={e.loteId}
        hint={lotes.error ? 'Não foi possível carregar os lotes.' : !lotes.loading && !options.length ? 'Nenhum lote em andamento. Cadastre um lote primeiro.' : undefined}
        required
      />
      <Field label="Etapa da produção" name="etapa" as="select" options={ETAPAS_COM_CONCLUIDO} value={v.etapa} onChange={handleChange} error={e.etapa} required />
      <Field label="Responsável" name="responsavel" value={v.responsavel} onChange={handleChange} error={e.responsavel} required />
      <Field label="Data e horário" name="dataHora" type="datetime-local" value={v.dataHora} onChange={handleChange} error={e.dataHora} required />
      <Field label="Quantidade aprovada" name="aprovadas" type="number" min="0" step="1" inputMode="numeric" value={v.aprovadas} onChange={handleChange} error={e.aprovadas} required />
      <Field label="Quantidade com defeito" name="defeitos" type="number" min="0" step="1" inputMode="numeric" value={v.defeitos} onChange={handleChange} error={e.defeitos} required />
      <Field label="Observações" name="observacoes" as="textarea" value={v.observacoes} onChange={handleChange} wide />
    </FormModal>
  );
}
