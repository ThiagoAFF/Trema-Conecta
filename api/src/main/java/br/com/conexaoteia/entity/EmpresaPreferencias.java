package br.com.conexaoteia.entity;

import jakarta.persistence.*;

@Entity @Table(name = "empresa_preferencias")
public class EmpresaPreferencias {
    @Id @Column(name = "empresa_id") private Long empresaId;
    @Column(name = "mudanca_etapa", nullable = false) private boolean mudancaEtapa = true;
    @Column(name = "lote_concluido", nullable = false) private boolean loteConcluido = true;
    @Column(name = "prazo_proximo", nullable = false) private boolean prazoProximo = true;
    @Column(nullable = false) private boolean atraso = true;
    @Column(name = "nova_movimentacao", nullable = false) private boolean novaMovimentacao = false;
    protected EmpresaPreferencias() {}
    public EmpresaPreferencias(Long empresaId) {this.empresaId = empresaId;}
    public void atualizar(boolean mudancaEtapa, boolean loteConcluido, boolean prazoProximo,
                         boolean atraso, boolean novaMovimentacao) {
        this.mudancaEtapa = mudancaEtapa; this.loteConcluido = loteConcluido;
        this.prazoProximo = prazoProximo; this.atraso = atraso; this.novaMovimentacao = novaMovimentacao;
    }
    public Long getEmpresaId() {return empresaId;} public boolean isMudancaEtapa() {return mudancaEtapa;}
    public boolean isLoteConcluido() {return loteConcluido;} public boolean isPrazoProximo() {return prazoProximo;}
    public boolean isAtraso() {return atraso;} public boolean isNovaMovimentacao() {return novaMovimentacao;}
}
