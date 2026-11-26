
package br.com.conexaoteia.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveBloquearAcessoSemAutenticacao() throws Exception {

        mockMvc.perform(get("/clientes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveBloquearAcessoComCredenciaisInvalidas() throws Exception {

        mockMvc.perform(
                get("/clientes")
                        .with(httpBasic(
                                "usuario-inexistente@exemplo.invalid",
                                "senha-incorreta"
                        ))
        ).andExpect(status().isUnauthorized());
    }
}
