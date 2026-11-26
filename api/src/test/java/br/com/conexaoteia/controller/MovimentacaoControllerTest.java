package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.Empresa;
import br.com.conexaoteia.repository.*;
import br.com.conexaoteia.service.TenantContext;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class MovimentacaoControllerTest {
    @Test void naoRegistraMovimentacaoDeLoteDeOutraEmpresa() {
        MovimentacaoRepository movs=mock(MovimentacaoRepository.class);
        LoteRepository lotes=mock(LoteRepository.class);
        NotificacaoRepository notificacoes=mock(NotificacaoRepository.class);
        EmpresaPreferenciasRepository prefs=mock(EmpresaPreferenciasRepository.class);
        TenantContext tenant=mock(TenantContext.class);
        Authentication auth=mock(Authentication.class);
        Empresa empresa=new Empresa("Empresa","11222333000181",null,null);
        org.springframework.test.util.ReflectionTestUtils.setField(empresa,"id",5L);
        when(auth.getName()).thenReturn("admin@empresa.com");
        when(tenant.empresa("admin@empresa.com")).thenReturn(empresa);
        when(lotes.findByIdAndEmpresa_Id(66L,5L)).thenReturn(Optional.empty());
        MovimentacaoController controller=new MovimentacaoController(movs,lotes,notificacoes,tenant,prefs);
        var entrada=new MovimentacaoController.Entrada(66L,"corte","Ana",Instant.now(),30,1,null);
        assertThrows(org.springframework.web.server.ResponseStatusException.class,()->controller.criar(entrada,auth));
        verify(lotes).findByIdAndEmpresa_Id(66L,5L);
        verify(movs,never()).saveAndFlush(any());
    }
}
