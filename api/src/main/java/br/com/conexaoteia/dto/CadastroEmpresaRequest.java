
package br.com.conexaoteia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroEmpresaRequest(

        @NotBlank(message = "Nome da empresa é obrigatório")
        String nomeEmpresa,

        @NotBlank(message = "CNPJ é obrigatório")
        String cnpj,

        @Email(message = "E-mail da empresa inválido")
        String emailEmpresa,

        String telefoneEmpresa,

        @NotBlank(message = "Nome do administrador é obrigatório")
        String nomeAdministrador,

        @NotBlank(message = "E-mail do administrador é obrigatório")
        @Email(message = "E-mail do administrador inválido")
        String emailAdministrador,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String senhaAdministrador

) {}
