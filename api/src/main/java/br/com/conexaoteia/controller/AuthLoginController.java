
package br.com.conexaoteia.controller;

import java.time.Instant;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.conexaoteia.service.JwtCookieService;

@RestController
@RequestMapping("/auth")
public class AuthLoginController {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final JwtCookieService jwtCookieService;

    public AuthLoginController(
            AuthenticationManager authenticationManager,
            JwtEncoder jwtEncoder,
            JwtCookieService jwtCookieService) {

        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.jwtCookieService = jwtCookieService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        if (request.email() == null
                || request.senha() == null
                || request.email().isBlank()
                || request.senha().isBlank()) {

            throw new BadCredentialsException(
                    "Credenciais inválidas"
            );
        }

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.email().trim(),
                                request.senha()
                        )
                );

        Instant agora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("trama-conecta")
                .subject(authentication.getName())
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(1800))
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();

        LoginResponse resposta = new LoginResponse(
                "Autenticação realizada com sucesso",
                token,
                "Bearer",
                1800
        );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        jwtCookieService.criarCookie(token).toString()
                )
                .body(resposta);
    }

    public record LoginRequest(
            String email,
            String senha
    ) {}

    public record LoginResponse(
            String mensagem,
            String accessToken,
            String tokenType,
            int expiresIn
    ) {}
}
