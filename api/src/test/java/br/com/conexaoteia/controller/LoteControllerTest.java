package br.com.conexaoteia.controller;

import br.com.conexaoteia.entity.Empresa;
import br.com.conexaoteia.repository.LoteRepository;
import br.com.conexaoteia.repository.PedidoRepository;
import br.com.conexaoteia.service.TenantContext;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class LoteControllerTest {
    @Test void naoPermiteCriarLoteComPedidoDeOutraEmpresa() {
        LoteRepository lotes=mock(LoteRepository.class);
        PedidoRepository pedidos=mock(PedidoRepository.class);
        TenantContext tenant=mock(TenantContext.class);
        Authentication auth=mock(Authentication.class);
        Empresa empresa=new Empresa("Empresa","11222333000181",null,null);
        org.springframework.test.util.ReflectionTestUtils.setField(empresa,"id",17L);
        when(auth.getName()).thenReturn("admin@empresa.com");
        when(tenant.empresa("admin@empresa.com")).thenReturn(empresa);
        when(pedidos.findByIdAndEmpresa_Id(999L,17L)).thenReturn(Optional.empty());
        LoteController controller=new LoteController(lotes,pedidos,tenant);
        var entrada=new LoteController.Entrada(999L,100,"corte",LocalDate.now(),
            LocalDate.now().plusDays(4),"ativo");
        assertThrows(IllegalArgumentException.class,()->controller.criar(entrada,auth));
        verify(pedidos).findByIdAndEmpresa_Id(999L,17L);
        verify(lotes,never()).saveAndFlush(any());
    }
}
