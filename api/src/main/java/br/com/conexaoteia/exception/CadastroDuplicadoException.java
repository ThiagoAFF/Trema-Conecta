
package br.com.conexaoteia.exception;

public class CadastroDuplicadoException
        extends RuntimeException {

    public CadastroDuplicadoException(String mensagem) {
        super(mensagem);
    }
}