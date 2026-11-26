package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import br.com.conexaoteia.service.TenantContext;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
public class ResumoController {
    private final ClienteRepository clientes;private final PedidoRepository pedidos;
    private final LoteRepository lotes;private final MovimentacaoRepository movimentacoes;
    private final TenantContext tenant;
    public ResumoController(ClienteRepository clientes,PedidoRepository pedidos,LoteRepository lotes,
            MovimentacaoRepository movimentacoes,TenantContext tenant) {
        this.clientes=clientes;this.pedidos=pedidos;this.lotes=lotes;this.movimentacoes=movimentacoes;this.tenant=tenant;
    }
    private static final List<String> ETAPAS=List.of("corte","costura","acabamento","expedicao","concluido");
    @GetMapping("/dashboard") @Transactional(readOnly=true)
    public Map<String,Object> dashboard(Authentication auth) {
        Long empresaId=tenant.empresa(auth.getName()).getId();
        List<Lote> lista=lotes.findAllByEmpresa_IdOrderByIdDesc(empresaId);
        long ativos=lista.stream().filter(l->"ativo".equals(LoteController.situacaoEfetiva(l))).count();
        long atrasados=lista.stream().filter(l->"atrasado".equals(LoteController.situacaoEfetiva(l))).count();
        long concluidos=lista.stream().filter(l->"concluido".equals(LoteController.situacaoEfetiva(l))).count();
        List<Map<String,Object>> porEtapa=new ArrayList<>();
        for(String e:ETAPAS) porEtapa.add(Map.of("etapa",e,
            "lotes",lista.stream().filter(l->e.equals(l.getEtapaAtual())).count(),
            "pecas",lista.stream().filter(l->e.equals(l.getEtapaAtual())).mapToInt(Lote::getQuantidadePecas).sum()));
        long pedidosAtivos=pedidos.findAllByEmpresa_IdOrderByDataCriacaoDesc(empresaId).stream()
            .filter(p->p.getStatus()==StatusPedido.ABERTO && !"concluido".equals(p.getSituacaoWeb())).count();
        return Map.of("clientes",clientes.findAllByEmpresa_IdOrderByNomeAsc(empresaId).size(),
            "pedidosEmAndamento",pedidosAtivos,"lotesAtivos",ativos,"lotesAtrasados",atrasados,
            "lotesConcluidos",concluidos,"lotesPorEtapa",porEtapa);
    }
    @GetMapping("/relatorios/resumo") @Transactional(readOnly=true)
    public Map<String,Object> relatorios(Authentication auth) {
        Long empresaId=tenant.empresa(auth.getName()).getId();
        List<Lote> lista=lotes.findAllByEmpresa_IdOrderByIdDesc(empresaId);
        List<Movimentacao> movs=movimentacoes.findAllByEmpresa_IdOrderByDataHoraDesc(empresaId);
        long concluidos=lista.stream().filter(l->"concluido".equals(l.getSituacao())).count();
        long atrasados=lista.stream().filter(l->"atrasado".equals(LoteController.situacaoEfetiva(l))).count();
        long tempoMedio=lista.stream().filter(l->l.getDataConclusao()!=null)
            .mapToLong(l->ChronoUnit.DAYS.between(l.getDataInicio(),l.getDataConclusao()))
            .map(n->Math.max(n,0)).sum()/Math.max(1,concluidos);
        List<Map<String,Object>> porEtapa=new ArrayList<>();
        List<Map<String,Object>> lotesPorEtapa=new ArrayList<>();
        for(String e:ETAPAS) {
            porEtapa.add(Map.of("etapa",e,"pecas",movs.stream().filter(m->e.equals(m.getEtapa())).mapToInt(Movimentacao::getAprovadas).sum()));
            lotesPorEtapa.add(Map.of("etapa",e,"lotes",lista.stream().filter(l->e.equals(l.getEtapaAtual())).count()));
        }
        return Map.of("pecasEmProducao",lista.stream().filter(l->!"concluido".equals(l.getSituacao()))
                .mapToInt(Lote::getQuantidadePecas).sum(),
            "pecasAprovadas",movs.stream().mapToInt(Movimentacao::getAprovadas).sum(),
            "pecasDefeito",movs.stream().mapToInt(Movimentacao::getDefeitos).sum(),
            "lotesConcluidos",concluidos,"lotesAtrasados",atrasados,"tempoMedioDias",tempoMedio,
            "producaoPorEtapa",porEtapa,"lotesPorEtapa",lotesPorEtapa);
    }
}
