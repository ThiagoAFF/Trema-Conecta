
package br.com.conexaoteia.repository;

import br.com.conexaoteia.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository
        extends JpaRepository<Empresa, Long> {

    boolean existsByCnpj(String cnpj);

}