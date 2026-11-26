package br.com.conexaoteia.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity @Table(name = "pedidos")
public class Pedido {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 36) private String codigo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="empresa_id") private Empresa empresa;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="cliente_id") private Clientes cliente;
    @Column(name="data_criacao", nullable = false) private LocalDateTime dataCriacao;
    @Column(name="prazo_entrega", nullable = false) private LocalDate prazoEntrega;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length=20) private StatusPedido status;
    @Column(length=1000) private String observacoes;
    @Column(name="data_recebimento") private LocalDate dataRecebimento;
    @Column(name="situacao_web",length=20) private String situacaoWeb;
    @OneToMany(mappedBy="pedido", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<PedidoItem> itens = new ArrayList<>();
    protected Pedido() {}
    public Pedido(String codigo, Empresa empresa, Clientes cliente, LocalDate prazoEntrega, String observacoes) {
        this.codigo=codigo; this.empresa=empresa;this.cliente=cliente;this.prazoEntrega=prazoEntrega;
        this.observacoes=observacoes;this.status=StatusPedido.ABERTO;this.dataCriacao=LocalDateTime.now();
        this.dataRecebimento=LocalDate.now();this.situacaoWeb="aguardando";
    }
    public void atualizarWeb(Clientes cliente,String descricao,int quantidade,LocalDate dataRecebimento,
                             LocalDate prazoEntrega,String situacao) {
        if (this.itens.size() > 1) throw new IllegalArgumentException(
            "Pedido com múltiplos itens: use a API original para preservá-los");
        this.cliente=cliente;this.prazoEntrega=prazoEntrega;this.dataRecebimento=dataRecebimento;
        this.situacaoWeb=situacao;this.itens.clear();this.adicionarItem(descricao,quantidade);
    }
    public void definirSituacaoWeb(String situacao) {this.situacaoWeb=situacao;}
    public void definirDataRecebimento(LocalDate data) {this.dataRecebimento=data;}
    public LocalDate getDataRecebimento() {return dataRecebimento;}
    public String getSituacaoWeb() {return situacaoWeb;}
    public void adicionarItem(String descricao,int quantidade){itens.add(new PedidoItem(this,descricao,quantidade));}
    public void alterarStatus(StatusPedido novo){this.status=novo;}
    public Long getId(){return id;} public String getCodigo(){return codigo;}
    public Empresa getEmpresa(){return empresa;} public Clientes getCliente(){return cliente;}
    public LocalDateTime getDataCriacao(){return dataCriacao;} public LocalDate getPrazoEntrega(){return prazoEntrega;}
    public StatusPedido getStatus(){return status;} public String getObservacoes(){return observacoes;}
    public List<PedidoItem> getItens(){return itens;}
}
