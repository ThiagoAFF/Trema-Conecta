
package br.com.conexaoteia.service;

import br.com.conexaoteia.dto.CadastroUsuarioEntrada;
import br.com.conexaoteia.entity.Perfil;
import br.com.conexaoteia.entity.Usuario;
import br.com.conexaoteia.repository.PerfilRepository;
import br.com.conexaoteia.repository.UsuarioRepository;
import br.com.conexaoteia.validation.CadastroNormalizer;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Long cadastrar(
            CadastroUsuarioEntrada entrada,
            String emailAutenticado) {

        // 1. Identificar o usuário autenticado
        Usuario administrador = usuarioRepository
                .findByEmail(emailAutenticado)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Usuário autenticado não encontrado"
                        )
                );

        // 2. Verificar a permissão
        if (!"ADMINISTRADOR".equals(
                administrador.getPerfil().getNome())) {

            throw new AccessDeniedException(
                    "Apenas administradores podem cadastrar usuários"
            );
        }

        // 3. Normalizar o e-mail do novo usuário
        String email = CadastroNormalizer
                .normalizarEmail(entrada.email());

        // 4. Verificar duplicidade
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "E-mail já cadastrado"
            );
        }

        // 5. Localizar o perfil solicitado
        Perfil perfil;
        if (entrada.perfilId() != null) {
            perfil = perfilRepository.findById(entrada.perfilId())
                .orElseThrow(() -> new IllegalArgumentException("Perfil não encontrado"));
        } else if (entrada.perfil() != null && !entrada.perfil().isBlank()) {
            String nomePerfil = entrada.perfil().trim().toUpperCase(java.util.Locale.ROOT);
            perfil = perfilRepository.findByNome(nomePerfil)
                .orElseThrow(() -> new IllegalArgumentException("Perfil não encontrado"));
        } else throw new IllegalArgumentException("Perfil é obrigatório");

        // 6. Codificar a senha
        String senhaHash = passwordEncoder
                .encode(entrada.senha());

        // 7. Criar o usuário na mesma empresa
        Usuario novoUsuario = new Usuario(
                entrada.nome(),
                email,
                senhaHash,
                administrador.getEmpresa(),
                perfil
        );

        novoUsuario.definirTelefone(entrada.telefone());
        if (entrada.status()!=null && !java.util.Set.of("ativo","inativo").contains(entrada.status()))
            throw new IllegalArgumentException("Status de usuário inválido");
        if ("inativo".equals(entrada.status())) novoUsuario.alterarStatus(false);
        // 8. Salvar e retornar o identificador
        Usuario salvo = usuarioRepository.save(novoUsuario);

        return salvo.getId();
    }
}
