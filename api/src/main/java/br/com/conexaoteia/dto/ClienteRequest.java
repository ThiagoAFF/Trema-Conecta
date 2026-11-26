package br.com.conexaoteia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max=120) String nome,
        @NotBlank(message = "Telefone é obrigatório")
        @Size(max=20) String telefone,
        @NotBlank(message = "Email é obrigatório")
        @Email
        @Size(max=150) String email,
        @Size(max=18) String documento,
        @Size(max=120) String cidade,
        @Size(max=2) String estado,
        @Size(max=1000) String observacoes
) {
    public ClienteRequest(String nome, String telefone, String email) {
        this(nome, telefone, email, null, null, null, null);
    }
}