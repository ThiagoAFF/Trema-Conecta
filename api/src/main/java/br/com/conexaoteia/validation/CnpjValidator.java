
package br.com.conexaoteia.validation;

public final class CnpjValidator {

    private CnpjValidator() {
    }

    public static boolean isValid(String cnpj) {

        if (cnpj == null) {
            return false;
        }

        String numeros = cnpj.replaceAll("\\D", "");

        if (numeros.length() != 14) {
            return false;
        }

        if (numeros.matches("(\\d)\\1{13}")) {
            return false;
        }

        int[] pesosPrimeiro = {
                5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
        };

        int[] pesosSegundo = {
                6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
        };

        int primeiroDigito = calcularDigito(
                numeros.substring(0, 12),
                pesosPrimeiro
        );

        int segundoDigito = calcularDigito(
                numeros.substring(0, 12) + primeiroDigito,
                pesosSegundo
        );

        return primeiroDigito ==
                Character.getNumericValue(numeros.charAt(12))
                && segundoDigito ==
                Character.getNumericValue(numeros.charAt(13));
    }

    private static int calcularDigito(
            String numeros, int[] pesos) {

        int soma = 0;

        for (int i = 0; i < pesos.length; i++) {
            soma += Character.getNumericValue(
                    numeros.charAt(i)
            ) * pesos[i];
        }

        int resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }
}
