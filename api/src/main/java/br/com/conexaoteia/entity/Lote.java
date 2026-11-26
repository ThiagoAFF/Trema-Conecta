package br.com.conexaoteia.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "lotes")
public class Lote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 36) private String codigo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "empresa_id") private Empresa empresa;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "pedido_id") private Pedido pedido;
    @Column(name = "quantidade_pecas", nullable = false) private int quantidadePecas;
    @Column(name = "etapa_atual", nullable = false, length = 30) private String etapaAtual;
    @Column(name = "data_inicio", nullable = false) private LocalDate dataInicio;
    @Column(name = "previsao_conclusao", nullable = false) private LocalDate previsaoConclusao;
    @Column(nullable = false, length = 20) private String situacao;
    @Column(name = "data_conclusao") private LocalDate dataConclusao;
    protected Lote() {}
    public Lote(String codigo, Empresa empresa, Pedido pedido, int quantidadePecas, String etapaAtual,
                LocalDate dataInicio, LocalDate previsaoConclusao, String situacao) {
        this.codigo = codigo; this.empresa = empresa; this.pedido = pedido; this.quantidadePecas = quantidadePecas;
        this.etapaAtual = etapaAtual; this.dataInicio = dataInicio; this.previsaoConclusao = previsaoConclusao;
        this.situacao = situacao;
        if ("concluido".equals(situacao)) this.dataConclusao = LocalDate.now();
    }
    public void registrarEtapa(String etapa) {
        this.etapaAtual = etapa;
        if ("concluido".equals(etapa)) {this.situacao = "concluido"; this.dataConclusao = LocalDate.now();}
        else if ("atrasado".equals(this.situacao)) this.situacao = "ativo";
    }
    public Long getId() {return id;} public String getCodigo() {return codigo;}
    public Empresa getEmpresa() {return empresa;} public Pedido getPedido() {return pedido;}
    public int getQuantidadePecas() {return quantidadePecas;} public String getEtapaAtual() {return etapaAtual;}
    public LocalDate getDataInicio() {return dataInicio;} public LocalDate getPrevisaoConclusao() {return previsaoConclusao;}
    public String getSituacao() {return situacao;} public LocalDate getDataConclusao() {return dataConclusao;}
}
