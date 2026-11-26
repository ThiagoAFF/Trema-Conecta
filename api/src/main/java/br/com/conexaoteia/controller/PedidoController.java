package br.com.conexaoteia.controller;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import br.com.conexaoteia.dto.*;
import br.com.conexaoteia.entity.StatusPedido;
import br.com.conexaoteia.service.PedidoService;
@RestController @RequestMapping("/pedidos")
public class PedidoController {
    private final PedidoService service;
    public PedidoController(PedidoService service){this.service=service;}
    @GetMapping public List<PedidoDTO> listar(Authentication auth){return service.listar(auth.getName());}
    @GetMapping("/{id}") public PedidoDTO buscar(@PathVariable Long id,Authentication auth){return service.buscar(id,auth.getName());}
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public PedidoDTO criar(@Valid @RequestBody PedidoRequest entrada,Authentication auth){return service.criar(entrada,auth.getName());}
    @PatchMapping("/{id}/status") public PedidoDTO alterarStatus(@PathVariable Long id,
        @RequestBody @Valid StatusRequest entrada,Authentication auth){return service.mudarStatus(id,entrada.status(),auth.getName());}
    public record StatusRequest(@jakarta.validation.constraints.NotNull StatusPedido status){}
}
