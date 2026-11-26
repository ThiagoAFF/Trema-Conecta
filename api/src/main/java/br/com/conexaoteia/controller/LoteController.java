package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import br.com.conexaoteia.service.TenantContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/lotes")
public class LoteController {
    private final LoteRepository lotes; private final PedidoRepository pedidos; private final TenantContext tenant;
    public LoteController(LoteRepository lotes, PedidoRepository pedidos, TenantContext tenant) {
        this.lotes=lotes;this.pedidos=pedidos;this.tenant=tenant;
    }
    public record Entrada(@NotNull Long pedidoId,@NotNull @Min(1) Integer quantidadePecas,
       @NotBlank String etapaAtual,@NotNull LocalDate dataInicio,@NotNull LocalDate previsaoConclusao,
       @NotBlank String situacao) {}
    public record Saida(Long id,String codigo,Long pedidoId,String pedidoCodigo,String clienteNome,
       Integer quantidadePecas,String etapaAtual,LocalDate dataInicio,LocalDate previsaoConclusao,
       String situacao,LocalDate dataConclusao) {}
    private static final Set<String> ETAPAS=Set.of("corte","costura","acabamento","expedicao","concluido");
    private static final Set<String> SITUACOES=Set.of("ativo","atrasado","concluido");
    public static Saida mapear(Lote l) {
        return new Saida(l.getId(),l.getCodigo(),l.getPedido().getId(),l.getPedido().getCodigo(),
            l.getPedido().getCliente().getNome(),l.getQuantidadePecas(),l.getEtapaAtual(),l.getDataInicio(),
            l.getPrevisaoConclusao(), situacaoEfetiva(l),l.getDataConclusao());
    }
    public static String situacaoEfetiva(Lote l) {
        return !"concluido".equals(l.getSituacao()) && l.getPrevisaoConclusao().isBefore(LocalDate.now())
            ? "atrasado" : l.getSituacao();
    }
    @GetMapping @Transactional(readOnly=true)
    public List<Saida> listar(Authentication auth) {
        return lotes.findAllByEmpresa_IdOrderByIdDesc(tenant.empresa(auth.getName()).getId()).stream()
            .map(LoteController::mapear).toList();
    }
    @GetMapping("/{id}") @Transactional(readOnly=true)
    public Saida buscar(@PathVariable Long id,Authentication auth) {
        return mapear(lotes.findByIdAndEmpresa_Id(id,tenant.empresa(auth.getName()).getId())
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Lote não encontrado")));
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
    public Saida criar(@Valid @RequestBody Entrada entrada,Authentication auth) {
        Empresa empresa=tenant.empresa(auth.getName());
        if (!ETAPAS.contains(entrada.etapaAtual()) || !SITUACOES.contains(entrada.situacao()))
            throw new IllegalArgumentException("Etapa ou situação inválida");
        if ("concluido".equals(entrada.etapaAtual()) != "concluido".equals(entrada.situacao()))
            throw new IllegalArgumentException("Etapa e situação de conclusão precisam ser consistentes");
        if (entrada.previsaoConclusao().isBefore(entrada.dataInicio()))
            throw new IllegalArgumentException("A previsão não pode anteceder o início");
        Pedido pedido=pedidos.findByIdAndEmpresa_Id(entrada.pedidoId(),empresa.getId())
            .orElseThrow(()->new IllegalArgumentException("Pedido não pertence à empresa"));
        Lote lote=new Lote("LOT-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(),empresa,pedido,
           entrada.quantidadePecas(),entrada.etapaAtual(),entrada.dataInicio(),entrada.previsaoConclusao(),entrada.situacao());
        return mapear(lotes.saveAndFlush(lote));
    }
}
