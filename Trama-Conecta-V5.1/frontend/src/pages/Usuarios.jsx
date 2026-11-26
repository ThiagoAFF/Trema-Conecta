import { useState } from 'react';
import { Pencil, Plus, UserCheck, UserX } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import SearchInput from '../components/ui/SearchInput';
import RowActions from '../components/ui/RowActions';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import UsuarioFormModal from '../components/forms/UsuarioFormModal';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';
import { usuariosService } from '../services/usuariosService';
import { PERFIS, STATUS_USUARIO } from '../constants/domain';
import { getErrorMessage } from '../utils/errors';

export default function Usuarios() {
  usePageTitle('Usuários');
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [perfil, setPerfil] = useState('');
  const [status, setStatus] = useState('');
  const termo = useDebouncedValue(busca);
  const { data, loading, error, reload } = useAsync(() => usuariosService.list({ search: termo, perfil, status }), [termo, perfil, status]);
  const [form, setForm] = useState(null);
  const [desativar, setDesativar] = useState(null);
  const [busy, setBusy] = useState(false);
  const filtrando = Boolean(termo || perfil || status);

  const alterarStatus = async (usuario, novoStatus) => {
    setBusy(true);
    try {
      await usuariosService.setStatus(usuario.id, novoStatus);
      toast.success(novoStatus === 'ativo' ? 'Usuário ativado.' : 'Usuário desativado.');
      setDesativar(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'nome', header: 'Nome', render: (u) => <strong>{u.nome}</strong> },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'perfil', header: 'Perfil', render: (u) => <StatusBadge value={u.perfil} /> },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge value={u.status} /> },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'actions',
      render: (u) => (
        <RowActions
          actions={[
            { label: `Editar ${u.nome}`, icon: Pencil, onClick: () => setForm({ usuario: u }) },
            u.status === 'ativo'
              ? { label: `Desativar ${u.nome}`, icon: UserX, tone: 'danger', onClick: () => setDesativar(u) }
              : { label: `Ativar ${u.nome}`, icon: UserCheck, onClick: () => alterarStatus(u, 'ativo') },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Equipe"
        title="Usuários"
        description="Quem acessa o sistema e com qual nível de permissão."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setForm({})}>
            <Plus size={16} /> Novo usuário
          </button>
        }
      />
      <Card>
        <div className="toolbar">
          <SearchInput label="Buscar usuário" placeholder="Buscar por nome ou e-mail" value={busca} onChange={setBusca} />
          <label className="filter">
            <span className="sr-only">Filtrar por perfil</span>
            <select className="input" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              <option value="">Todos os perfis</option>
              {PERFIS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
          <label className="filter">
            <span className="sr-only">Filtrar por status</span>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS_USUARIO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={reload}
          caption="Lista de usuários"
          emptyTitle={filtrando ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          emptyDescription={filtrando ? 'Ajuste a busca ou os filtros.' : 'Cadastre os membros da equipe que acessarão o sistema.'}
        />
      </Card>

      {form && (
        <UsuarioFormModal
          usuario={form.usuario}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            reload();
          }}
        />
      )}
      {desativar && (
        <ConfirmDialog
          title="Desativar usuário?"
          message={`${desativar.nome} perderá o acesso ao sistema até ser ativado novamente. O histórico de registros é mantido.`}
          confirmLabel="Desativar"
          tone="danger"
          busy={busy}
          onConfirm={() => alterarStatus(desativar, 'inativo')}
          onCancel={() => setDesativar(null)}
        />
      )}
    </>
  );
}
