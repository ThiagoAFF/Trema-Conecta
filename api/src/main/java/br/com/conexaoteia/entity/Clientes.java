package br.com.conexaoteia.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "clientes")
public class Clientes {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String telefone;
    private String email;
    @Column(length = 18) private String documento;
    @Column(length = 120) private String cidade;
    @Column(length = 2) private String estado;
    @Column(length = 1000) private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    protected Clientes() {

    }

    public Clientes(String nome, String telefone, String email, Empresa empresa) {
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.empresa = empresa;
    }

    public void atualizarDados(
            String nome,
            String telefone,
            String email) {

        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
    }

    public void atualizarComplementos(String documento, String cidade, String estado, String observacoes) {
        this.documento = documento; this.cidade = cidade; this.estado = estado; this.observacoes = observacoes;
    }
    public String getDocumento(){ return documento; }
    public String getCidade(){ return cidade; }
    public String getEstado(){ return estado; }
    public String getObservacoes(){ return observacoes; }
    public String getNome() {
        return nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEmail() {
        return email;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public Long getId(){
        return id;
    }
}
