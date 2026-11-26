package br.com.conexaoteia.service;
import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
@Service
public class TenantContext {
    private final UsuarioRepository usuarios;
    public TenantContext(UsuarioRepository usuarios) {this.usuarios=usuarios;}
    public Usuario usuario(String email) {
        Usuario u=usuarios.findByEmail(email).orElseThrow(()->new AccessDeniedException("Usuário inválido"));
        if (!u.isAtivo()) throw new AccessDeniedException("Usuário inativo");
        return u;
    }
    public Empresa empresa(String email) {return usuario(email).getEmpresa();}
    public Usuario administrador(String email) {
        Usuario u=usuario(email);
        if (!"ADMINISTRADOR".equals(u.getPerfil().getNome()))
            throw new AccessDeniedException("Somente administradores podem executar esta operação");
        return u;
    }
}
