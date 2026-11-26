package br.com.conexaoteia.repository;

import br.com.conexaoteia.entity.Clientes;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface ClienteRepository extends JpaRepository<Clientes, Long> {
    @EntityGraph(attributePaths = "empresa")
    List<Clientes> findAllByEmpresa_IdOrderByNomeAsc(Long empresaId);
    @EntityGraph(attributePaths = "empresa")
    Optional<Clientes> findByIdAndEmpresa_Id(Long id, Long empresaId);
}
