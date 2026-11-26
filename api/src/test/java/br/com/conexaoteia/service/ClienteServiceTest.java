package br.com.conexaoteia.service;

import br.com.conexaoteia.dto.ClienteRequest;
import br.com.conexaoteia.entity.Clientes;
import br.com.conexaoteia.entity.Empresa;
import br.com.conexaoteia.entity.Perfil;
import br.com.conexaoteia.entity.Usuario;
import br.com.conexaoteia.exception.ClienteNaoEncontradoException;
import br.com.conexaoteia.repository.ClienteRepository;
import br.com.conexaoteia.repository.UsuarioRepository;
import java.util.List;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ClienteServiceTest {
    private ClienteRepository clientes;
    private UsuarioRepository usuarios;
    private ClienteService service;
    private Empresa empresa;

    @BeforeEach
    void iniciar() {
        clientes = Mockito.mock(ClienteRepository.class);
        usuarios = Mockito.mock(UsuarioRepository.class);
        service = new ClienteService(clientes, usuarios);
        empresa = new Empresa("Empresa Um", "12345678000100", null, null);
        ReflectionTestUtils.setField(empresa, "id", 12L);
        Usuario usuario = new Usuario("Administrador", "admin@exemplo.com", "hash", empresa,
                new Perfil("ADMINISTRADOR"));
        when(usuarios.findByEmail("admin@exemplo.com")).thenReturn(Optional.of(usuario));
    }

    @Test
    void cadastroUsaEmpresaDoUsuario() {
        ClienteRequest request = new ClienteRequest("Cliente", "81999999999", "cliente@exemplo.com");
        when(clientes.save(any(Clientes.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Clientes novo = service.criar(request, "admin@exemplo.com");
        assertSame(empresa, novo.getEmpresa());
        verify(clientes).save(any(Clientes.class));
    }

    @Test
    void consultaNaoDeveBuscarPorIdSemFiltrarEmpresa() {
        when(clientes.findByIdAndEmpresa_Id(eq(45L), eq(12L)))
                .thenReturn(Optional.empty());
        assertThrows(ClienteNaoEncontradoException.class,
                () -> service.buscarPorId(45L, "admin@exemplo.com"));
        verify(clientes).findByIdAndEmpresa_Id(45L, 12L);
        verify(clientes, never()).findById(anyLong());
    }

    @Test
    void listagemDeveUsarFiltroPorEmpresa() {
        when(clientes.findAllByEmpresa_IdOrderByNomeAsc(eq(12L)))
                .thenReturn(List.of());
        service.listar("admin@exemplo.com");
        verify(clientes).findAllByEmpresa_IdOrderByNomeAsc(12L);
        verify(clientes, never()).findAll();
    }
}
