package br.com.conexaoteia.dto;

public record ClienteDTO(
        Long id,
        String nome,
        String telefone,
        String email,
        String empresa,
        String documento,
        String cidade,
        String estado,
        String observacoes,
        Long totalPedidos
) {
    public ClienteDTO(Long id,String nome,String telefone,String email,String empresa,
        String documento,String cidade,String estado,String observacoes) {
        this(id,nome,telefone,email,empresa,documento,cidade,estado,observacoes,0L);
    }
    public ClienteDTO comTotalPedidos(long total) {
        return new ClienteDTO(id,nome,telefone,email,empresa,documento,cidade,estado,observacoes,total);
    }
}