package br.com.conexaoteia.service;

import br.com.conexaoteia.dto.ClienteRequest;
import br.com.conexaoteia.entity.Clientes;
import br.com.conexaoteia.entity.Usuario;
import br.com.conexaoteia.exception.ClienteNaoEncontradoException;
import br.com.conexaoteia.mapper.ClienteMapper;
import br.com.conexaoteia.repository.ClienteRepository;
import br.com.conexaoteia.repository.UsuarioRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {
    private final ClienteRepository repository;
    private final UsuarioRepository usuarioRepository;

    public ClienteService(ClienteRepository repository, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario usuarioAutenticado(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Usuário autenticado não encontrado"));
    }

    @Transactional(readOnly = true)
    public Clientes buscarPorId(Long id, String emailAutenticado) {
        Long empresaId = usuarioAutenticado(emailAutenticado).getEmpresa().getId();
        return repository.findByIdAndEmpresa_Id(id, empresaId)
                .orElseThrow(() -> new ClienteNaoEncontradoException(id));
    }

    @Transactional
    public Clientes criar(ClienteRequest request, String emailAutenticado) {
        Usuario usuario = usuarioAutenticado(emailAutenticado);
        Clientes novo = ClienteMapper.paraEntity(request, usuario.getEmpresa());
        return repository.save(novo);
    }

    @Transactional(readOnly = true)
    public List<Clientes> listar(String emailAutenticado) {
        Long empresaId = usuarioAutenticado(emailAutenticado).getEmpresa().getId();
        return repository.findAllByEmpresa_IdOrderByNomeAsc(empresaId);
    }

    @Transactional
    public Clientes atualizar(Long id, ClienteRequest request, String emailAutenticado) {
        Clientes cliente = buscarPorId(id, emailAutenticado);
        cliente.atualizarDados(request.nome(), request.telefone(), request.email());
        cliente.atualizarComplementos(request.documento(), request.cidade(), request.estado(), request.observacoes());
        return repository.save(cliente);
    }

    @Transactional
    public void excluir(Long id, String emailAutenticado) {
        Clientes cliente = buscarPorId(id, emailAutenticado);
        repository.delete(cliente);
    }
}
