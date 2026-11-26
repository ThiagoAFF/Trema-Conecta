package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import br.com.conexaoteia.service.TenantContext;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/movimentacoes")
public class MovimentacaoController {
    private final MovimentacaoRepository movs;private final LoteRepository lotes;
    private final NotificacaoRepository notificacoes;private final TenantContext tenant;
    private final EmpresaPreferenciasRepository preferencias;
    public MovimentacaoController(MovimentacaoRepository movs,LoteRepository lotes,
            NotificacaoRepository notificacoes,TenantContext tenant,EmpresaPreferenciasRepository preferencias) {
        this.movs=movs;this.lotes=lotes;this.notificacoes=notificacoes;this.tenant=tenant;
        this.preferencias=preferencias;
    }
    public record Entrada(@NotNull Long loteId,@NotBlank String etapa,@NotBlank String responsavel,
        @NotNull Instant dataHora,@NotNull @Min(0) Integer aprovadas,@NotNull @Min(0) Integer defeitos,
        @Size(max=1000) String observacoes) {}
    public record Saida(Long id,Long loteId,String loteCodigo,String etapa,String responsavel,
        String dataHora,int aprovadas,int defeitos,String observacoes) {}
    public static Saida mapear(Movimentacao m) {
        return new Saida(m.getId(),m.getLote().getId(),m.getLote().getCodigo(),m.getEtapa(),m.getResponsavel(),
            m.getDataHora().atOffset(ZoneOffset.UTC).toString(),m.getAprovadas(),m.getDefeitos(),m.getObservacoes());
    }
    @GetMapping @Transactional(readOnly=true)
    public List<Saida> listar(Authentication auth) {
        return movs.findAllByEmpresa_IdOrderByDataHoraDesc(tenant.empresa(auth.getName()).getId())
           .stream().map(MovimentacaoController::mapear).toList();
    }
    @GetMapping("/{id}") @Transactional(readOnly=true)
    public Saida buscar(@PathVariable Long id,Authentication auth) {
        return mapear(movs.findByIdAndEmpresa_Id(id,tenant.empresa(auth.getName()).getId())
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Movimentação não encontrada")));
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
    public Saida criar(@Valid @RequestBody Entrada entrada,Authentication auth) {
        Empresa empresa=tenant.empresa(auth.getName());
        if (!Set.of("corte","costura","acabamento","expedicao","concluido").contains(entrada.etapa()))
            throw new IllegalArgumentException("Etapa inválida");
        Lote lote=lotes.findByIdAndEmpresa_Id(entrada.loteId(),empresa.getId())
            .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Lote não encontrado"));
        if ("concluido".equals(lote.getSituacao())) throw new IllegalArgumentException("Lote já concluído");
        if ((long)entrada.aprovadas()+entrada.defeitos()>lote.getQuantidadePecas())
            throw new IllegalArgumentException("Quantidade superior ao total de peças do lote");
        String etapaAnterior=lote.getEtapaAtual();
        Movimentacao m=movs.saveAndFlush(new Movimentacao(empresa,lote,entrada.etapa(),entrada.responsavel(),
            LocalDateTime.ofInstant(entrada.dataHora(),ZoneOffset.UTC),entrada.aprovadas(),entrada.defeitos(),entrada.observacoes()));
        lote.registrarEtapa(entrada.etapa());
        String tipo="novaMovimentacao";
        if ("concluido".equals(entrada.etapa())) tipo="loteConcluido";
        else if (!etapaAnterior.equals(entrada.etapa())) tipo="mudancaEtapa";
        EmpresaPreferencias prefs=preferencias.findById(empresa.getId())
            .orElse(new EmpresaPreferencias(empresa.getId()));
        boolean emitir=switch(tipo) {
            case "loteConcluido" -> prefs.isLoteConcluido();
            case "mudancaEtapa" -> prefs.isMudancaEtapa();
            default -> prefs.isNovaMovimentacao();
        };
        if (emitir) notificacoes.save(new Notificacao(empresa,lote,tipo,
            "Lote "+lote.getCodigo()+" — "+entrada.etapa()+" ("+entrada.aprovadas()+" aprovadas, "+entrada.defeitos()+" com defeito)."));
        return mapear(m);
    }
}
