package br.com.conexaoteia.service;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.conexaoteia.dto.PedidoDTO;
import br.com.conexaoteia.dto.PedidoRequest;
import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;

@Service
public class PedidoService {
    private final PedidoRepository pedidos;private final ClienteRepository clientes;private final UsuarioRepository usuarios;
    public PedidoService(PedidoRepository pedidos,ClienteRepository clientes,UsuarioRepository usuarios){
        this.pedidos=pedidos;this.clientes=clientes;this.usuarios=usuarios;
    }
    private Usuario usuario(String email){return usuarios.findByEmail(email)
        .orElseThrow(()->new AccessDeniedException("Usuário não encontrado"));}
    @Transactional(readOnly=true)
    public List<PedidoDTO> listar(String email){Long empresaId=usuario(email).getEmpresa().getId();
        return pedidos.findAllByEmpresa_IdOrderByDataCriacaoDesc(empresaId).stream().map(PedidoDTO::de).toList();}
    @Transactional(readOnly=true)
    public PedidoDTO buscar(Long id,String email){return PedidoDTO.de(buscarPedido(id,email));}
    private Pedido buscarPedido(Long id,String email){Long empresaId=usuario(email).getEmpresa().getId();
        return pedidos.findByIdAndEmpresa_Id(id,empresaId)
            .orElseThrow(()->new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND,"Pedido não encontrado"));}
    @Transactional
    public PedidoDTO criar(PedidoRequest entrada,String email){
        Usuario usuario=usuario(email);Long empresaId=usuario.getEmpresa().getId();
        Clientes cliente=clientes.findByIdAndEmpresa_Id(entrada.clienteId(),empresaId)
            .orElseThrow(()->new IllegalArgumentException("Cliente inválido para esta empresa"));
        Pedido pedido=new Pedido(UUID.randomUUID().toString(),usuario.getEmpresa(),cliente,
            entrada.prazoEntrega(),entrada.observacoes()==null?null:entrada.observacoes().trim());
        if (entrada.situacao()!=null) {
            if(!java.util.Set.of("aguardando","em_producao","concluido","atrasado").contains(entrada.situacao()))
                throw new IllegalArgumentException("Situação inválida");
            pedido.definirSituacaoWeb(entrada.situacao());
        }
        if (entrada.dataRecebimento()!=null) pedido.definirDataRecebimento(entrada.dataRecebimento());
        if (pedido.getPrazoEntrega().isBefore(pedido.getDataRecebimento()))
            throw new IllegalArgumentException("Prazo inválido");
        for(PedidoRequest.ItemRequest item:entrada.itens()){
            pedido.adicionarItem(item.descricao().trim(),item.quantidade());
        }
        return PedidoDTO.de(pedidos.saveAndFlush(pedido));
    }
    @Transactional
    public PedidoDTO mudarStatus(Long id,StatusPedido status,String email){
        Pedido pedido=buscarPedido(id,email);
        if(pedido.getStatus()!=StatusPedido.ABERTO) throw new IllegalArgumentException("Pedido concluído ou cancelado não pode mudar de status");
        if(status==StatusPedido.ABERTO) throw new IllegalArgumentException("Selecione ENTREGUE ou CANCELADO");
        pedido.alterarStatus(status);
        return PedidoDTO.de(pedido);
    }
    @Transactional
    public PedidoDTO atualizarWeb(Long id, Long clienteId, String descricao, int quantidade,
                                  java.time.LocalDate recebimento, java.time.LocalDate prazo,
                                  String situacao, String email) {
        Pedido pedido = buscarPedido(id,email);
        Long empresaId = pedido.getEmpresa().getId();
        Clientes cliente = clientes.findByIdAndEmpresa_Id(clienteId,empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente inválido"));
        pedido.atualizarWeb(cliente, descricao, quantidade, recebimento, prazo, situacao);
        return PedidoDTO.de(pedidos.saveAndFlush(pedido));
    }
    @Transactional
    public PedidoDTO alterarSituacaoWeb(Long id, String situacao, String email) {
        Pedido pedido = buscarPedido(id,email);
        pedido.definirSituacaoWeb(situacao);
        return PedidoDTO.de(pedido);
    }
}
