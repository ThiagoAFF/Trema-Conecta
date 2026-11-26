
package br.com.conexaoteia.service;

import br.com.conexaoteia.dto.CadastroEmpresaEntrada;
import br.com.conexaoteia.entity.Empresa;
import br.com.conexaoteia.entity.Perfil;
import br.com.conexaoteia.entity.Usuario;
import br.com.conexaoteia.exception.CadastroDuplicadoException;
import br.com.conexaoteia.repository.EmpresaRepository;
import br.com.conexaoteia.repository.PerfilRepository;
import br.com.conexaoteia.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CadastroEmpresaServiceTest {

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilRepository perfilRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CadastroEmpresaService service;

    private CadastroEmpresaEntrada request;

    @BeforeEach
    void preparar() {

        request = new CadastroEmpresaEntrada(
                "Empresa Teste",
                "11222333000181",
                "contato@empresa.com",
                "81999999999",
                "Administrador",
                "admin@empresa.com",
                "SenhaTeste123!"
        );
    }

    // TESTE 1: Rejeitar CNPJ duplicado

    @Test
    void deveRejeitarCnpjDuplicado() {

        when(empresaRepository.existsByCnpj("11222333000181"))
                .thenReturn(true);

        assertThrows(
                CadastroDuplicadoException.class,
                () -> service.cadastrar(request)
        );

        verify(empresaRepository, Mockito.never())
                .save(any(Empresa.class));
    }

    // TESTE 2: Rejeitar e-mail duplicado

    @Test
    void deveRejeitarEmailAdministradorDuplicado() {

        when(usuarioRepository.existsByEmail("admin@empresa.com"))
                .thenReturn(true);

        assertThrows(
                CadastroDuplicadoException.class,
                () -> service.cadastrar(request)
        );

        verify(empresaRepository, Mockito.never())
                .save(any(Empresa.class));
    }

    // TESTE 3: Cadastrar empresa com administrador

    @Test
    void deveCadastrarEmpresaComAdministrador() {

        Perfil perfil = Mockito.mock(Perfil.class);

        when(perfilRepository.findByNome("ADMINISTRADOR"))
                .thenReturn(Optional.of(perfil));

        when(empresaRepository.save(any(Empresa.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(passwordEncoder.encode("SenhaTeste123!"))
                .thenReturn("hash-simulado");

        Empresa empresa = service.cadastrar(request);

        assertNotNull(empresa);

        verify(empresaRepository).save(any(Empresa.class));

        verify(passwordEncoder).encode("SenhaTeste123!");

        ArgumentCaptor<Usuario> usuarioCaptor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository).save(usuarioCaptor.capture());

        Usuario administrador = usuarioCaptor.getValue();

        assertSame(empresa, administrador.getEmpresa());

        assertEquals(
                "admin@empresa.com",
                administrador.getEmail()
        );

        assertEquals(
                "hash-simulado",
                administrador.getSenhaHash()
        );

        assertSame(perfil, administrador.getPerfil());
    }

    // TESTE 4: Normalizar e-mail do administrador

    @Test
    void deveNormalizarEmailDoAdministrador() {

        CadastroEmpresaEntrada entrada =
                new CadastroEmpresaEntrada(
                        "Empresa Teste",
                        "11222333000181",
                        "CONTATO@EMPRESA.COM",
                        "81999999999",
                        "Administrador",
                        "  ADMIN@EMPRESA.COM  ",
                        "SenhaTeste123!"
                );

        Perfil perfil = Mockito.mock(Perfil.class);

        when(perfilRepository.findByNome("ADMINISTRADOR"))
                .thenReturn(Optional.of(perfil));

        when(empresaRepository.save(any(Empresa.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.cadastrar(entrada);

        verify(usuarioRepository)
                .existsByEmail("admin@empresa.com");

        ArgumentCaptor<Usuario> captor =
                ArgumentCaptor.forClass(Usuario.class);

        verify(usuarioRepository).save(captor.capture());

        Usuario administrador = captor.getValue();

        assertEquals(
                "admin@empresa.com",
                administrador.getEmail()
        );
    }
}
