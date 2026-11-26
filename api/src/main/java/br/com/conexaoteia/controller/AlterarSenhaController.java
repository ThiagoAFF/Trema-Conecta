package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.Usuario;
import br.com.conexaoteia.service.TenantContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth")
public class AlterarSenhaController {
    private final TenantContext tenant;private final PasswordEncoder encoder;
    public AlterarSenhaController(TenantContext tenant,PasswordEncoder encoder) {
        this.tenant=tenant;this.encoder=encoder;
    }
    public record Entrada(@NotBlank String senhaAtual,@NotBlank @Size(min=8) String novaSenha) {}
    @PostMapping("/alterar-senha") @Transactional
    public Map<String,Boolean> alterar(@Valid @RequestBody Entrada entrada,Authentication auth) {
        Usuario u=tenant.usuario(auth.getName());
        if(!encoder.matches(entrada.senhaAtual(),u.getSenhaHash()))
            throw new IllegalArgumentException("Senha atual incorreta");
        if(encoder.matches(entrada.novaSenha(),u.getSenhaHash()))
            throw new IllegalArgumentException("A senha nova precisa ser diferente");
        u.alterarSenha(encoder.encode(entrada.novaSenha()));
        return Map.of("ok",true);
    }
}
