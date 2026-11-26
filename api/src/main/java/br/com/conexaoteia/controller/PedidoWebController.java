package br.com.conexaoteia.controller;

import br.com.conexaoteia.dto.PedidoDTO;
import br.com.conexaoteia.service.PedidoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/pedidos")
public class PedidoWebController {
    private final PedidoService service;
    private static final Set<String> SITUACOES=Set.of("aguardando","em_producao","concluido","atrasado");
    public PedidoWebController(PedidoService service) {this.service=service;}
    public record Entrada(@NotNull Long clienteId,@NotBlank @Size(max=180) String descricao,
        @NotNull @Min(1) Integer quantidadePecas,@NotNull LocalDate dataRecebimento,
        @NotNull LocalDate prazoEntrega,@NotBlank String situacao) {}
    public record Situacao(@NotBlank String situacao) {}
    @PutMapping("/{id}")
    public PedidoDTO atualizar(@PathVariable Long id,@Valid @RequestBody Entrada e,Authentication auth) {
        validar(e.situacao());
        if (e.prazoEntrega().isBefore(e.dataRecebimento())) throw new IllegalArgumentException("Prazo inválido");
        return service.atualizarWeb(id,e.clienteId(),e.descricao(),e.quantidadePecas(),
            e.dataRecebimento(),e.prazoEntrega(),e.situacao(),auth.getName());
    }
    @PatchMapping("/{id}/situacao")
    public PedidoDTO situacao(@PathVariable Long id,@Valid @RequestBody Situacao e,Authentication auth) {
        validar(e.situacao());return service.alterarSituacaoWeb(id,e.situacao(),auth.getName());
    }
    private void validar(String situacao) {
        if(!SITUACOES.contains(situacao))throw new IllegalArgumentException("Situação inválida");
    }
}
