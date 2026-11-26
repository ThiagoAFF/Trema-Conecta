package br.com.conexaoteia.controller;

import br.com.conexaoteia.dto.CadastroEmpresaEntrada;
import br.com.conexaoteia.dto.EmpresaDTO;
import br.com.conexaoteia.entity.Empresa;
import br.com.conexaoteia.service.CadastroEmpresaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/empresas")
public class EmpresaController {
    private final CadastroEmpresaService service;

    public EmpresaController(CadastroEmpresaService service) {
        this.service = service;
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public EmpresaDTO cadastrar(@Valid @RequestBody CadastroEmpresaEntrada entrada) {
        Empresa empresa = service.cadastrar(entrada);
        return new EmpresaDTO(empresa.getId(), empresa.getNome(), empresa.getCnpj(),
                empresa.getEmail(), empresa.getTelefone());
    }
}
