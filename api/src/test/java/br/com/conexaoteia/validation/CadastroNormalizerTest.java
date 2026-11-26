
package br.com.conexaoteia.validation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CadastroNormalizerTest {

    @Test
    void deveRemoverPontuacaoDoCnpj() {
        String resultado = CadastroNormalizer
                .normalizarCnpj("11.222.333/0001-81");

        assertEquals("11222333000181", resultado);
    }

    @Test
    void deveNormalizarEmailMaiusculo() {
        String resultado = CadastroNormalizer
                .normalizarEmail("ADMIN@EMPRESA.COM");

        assertEquals("admin@empresa.com", resultado);
    }

    @Test
    void deveRemoverEspacosDoEmail() {
        String resultado = CadastroNormalizer
                .normalizarEmail("  admin@empresa.com  ");

        assertEquals("admin@empresa.com", resultado);
    }

    @Test
    void deveAceitarCnpjNulo() {
        assertNull(CadastroNormalizer.normalizarCnpj(null));
    }

    @Test
    void deveAceitarEmailNulo() {
        assertNull(CadastroNormalizer.normalizarEmail(null));
    }
}
