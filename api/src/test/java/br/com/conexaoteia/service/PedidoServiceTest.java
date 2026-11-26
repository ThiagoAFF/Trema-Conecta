package br.com.conexaoteia.service;
import br.com.conexaoteia.dto.PedidoRequest;
import br.com.conexaoteia.entity.*;
import br.com.conexaoteia.repository.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
class PedidoServiceTest {
    PedidoRepository pedidos=mock(PedidoRepository.class);
    ClienteRepository clientes=mock(ClienteRepository.class);
    UsuarioRepository usuarios=mock(UsuarioRepository.class);
    PedidoService service=new PedidoService(pedidos,clientes,usuarios);
    @BeforeEach void preparar(){
        Empresa empresa=new Empresa("Fábrica 1","12345678000100",null,null);
        ReflectionTestUtils.setField(empresa,"id",18L);
        when(usuarios.findByEmail("admin@exemplo.com")).thenReturn(Optional.of(
            new Usuario("Admin","admin@exemplo.com","hash",empresa,new Perfil("ADMINISTRADOR"))));
    }
    @Test void listaSomenteEmpresaDoUsuario(){
        when(pedidos.findAllByEmpresa_IdOrderByDataCriacaoDesc(18L)).thenReturn(List.of());
        assertTrue(service.listar("admin@exemplo.com").isEmpty());
        verify(pedidos).findAllByEmpresa_IdOrderByDataCriacaoDesc(18L);
        verify(pedidos,never()).findAll();
    }
    @Test void naoCriaPedidoComClienteDeOutraEmpresa(){
        PedidoRequest entrada=new PedidoRequest(777L,LocalDate.now().plusDays(3),"",
            List.of(new PedidoRequest.ItemRequest("Camisa",10)));
        when(clientes.findByIdAndEmpresa_Id(777L,18L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class,()->service.criar(entrada,"admin@exemplo.com"));
        verify(pedidos,never()).save(any());
    }
    @Test void naoPermiteConsultarPedidoDeOutraEmpresa(){
        when(pedidos.findByIdAndEmpresa_Id(31L,18L)).thenReturn(Optional.empty());
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
            ()->service.buscar(31L,"admin@exemplo.com"));
        verify(pedidos,never()).findById(anyLong());
    }
}
