package br.com.conexaoteia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroEmpresaEntrada(
        @NotBlank(message = "Nome da empresa é obrigatório")
        @Size(max = 150)
        String nomeEmpresa,
        @NotBlank(message = "CNPJ é obrigatório")
        String cnpj,
        @Email(message = "E-mail da empresa inválido")
        @Size(max = 150)
        String emailEmpresa,
        @Size(max = 20)
        String telefoneEmpresa,
        @NotBlank(message = "Nome do administrador é obrigatório")
        @Size(max = 120)
        String nomeAdministrador,
        @NotBlank(message = "E-mail do administrador é obrigatório")
        @Email(message = "E-mail do administrador inválido")
        @Size(max = 150)
        String emailAdministrador,
        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String senhaAdministrador,
        String cidade,
        String estado,
        String responsavel
) {
    public CadastroEmpresaEntrada(String nomeEmpresa,String cnpj,String emailEmpresa,String telefoneEmpresa,
            String nomeAdministrador,String emailAdministrador,String senhaAdministrador) {
        this(nomeEmpresa,cnpj,emailEmpresa,telefoneEmpresa,nomeAdministrador,emailAdministrador,senhaAdministrador,null,null,null);
    }
}
