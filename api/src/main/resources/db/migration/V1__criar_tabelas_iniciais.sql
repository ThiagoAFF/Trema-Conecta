
-- 1. Empresas que utilizam o TEIA Connection
CREATE TABLE empresas (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          nome VARCHAR(150) NOT NULL,
                          cnpj VARCHAR(18) NOT NULL UNIQUE,
                          email VARCHAR(150),
                          telefone VARCHAR(20)
);

-- 2. Perfis de acesso dos usuários
CREATE TABLE perfis (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        nome VARCHAR(30) NOT NULL UNIQUE
);

-- 3. Usuários vinculados a uma empresa e a um perfil
CREATE TABLE usuarios (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          nome VARCHAR(120) NOT NULL,
                          email VARCHAR(150) NOT NULL UNIQUE,
                          senha_hash VARCHAR(255) NOT NULL,
                          empresa_id BIGINT NOT NULL,
                          perfil_id BIGINT NOT NULL,

                          CONSTRAINT fk_usuarios_empresa
                              FOREIGN KEY (empresa_id)
                                  REFERENCES empresas(id),

                          CONSTRAINT fk_usuarios_perfil
                              FOREIGN KEY (perfil_id)
                                  REFERENCES perfis(id)
);

-- 4. Clientes pertencentes a uma empresa
CREATE TABLE clientes (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          nome VARCHAR(120) NOT NULL,
                          telefone VARCHAR(20),
                          email VARCHAR(150),
                          empresa_id BIGINT NOT NULL,

                          CONSTRAINT fk_clientes_empresa
                              FOREIGN KEY (empresa_id)
                                  REFERENCES empresas(id)
);

-- Perfis disponíveis inicialmente
INSERT INTO perfis (nome) VALUES
                              ('ADMINISTRADOR'),
                              ('GERENTE'),
                              ('FUNCIONARIO');
