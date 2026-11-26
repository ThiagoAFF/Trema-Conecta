package br.com.conexaoteia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "perfil_id", nullable = false)
    private Perfil perfil;

    @Column(length = 20) private String telefone;
    @Column(nullable = false) private boolean ativo = true;
    public void atualizar(String nome, String email, String telefone, Perfil perfil, boolean ativo) {
        this.nome = nome; this.email = email; this.telefone = telefone; this.perfil = perfil; this.ativo = ativo;
    }
    public void alterarStatus(boolean ativo) {this.ativo = ativo;}
    public void alterarSenha(String hash) {this.senhaHash = hash;}
    public void definirTelefone(String telefone) {this.telefone = telefone;}
    public String getTelefone() {return telefone;}
    public boolean isAtivo() {return ativo;}
    protected Usuario() {
    }

    public Usuario(String nome, String email, String senhaHash,
                   Empresa empresa, Perfil perfil) {
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash;
        this.empresa = empresa;
        this.perfil = perfil;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public Perfil getPerfil() {
        return perfil;
    }
}