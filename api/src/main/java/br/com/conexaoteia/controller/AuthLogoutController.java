package br.com.conexaoteia.controller;

import br.com.conexaoteia.service.JwtCookieService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthLogoutController {
    private final JwtCookieService cookies;
    public AuthLogoutController(JwtCookieService cookies) { this.cookies = cookies; }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookies.removerCookie().toString())
                .build();
    }
}
