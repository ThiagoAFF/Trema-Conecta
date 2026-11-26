
package br.com.conexaoteia.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CadastroDuplicadoException.class)
    public ResponseEntity<Map<String, String>> tratarCadastroDuplicado(
            CadastroDuplicadoException exception) {

        Map<String, String> resposta = Map.of(
                "erro", "CONFLITO_CADASTRO",
                "mensagem", exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(resposta);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarArgumentoInvalido(
            IllegalArgumentException exception) {

        Map<String, String> resposta = Map.of(
                "erro", "DADOS_INVALIDOS",
                "mensagem", exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(resposta);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> tratarValidacao(
            MethodArgumentNotValidException exception) {

        Map<String, String> campos = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(erro -> campos.put(
                        erro.getField(),
                        erro.getDefaultMessage()
                ));

        Map<String, Object> resposta = Map.of(
                "erro", "DADOS_INVALIDOS",
                "mensagem", "Existem campos inválidos",
                "campos", campos
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(resposta);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarIntegridade(
            DataIntegrityViolationException exception) {

        Throwable causa = exception;

        while (causa != null) {

            if (causa instanceof org.hibernate.exception.ConstraintViolationException violacao
                    && "cnpj".equalsIgnoreCase(violacao.getConstraintName())) {

                Map<String, String> resposta = Map.of(
                        "erro", "CONFLITO_CADASTRO",
                        "mensagem", "CNPJ já cadastrado."
                );

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(resposta);
            }

            causa = causa.getCause();
        }

        Map<String, String> resposta = Map.of(
                "erro", "CONFLITO_INTEGRIDADE",
                "mensagem", "Este registro está vinculado a outros dados ou viola uma restrição de cadastro."
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(resposta);
    }
}
