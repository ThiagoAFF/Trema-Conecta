package br.com.conexaoteia.entity;
import jakarta.persistence.*;
@Entity @Table(name="pedido_itens")
public class PedidoItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="pedido_id") private Pedido pedido;
    @Column(nullable=false,length=180) private String descricao;
    @Column(nullable=false) private Integer quantidade;
    protected PedidoItem() {}
    public PedidoItem(Pedido pedido,String descricao,int quantidade){this.pedido=pedido;this.descricao=descricao;this.quantidade=quantidade;}
    public Long getId(){return id;}public String getDescricao(){return descricao;} public Integer getQuantidade(){return quantidade;}
}
