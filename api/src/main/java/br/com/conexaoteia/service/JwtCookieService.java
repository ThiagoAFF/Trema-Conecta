
package br.com.conexaoteia.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class JwtCookieService {

    private static final String NOME_COOKIE = "trama_auth";
    private static final long DURACAO_SEGUNDOS = 1800;

    private final boolean cookieSecure;

    public JwtCookieService(
            @Value("${app.auth.cookie-secure:false}")
            boolean cookieSecure
    ) {
        this.cookieSecure = cookieSecure;
    }

    public ResponseCookie criarCookie(String token) {
        return ResponseCookie.from(NOME_COOKIE, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(DURACAO_SEGUNDOS)
                .build();
    }

    public ResponseCookie removerCookie() {
        return ResponseCookie.from(NOME_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
    }
}
