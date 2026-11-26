
package br.com.conexaoteia.config;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JwtCsrfIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    private String gerarTokenValido() {
        Instant agora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("trama-conecta")
                .subject("teste-csrf@exemplo.com")
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(300))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256)
                .build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }

    @Test
    void deveAceitarJwtValido() throws Exception {
        mockMvc.perform(
                get("/auth/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + gerarTokenValido()
                        )
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email")
                .value("teste-csrf@exemplo.com"));
    }



    @Test
    void deveProcessarJwtBearerSemCsrfDeCookie() throws Exception {
        mockMvc.perform(
                post("/clientes")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + gerarTokenValido()
                        )
                        .contentType("application/json")
                        .content("{}")
        ).andExpect(status().isBadRequest());
    }



    @Test
    void deveAceitarJwtComCsrfValido() throws Exception {
        mockMvc.perform(
                post("/auth/me")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + gerarTokenValido()
                        )
                        .with(csrf())
        ).andExpect(status().isMethodNotAllowed());
    }
}
