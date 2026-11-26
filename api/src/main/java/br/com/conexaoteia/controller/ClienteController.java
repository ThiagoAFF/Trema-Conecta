package br.com.conexaoteia.controller;

import br.com.conexaoteia.dto.ClienteDTO;
import br.com.conexaoteia.dto.ClienteRequest;
import br.com.conexaoteia.mapper.ClienteMapper;
import br.com.conexaoteia.service.ClienteService;
import br.com.conexaoteia.repository.PedidoRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/clientes")
public class ClienteController {
    private final ClienteService service;
    private final PedidoRepository pedidos;

    public ClienteController(ClienteService service, PedidoRepository pedidos) {
        this.service = service; this.pedidos = pedidos;
    }

    @GetMapping("/{id}")
    public ClienteDTO buscarPorId(@PathVariable Long id, Authentication authentication) {
        return ClienteMapper.paraDTO(service.buscarPorId(id, authentication.getName()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteDTO criar(@Valid @RequestBody ClienteRequest request, Authentication authentication) {
        return ClienteMapper.paraDTO(service.criar(request, authentication.getName()));
    }

    @GetMapping
    public List<ClienteDTO> listar(Authentication authentication) {
        var registros = service.listar(authentication.getName());
        if (registros.isEmpty()) return java.util.List.of();
        Long empresaId = registros.get(0).getEmpresa().getId();
        java.util.Map<Long,Long> totais = new java.util.HashMap<>();
        for (Object[] linha : pedidos.contarPedidosPorCliente(empresaId)) {
            totais.put((Long) linha[0], (Long) linha[1]);
        }
        return registros.stream().map(c -> ClienteMapper.paraDTO(c)
            .comTotalPedidos(totais.getOrDefault(c.getId(), 0L))).toList();
    }

    @PutMapping("/{id}")
    public ClienteDTO atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest request,
                               Authentication authentication) {
        return ClienteMapper.paraDTO(service.atualizar(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, Authentication authentication) {
        service.excluir(id, authentication.getName());
    }
}
