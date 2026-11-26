
package br.com.conexaoteia.validation;

import java.util.Locale;

public final class CadastroNormalizer {

    private CadastroNormalizer() {
    }

    public static String normalizarCnpj(String cnpj) {
        if (cnpj == null) {
            return null;
        }

        return cnpj.replaceAll("[.\\-/\\s]", "")
                .toUpperCase(Locale.ROOT);
    }

    public static String normalizarEmail(String email) {
        if (email == null) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
