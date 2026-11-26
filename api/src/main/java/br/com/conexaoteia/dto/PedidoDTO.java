package br.com.conexaoteia.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import br.com.conexaoteia.entity.Pedido;
import br.com.conexaoteia.entity.PedidoItem;
import br.com.conexaoteia.entity.StatusPedido;
public record PedidoDTO(Long id,String codigo,Long clienteId,String clienteNome,LocalDateTime dataCriacao,
        LocalDate prazoEntrega,StatusPedido status,String observacoes,boolean atrasado,List<ItemDTO> itens,
        String descricao,Integer quantidadePecas,String situacao,LocalDate dataRecebimento) {
    public record ItemDTO(Long id,String descricao,Integer quantidade) {
        public static ItemDTO de(PedidoItem item){return new ItemDTO(item.getId(),item.getDescricao(),item.getQuantidade());}
    }
    public static PedidoDTO de(Pedido pedido){
        return new PedidoDTO(pedido.getId(),pedido.getCodigo(),pedido.getCliente().getId(),pedido.getCliente().getNome(),
            pedido.getDataCriacao(),pedido.getPrazoEntrega(),pedido.getStatus(),pedido.getObservacoes(),
            pedido.getStatus()==StatusPedido.ABERTO && pedido.getPrazoEntrega().isBefore(LocalDate.now()),
            pedido.getItens().stream().map(ItemDTO::de).toList(),
            pedido.getItens().stream().map(PedidoItem::getDescricao).reduce((a,b)->a+"; "+b).orElse(""),
            pedido.getItens().stream().mapToInt(PedidoItem::getQuantidade).sum(),
            pedido.getSituacaoWeb()!=null ? pedido.getSituacaoWeb() :
                (pedido.getStatus()==StatusPedido.ENTREGUE ? "concluido" :
                 pedido.getPrazoEntrega().isBefore(LocalDate.now()) ? "atrasado" : "aguardando"),
            pedido.getDataRecebimento()!=null ? pedido.getDataRecebimento() : pedido.getDataCriacao().toLocalDate());
    }
}
