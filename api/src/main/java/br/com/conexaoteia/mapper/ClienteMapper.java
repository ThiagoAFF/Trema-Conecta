package br.com.conexaoteia.mapper;

import br.com.conexaoteia.dto.ClienteDTO;
import br.com.conexaoteia.entity.Clientes;
import br.com.conexaoteia.dto.ClienteRequest;
import br.com.conexaoteia.entity.Empresa;

public class ClienteMapper {
    public static ClienteDTO paraDTO(Clientes clientes) {
        return new ClienteDTO(
                clientes.getId(),
                clientes.getNome(),
                clientes.getTelefone(),
                clientes.getEmail(),
                clientes.getEmpresa().getNome(),
                clientes.getDocumento(), clientes.getCidade(), clientes.getEstado(), clientes.getObservacoes()
        );
    }

    public static Clientes paraEntity(
            ClienteRequest r,
            Empresa empresa
            )   {
                    Clientes novo = new Clientes(r.nome(), r.telefone(), r.email(), empresa);
                    novo.atualizarComplementos(r.documento(), r.cidade(), r.estado(), r.observacoes());
                    return novo;
                }
}