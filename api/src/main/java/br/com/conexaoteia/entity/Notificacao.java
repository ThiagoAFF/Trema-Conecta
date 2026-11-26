package br.com.conexaoteia.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "notificacoes")
public class Notificacao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "empresa_id") private Empresa empresa;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "lote_id") private Lote lote;
    @Column(nullable = false, length = 30) private String tipo;
    @Column(nullable = false, length = 500) private String descricao;
    @Column(name = "data_hora", nullable = false) private LocalDateTime dataHora;
    @Column(nullable = false) private boolean lida = false;
    protected Notificacao() {}
    public Notificacao(Empresa empresa, Lote lote, String tipo, String descricao) {
        this.empresa = empresa; this.lote = lote; this.tipo = tipo; this.descricao = descricao;
        this.dataHora = LocalDateTime.now();
    }
    public void marcarLida() {this.lida = true;}
    public Long getId() {return id;} public Empresa getEmpresa() {return empresa;}
    public Lote getLote() {return lote;} public String getTipo() {return tipo;}
    public String getDescricao() {return descricao;} public LocalDateTime getDataHora() {return dataHora;}
    public boolean isLida() {return lida;}
}
