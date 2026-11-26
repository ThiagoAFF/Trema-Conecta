package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import br.com.conexaoteia.service.TenantContext;
import br.com.conexaoteia.validation.CnpjValidator;
import br.com.conexaoteia.validation.CadastroNormalizer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/empresas/atual")
public class EmpresaGestaoController {
    private final TenantContext tenant; private final EmpresaRepository empresas;
    private final EmpresaPreferenciasRepository prefs;
    public EmpresaGestaoController(TenantContext tenant,EmpresaRepository empresas,EmpresaPreferenciasRepository prefs) {
        this.tenant=tenant;this.empresas=empresas;this.prefs=prefs;
    }
    public record Entrada(@NotBlank String razaoSocial,@NotBlank String cnpj,
        @NotBlank @Email String email,@NotBlank String telefone,@NotBlank String cidade,
        @NotBlank String estado,@NotBlank String responsavel) {}
    public record Saida(Long id,String codigo,String razaoSocial,String cnpj,String email,
        String telefone,String cidade,String estado,String responsavel) {}
    public record Preferencias(boolean mudancaEtapa,boolean loteConcluido,boolean prazoProximo,
        boolean atraso,boolean novaMovimentacao) {}
    public static Saida mapear(Empresa e) {
        return new Saida(e.getId(),"EMP-"+e.getId(),e.getNome(),e.getCnpj(),e.getEmail(),
            e.getTelefone(),e.getCidade(),e.getEstado(),e.getResponsavel());
    }
    @GetMapping @Transactional(readOnly=true)
    public Saida consultar(Authentication auth) {return mapear(tenant.empresa(auth.getName()));}
    @PutMapping @Transactional
    public Saida atualizar(@Valid @RequestBody Entrada entrada,Authentication auth) {
        Empresa empresa=tenant.administrador(auth.getName()).getEmpresa();
        String cnpj=CadastroNormalizer.normalizarCnpj(entrada.cnpj());
        if(!CnpjValidator.isValid(cnpj))throw new IllegalArgumentException("CNPJ inválido");
        if(!empresa.getCnpj().equals(cnpj) && empresas.existsByCnpj(cnpj))
            throw new IllegalArgumentException("CNPJ já cadastrado");
        empresa.atualizar(entrada.razaoSocial().trim(),cnpj,entrada.email().trim(),entrada.telefone(),
            entrada.cidade().trim(),entrada.estado(),entrada.responsavel().trim());
        return mapear(empresa);
    }
    @GetMapping("/preferencias-notificacoes") @Transactional(readOnly=true)
    public Preferencias consultarPrefs(Authentication auth) {
        Long id=tenant.empresa(auth.getName()).getId();
        return mapearPrefs(prefs.findById(id).orElse(new EmpresaPreferencias(id)));
    }
    @PutMapping("/preferencias-notificacoes") @Transactional
    public Preferencias salvarPrefs(@RequestBody Preferencias p,Authentication auth) {
        Long id=tenant.administrador(auth.getName()).getEmpresa().getId();
        EmpresaPreferencias registro=prefs.findById(id).orElse(new EmpresaPreferencias(id));
        registro.atualizar(p.mudancaEtapa(),p.loteConcluido(),p.prazoProximo(),p.atraso(),p.novaMovimentacao());
        prefs.save(registro);return mapearPrefs(registro);
    }
    private static Preferencias mapearPrefs(EmpresaPreferencias p) {
        return new Preferencias(p.isMudancaEtapa(),p.isLoteConcluido(),p.isPrazoProximo(),p.isAtraso(),p.isNovaMovimentacao());
    }
}
