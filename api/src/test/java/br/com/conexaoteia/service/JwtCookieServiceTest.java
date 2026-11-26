
package br.com.conexaoteia.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

class JwtCookieServiceTest {

    @Test
    void deveCriarCookieProtegido() {
        JwtCookieService service = new JwtCookieService(true);

        ResponseCookie cookie = service.criarCookie("token-teste");

        assertEquals("trama_auth", cookie.getName());
        assertEquals("token-teste", cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
        assertEquals("Strict", cookie.getSameSite());
        assertEquals("/", cookie.getPath());
        assertEquals(1800, cookie.getMaxAge().getSeconds());
    }

    @Test
    void devePermitirCookieLocalSemHttps() {
        JwtCookieService service = new JwtCookieService(false);

        ResponseCookie cookie = service.criarCookie("token-teste");

        assertTrue(cookie.isHttpOnly());
        assertFalse(cookie.isSecure());
    }

    @Test
    void deveRemoverCookieAoSair() {
        JwtCookieService service = new JwtCookieService(true);

        ResponseCookie cookie = service.removerCookie();

        assertEquals("trama_auth", cookie.getName());
        assertEquals("", cookie.getValue());
        assertEquals(0, cookie.getMaxAge().getSeconds());
        assertTrue(cookie.isHttpOnly());
        assertTrue(cookie.isSecure());
    }
}
