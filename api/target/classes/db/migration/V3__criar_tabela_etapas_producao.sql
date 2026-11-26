
CREATE TABLE etapas_producao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    ordem INT NOT NULL,
    empresa_id BIGINT NOT NULL,
    CONSTRAINT fk_etapas_producao_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    CONSTRAINT uk_etapas_producao_empresa_ordem UNIQUE (empresa_id, ordem)
);
