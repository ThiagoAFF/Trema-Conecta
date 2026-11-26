package br.com.conexaoteia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "empresas")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 18)
    private String cnpj;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(length = 120) private String cidade;
    @Column(length = 2) private String estado;
    @Column(length = 120) private String responsavel;
    public void atualizar(String nome, String cnpj, String email, String telefone,
                          String cidade, String estado, String responsavel) {
        this.nome = nome; this.cnpj = cnpj; this.email = email; this.telefone = telefone;
        this.cidade = cidade; this.estado = estado; this.responsavel = responsavel;
    }
    public String getCidade(){ return cidade; }
    public String getEstado(){ return estado; }
    public String getResponsavel(){ return responsavel; }
    protected Empresa() {
    }

    public Empresa(String nome, String cnpj, String email, String telefone) {
        this.nome = nome;
        this.cnpj = cnpj;
        this.email = email;
        this.telefone = telefone;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCnpj() {
        return cnpj;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }
}