package br.com.conexaoteia.dto;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
public record PedidoRequest(
    @NotNull Long clienteId,
    @NotNull LocalDate prazoEntrega,
    @Size(max=1000) String observacoes,
    @NotEmpty @Size(max=80) List<@NotNull @Valid ItemRequest> itens,
    String situacao,
    LocalDate dataRecebimento
) {
    public PedidoRequest(Long clienteId,LocalDate prazoEntrega,String observacoes,List<ItemRequest> itens) {
        this(clienteId,prazoEntrega,observacoes,itens,null,null);
    }
    public record ItemRequest(@NotBlank @Size(max=180) String descricao,@NotNull @Min(1) @Max(1000000) Integer quantidade){}
}
