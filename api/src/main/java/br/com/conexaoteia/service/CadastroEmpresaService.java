
package br.com.conexaoteia.service;

import br.com.conexaoteia.dto.CadastroEmpresaEntrada;
import br.com.conexaoteia.entity.Empresa;
import br.com.conexaoteia.entity.Perfil;
import br.com.conexaoteia.entity.Usuario;
import br.com.conexaoteia.repository.EmpresaRepository;
import br.com.conexaoteia.repository.PerfilRepository;
import br.com.conexaoteia.repository.UsuarioRepository;

import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.conexaoteia.exception.CadastroDuplicadoException;
import br.com.conexaoteia.validation.CnpjValidator;
import br.com.conexaoteia.validation.CadastroNormalizer;

@Service
public class CadastroEmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    public CadastroEmpresaService(
            EmpresaRepository empresaRepository,
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PasswordEncoder passwordEncoder) {

        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Empresa cadastrar(@Valid CadastroEmpresaEntrada request) {

        String cnpj = CadastroNormalizer.normalizarCnpj(
                request.cnpj()
        );

        String emailEmpresa = CadastroNormalizer.normalizarEmail(
                request.emailEmpresa()
        );

        String emailAdministrador = CadastroNormalizer.normalizarEmail(
                request.emailAdministrador()
        );

        if (!CnpjValidator.isValid(request.cnpj())) {
            throw new IllegalArgumentException("CNPJ inválido");
        }

        if (empresaRepository.existsByCnpj(cnpj)) {
            throw new CadastroDuplicadoException(
                    "CNPJ já cadastrado"
            );
        }

        if (usuarioRepository.existsByEmail(
                emailAdministrador)) {
            throw new CadastroDuplicadoException(
                    "E-mail do administrador já cadastrado"
            );
        }

        Perfil perfil = perfilRepository
                .findByNome("ADMINISTRADOR")
                .orElseThrow(() -> new IllegalStateException(
                        "Perfil ADMINISTRADOR não encontrado"
                ));

        Empresa empresa = new Empresa(
                request.nomeEmpresa(),
                cnpj,
                emailEmpresa,
                request.telefoneEmpresa()
        );

        empresa.atualizar(empresa.getNome(),empresa.getCnpj(),empresa.getEmail(),empresa.getTelefone(),
                request.cidade(),request.estado(),request.responsavel());
        empresa = empresaRepository.save(empresa);

        String senhaHash = passwordEncoder.encode(
                request.senhaAdministrador()
        );

        Usuario administrador = new Usuario(
                request.nomeAdministrador(),
                emailAdministrador,
                senhaHash,
                empresa,
                perfil
        );

        usuarioRepository.save(administrador);

        return empresa;
    }
}
