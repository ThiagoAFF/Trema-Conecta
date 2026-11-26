package br.com.conexaoteia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "movimentacoes")
public class Movimentacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "empresa_id") private Empresa empresa;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "lote_id") private Lote lote;
    @Column(nullable = false, length = 30) private String etapa;
    @Column(nullable = false, length = 120) private String responsavel;
    @Column(name = "data_hora", nullable = false) private LocalDateTime dataHora;
    @Column(nullable = false) private int aprovadas;
    @Column(nullable = false) private int defeitos;
    @Column(length = 1000) private String observacoes;
    protected Movimentacao() {}
    public Movimentacao(Empresa empresa, Lote lote, String etapa, String responsavel, LocalDateTime dataHora,
                       int aprovadas, int defeitos, String observacoes) {
        this.empresa = empresa; this.lote = lote; this.etapa = etapa; this.responsavel = responsavel;
        this.dataHora = dataHora; this.aprovadas = aprovadas; this.defeitos = defeitos; this.observacoes = observacoes;
    }
    public Long getId() {return id;} public Empresa getEmpresa() {return empresa;}
    public Lote getLote() {return lote;} public String getEtapa() {return etapa;}
    public String getResponsavel() {return responsavel;} public LocalDateTime getDataHora() {return dataHora;}
    public int getAprovadas() {return aprovadas;} public int getDefeitos() {return defeitos;}
    public String getObservacoes() {return observacoes;}
}
