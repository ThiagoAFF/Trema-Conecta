
package br.com.conexaoteia.config;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

@SpringBootTest
class JwtConfigTest {

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Test
    void deveGerarEValidarTokenJwt() {

        Instant agora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("trama-conecta")
                .subject("admin@exemplo.com")
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(3600))
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();

        Jwt validado = jwtDecoder.decode(token);

        assertEquals(
                "admin@exemplo.com",
                validado.getSubject()
        );
    }

    @Test
    void deveRejeitarEmissorDesconhecido() {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("outra-aplicacao")
                .subject("admin@exemplo.com")
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(300))
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        assertThrows(org.springframework.security.oauth2.jwt.JwtException.class,
                () -> jwtDecoder.decode(token));
    }
}
