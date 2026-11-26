
package br.com.conexaoteia.repository;

import br.com.conexaoteia.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);
    @EntityGraph(attributePaths = {"perfil", "empresa"})
    java.util.List<br.com.conexaoteia.entity.Usuario> findAllByEmpresa_IdOrderByNomeAsc(Long empresaId);
    @EntityGraph(attributePaths = {"perfil", "empresa"})
    Optional<Usuario> findByIdAndEmpresa_Id(Long id, Long empresaId);

    @EntityGraph(attributePaths = {"perfil", "empresa"})
    Optional<Usuario> findByEmail(String email);

}
