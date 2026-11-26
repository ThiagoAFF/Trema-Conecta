
package br.com.conexaoteia.controller;

import br.com.conexaoteia.dto.CadastroUsuarioEntrada;
import br.com.conexaoteia.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Long>> cadastrar(
            @Valid @RequestBody CadastroUsuarioEntrada entrada,
            Authentication authentication) {

        String emailAutenticado = authentication.getName();

        Long id = usuarioService.cadastrar(
                entrada,
                emailAutenticado
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("id", id));
    }
}
