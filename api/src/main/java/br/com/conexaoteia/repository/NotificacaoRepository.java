package br.com.conexaoteia.repository;
import br.com.conexaoteia.entity.Notificacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
public interface NotificacaoRepository extends JpaRepository<Notificacao,Long> {
    boolean existsByLote_IdAndTipo(Long loteId, String tipo);
    @EntityGraph(attributePaths={"lote"})
    List<Notificacao> findAllByEmpresa_IdOrderByDataHoraDesc(Long empresaId);
    @EntityGraph(attributePaths={"lote"})
    Optional<Notificacao> findByIdAndEmpresa_Id(Long id,Long empresaId);
}
