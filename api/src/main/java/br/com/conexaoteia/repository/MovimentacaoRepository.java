package br.com.conexaoteia.repository;
import br.com.conexaoteia.entity.Movimentacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
public interface MovimentacaoRepository extends JpaRepository<Movimentacao,Long> {
    @EntityGraph(attributePaths={"lote"})
    Optional<Movimentacao> findByIdAndEmpresa_Id(Long id,Long empresaId);
    @EntityGraph(attributePaths={"lote"})
    List<Movimentacao> findAllByEmpresa_IdOrderByDataHoraDesc(Long empresaId);
}
