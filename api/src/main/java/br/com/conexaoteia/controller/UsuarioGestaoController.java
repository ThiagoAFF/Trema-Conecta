package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import br.com.conexaoteia.service.TenantContext;
import br.com.conexaoteia.validation.CadastroNormalizer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/usuarios")
public class UsuarioGestaoController {
    private final UsuarioRepository usuarios;private final PerfilRepository perfis;private final TenantContext tenant;
    public UsuarioGestaoController(UsuarioRepository usuarios,PerfilRepository perfis,TenantContext tenant) {
        this.usuarios=usuarios;this.perfis=perfis;this.tenant=tenant;
    }
    public record Saida(Long id,String nome,String email,String telefone,String perfil,String status) {}
    public record Entrada(@NotBlank String nome,@NotBlank @Email String email,
        String telefone,@NotBlank String perfil,@NotBlank String status) {}
    public record Status(@NotBlank String status) {}
    public static Saida mapear(Usuario u) {
        return new Saida(u.getId(),u.getNome(),u.getEmail(),u.getTelefone(),
            u.getPerfil().getNome().toLowerCase(Locale.ROOT),u.isAtivo()?"ativo":"inativo");
    }
    @GetMapping @Transactional(readOnly=true)
    public List<Saida> listar(Authentication auth) {
        Long empresaId=tenant.empresa(auth.getName()).getId();
        return usuarios.findAllByEmpresa_IdOrderByNomeAsc(empresaId).stream().map(UsuarioGestaoController::mapear).toList();
    }
    @GetMapping("/{id}") @Transactional(readOnly=true)
    public Saida buscar(@PathVariable Long id,Authentication auth) {
        return mapear(localizar(id,auth.getName()));
    }
    private Usuario localizar(Long id,String email) {
        Long empresaId=tenant.empresa(email).getId();
        return usuarios.findByIdAndEmpresa_Id(id,empresaId)
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuário não encontrado"));
    }
    @PutMapping("/{id}") @Transactional
    public Saida atualizar(@PathVariable Long id,@Valid @RequestBody Entrada entrada,Authentication auth) {
        tenant.administrador(auth.getName());
        Usuario usuario=localizar(id,auth.getName());
        String email=CadastroNormalizer.normalizarEmail(entrada.email());
        if (!usuario.getEmail().equals(email) && usuarios.existsByEmail(email))
            throw new IllegalArgumentException("E-mail já cadastrado");
        Perfil perfil=perfil(entrada.perfil());boolean ativo=statusAtivo(entrada.status());
        if (usuario.getEmail().equals(auth.getName()) && !ativo)
            throw new IllegalArgumentException("Não é possível desativar o próprio usuário");
        usuario.atualizar(entrada.nome().trim(),email,entrada.telefone(),perfil,ativo);
        return mapear(usuario);
    }
    @PatchMapping("/{id}/status") @Transactional
    public Saida alterarStatus(@PathVariable Long id,@Valid @RequestBody Status entrada,Authentication auth) {
        tenant.administrador(auth.getName());
        Usuario u=localizar(id,auth.getName());boolean ativo=statusAtivo(entrada.status());
        if (u.getEmail().equals(auth.getName()) && !ativo)
            throw new IllegalArgumentException("Não é possível desativar o próprio usuário");
        u.alterarStatus(ativo);return mapear(u);
    }
    private boolean statusAtivo(String status) {
        if(!Set.of("ativo","inativo").contains(status)) throw new IllegalArgumentException("Status inválido");
        return "ativo".equals(status);
    }
    private Perfil perfil(String perfil) {
        String nome=perfil.toUpperCase(Locale.ROOT);
        if (!Set.of("ADMINISTRADOR","GERENTE","FUNCIONARIO").contains(nome))
            throw new IllegalArgumentException("Perfil inválido");
        return perfis.findByNome(nome).orElseThrow(()->new IllegalArgumentException("Perfil não encontrado"));
    }
}
