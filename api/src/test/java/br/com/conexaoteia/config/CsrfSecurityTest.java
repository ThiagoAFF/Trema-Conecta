
package br.com.conexaoteia.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CsrfSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void devePermitirConsultarTokenCsrf() throws Exception {
        mockMvc.perform(get("/auth/csrf"))
                .andExpect(status().isOk());
    }

    @Test
    void deveBloquearPostSemTokenCsrf() throws Exception {
        mockMvc.perform(
                post("/clientes")
                    .contentType("application/json")
                    .content("{}")
        ).andExpect(status().isForbidden());
    }

    @Test
    void deveRejeitarPostComTokenCsrfInvalido() throws Exception {
        mockMvc.perform(
                post("/clientes")
                    .header("X-XSRF-TOKEN", "token-invalido")
                    .contentType("application/json")
                    .content("{}")
        ).andExpect(status().isForbidden());
    }

    @Test
    void deveAceitarCsrfMasExigirAutenticacao() throws Exception {
        mockMvc.perform(
                post("/clientes")
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType("application/json")
                    .content("{}")
        ).andExpect(status().isUnauthorized());
    }
}
