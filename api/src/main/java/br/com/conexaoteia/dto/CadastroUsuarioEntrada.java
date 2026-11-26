
package br.com.conexaoteia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroUsuarioEntrada(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "O e-mail deve ser válido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min=8,message="Senha deve ter ao menos 8 caracteres")
        String senha,

        // É permitido informar perfilId ou o nome do perfil.
        Long perfilId,
        String telefone,
        String status,
        String perfil

) {
    public CadastroUsuarioEntrada(String nome, String email, String senha, Long perfilId) {
        this(nome, email, senha, perfilId, null, null, null);
    }
}
