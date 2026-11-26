package br.com.conexaoteia.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.conexaoteia.entity.Pedido;
public interface PedidoRepository extends JpaRepository<Pedido,Long>{
    @org.springframework.data.jpa.repository.Query("SELECT p.cliente.id, COUNT(p) FROM Pedido p WHERE p.empresa.id = :empresaId GROUP BY p.cliente.id")
    List<Object[]> contarPedidosPorCliente(@org.springframework.data.repository.query.Param("empresaId") Long empresaId);
    @EntityGraph(attributePaths={"cliente","itens"})
    List<Pedido> findAllByEmpresa_IdOrderByDataCriacaoDesc(Long empresaId);
    @EntityGraph(attributePaths={"cliente","itens"})
    Optional<Pedido> findByIdAndEmpresa_Id(Long id,Long empresaId);
}
