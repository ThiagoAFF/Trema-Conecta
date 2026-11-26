package br.com.conexaoteia.dto;

public record EmpresaDTO(
        Long id,
        String nome,
        String cnpj,
        String email,
        String telefone
) { }
