
package br.com.conexaoteia.validation;

import br.com.conexaoteia.validation.CnpjValidator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CnpjValidatorTest {

    @Test
    void deveAceitarCnpjValido() {
        assertTrue(CnpjValidator.isValid(
                "11.222.333/0001-81"
        ));
    }

    @Test
    void deveRejeitarCnpjInvalido() {
        assertFalse(CnpjValidator.isValid(
                "12.345.678/0001-00"
        ));
    }

    @Test
    void deveRejeitarCnpjComDigitosRepetidos() {
        assertFalse(CnpjValidator.isValid(
                "11.111.111/1111-11"
        ));
    }

    @Test
    void deveRejeitarCnpjNulo() {
        assertFalse(CnpjValidator.isValid(null));
    }
}
