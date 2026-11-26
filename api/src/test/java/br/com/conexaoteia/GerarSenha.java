package br.com.conexaoteia;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarSenha {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String senha = "Teia@2026";

        String hash = encoder.encode(senha);

        System.out.println("Hash BCrypt: " + hash);
    }
}