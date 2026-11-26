package br.com.conexaoteia.service;

import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import java.time.LocalDate;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

/** Alertas persistidos e sem duplicação por (lote, tipo), executados também após iniciar o sistema. */
@Configuration
@EnableScheduling
public class NotificacoesPrazoScheduler {
    private final LoteRepository lotes;
    private final NotificacaoRepository notificacoes;
    private final EmpresaPreferenciasRepository preferencias;
    public NotificacoesPrazoScheduler(LoteRepository lotes, NotificacaoRepository notificacoes,
                                     EmpresaPreferenciasRepository preferencias) {
        this.lotes=lotes;this.notificacoes=notificacoes;this.preferencias=preferencias;
    }
    @Scheduled(initialDelayString="${app.notificacoes.atraso-inicial-ms:10000}",
               fixedDelayString="${app.notificacoes.intervalo-ms:3600000}")
    @Transactional
    public void verificarPrazos() {
        LocalDate hoje=LocalDate.now();
        for (Lote lote : lotes.findAll()) {
            if ("concluido".equals(lote.getSituacao())) continue;
            LocalDate prazo=lote.getPrevisaoConclusao();
            if(prazo==null) continue;
            Empresa empresa=lote.getEmpresa();
            EmpresaPreferencias p=preferencias.findById(empresa.getId())
                .orElse(new EmpresaPreferencias(empresa.getId()));
            String tipo=null;
            if(prazo.isBefore(hoje) && p.isAtraso()) tipo="atraso";
            else if(!prazo.isBefore(hoje) && !prazo.isAfter(hoje.plusDays(2)) && p.isPrazoProximo())
                tipo="prazoProximo";
            if(tipo!=null && !notificacoes.existsByLote_IdAndTipo(lote.getId(),tipo)) {
                String mensagem="atraso".equals(tipo)
                  ? "O lote "+lote.getCodigo()+" está atrasado desde "+prazo+"."
                  : "O prazo do lote "+lote.getCodigo()+" termina em "+prazo+".";
                notificacoes.save(new Notificacao(empresa,lote,tipo,mensagem));
            }
        }
    }
}
