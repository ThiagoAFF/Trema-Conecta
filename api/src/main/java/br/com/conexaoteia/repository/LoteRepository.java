package br.com.conexaoteia.repository;
import br.com.conexaoteia.entity.Lote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
public interface LoteRepository extends JpaRepository<Lote,Long> {
    @EntityGraph(attributePaths={"pedido","pedido.cliente"})
    List<Lote> findAllByEmpresa_IdOrderByIdDesc(Long empresaId);
    @EntityGraph(attributePaths={"pedido","pedido.cliente"})
    Optional<Lote> findByIdAndEmpresa_Id(Long id,Long empresaId);
    long countByPedido_IdAndEmpresa_Id(Long pedidoId,Long empresaId);
}
