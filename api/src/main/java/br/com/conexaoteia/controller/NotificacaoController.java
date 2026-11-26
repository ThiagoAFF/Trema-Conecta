package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.Notificacao;
import br.com.conexaoteia.repository.NotificacaoRepository;
import br.com.conexaoteia.service.TenantContext;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/notificacoes")
public class NotificacaoController {
    private final NotificacaoRepository repo;private final TenantContext tenant;
    public NotificacaoController(NotificacaoRepository repo,TenantContext tenant) {this.repo=repo;this.tenant=tenant;}
    public record Saida(Long id,String tipo,Long loteId,String loteCodigo,String descricao,String dataHora,boolean lida) {}
    public static Saida mapear(Notificacao n) {
        return new Saida(n.getId(),n.getTipo(),n.getLote()==null?null:n.getLote().getId(),
            n.getLote()==null?null:n.getLote().getCodigo(),n.getDescricao(),n.getDataHora().toString(),n.isLida());
    }
    @GetMapping @Transactional(readOnly=true)
    public List<Saida> listar(Authentication auth) {
        return repo.findAllByEmpresa_IdOrderByDataHoraDesc(tenant.empresa(auth.getName()).getId())
            .stream().map(NotificacaoController::mapear).toList();
    }
    @PatchMapping("/{id}/lida") @Transactional
    public Saida ler(@PathVariable Long id,Authentication auth) {
        Notificacao n=repo.findByIdAndEmpresa_Id(id,tenant.empresa(auth.getName()).getId())
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Notificação não encontrada"));
        n.marcarLida();return mapear(n);
    }
    @PostMapping("/marcar-todas-lidas") @Transactional
    public Map<String,Boolean> lerTodas(Authentication auth) {
        repo.findAllByEmpresa_IdOrderByDataHoraDesc(tenant.empresa(auth.getName()).getId())
            .forEach(Notificacao::marcarLida);
        return Map.of("ok",true);
    }
}
