
package br.com.conexaoteia.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CookieAuthIsolationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveRejeitarCookieSemAutenticacaoAtivada()
            throws Exception {

        MockCookie cookie = new MockCookie(
                "trama_auth",
                "token-invalido"
        );

        mockMvc.perform(
                get("/auth/me").cookie(cookie)
        ).andExpect(status().isUnauthorized());
    }

    @Test
    void deveRejeitarTokenBearerInvalido()
            throws Exception {

        mockMvc.perform(
                get("/auth/me")
                    .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer token-invalido"
                    )
        ).andExpect(status().isUnauthorized());
    }

    @Test
    void deveBloquearClientesSemAutenticacao()
            throws Exception {

        mockMvc.perform(
                get("/clientes")
        ).andExpect(status().isUnauthorized());
    }
}
