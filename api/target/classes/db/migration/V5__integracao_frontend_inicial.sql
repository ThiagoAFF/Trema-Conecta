-- Ampliação aditiva: mantém empresas, clientes, usuários e pedidos existentes.
ALTER TABLE empresas ADD COLUMN cidade VARCHAR(120), ADD COLUMN estado VARCHAR(2), ADD COLUMN responsavel VARCHAR(120);
ALTER TABLE clientes ADD COLUMN documento VARCHAR(18), ADD COLUMN cidade VARCHAR(120), ADD COLUMN estado VARCHAR(2), ADD COLUMN observacoes VARCHAR(1000);
ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20), ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE pedidos ADD COLUMN data_recebimento DATE, ADD COLUMN situacao_web VARCHAR(20);
CREATE TABLE empresa_preferencias (
 empresa_id BIGINT PRIMARY KEY,
 mudanca_etapa BOOLEAN NOT NULL DEFAULT TRUE,
 lote_concluido BOOLEAN NOT NULL DEFAULT TRUE,
 prazo_proximo BOOLEAN NOT NULL DEFAULT TRUE,
 atraso BOOLEAN NOT NULL DEFAULT TRUE,
 nova_movimentacao BOOLEAN NOT NULL DEFAULT FALSE,
 CONSTRAINT fk_preferencias_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
CREATE TABLE lotes (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 codigo VARCHAR(36) NOT NULL UNIQUE,
 empresa_id BIGINT NOT NULL,
 pedido_id BIGINT NOT NULL,
 quantidade_pecas INT NOT NULL,
 etapa_atual VARCHAR(30) NOT NULL,
 data_inicio DATE NOT NULL,
 previsao_conclusao DATE NOT NULL,
 situacao VARCHAR(20) NOT NULL,
 data_conclusao DATE,
 CONSTRAINT fk_lotes_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
 CONSTRAINT fk_lotes_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
 CONSTRAINT ck_lote_pecas CHECK (quantidade_pecas > 0),
 INDEX idx_lotes_empresa (empresa_id)
);
CREATE TABLE movimentacoes (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 empresa_id BIGINT NOT NULL,
 lote_id BIGINT NOT NULL,
 etapa VARCHAR(30) NOT NULL,
 responsavel VARCHAR(120) NOT NULL,
 data_hora DATETIME(6) NOT NULL,
 aprovadas INT NOT NULL,
 defeitos INT NOT NULL,
 observacoes VARCHAR(1000),
 CONSTRAINT fk_mov_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
 CONSTRAINT fk_mov_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
 CONSTRAINT ck_mov_aprovadas CHECK (aprovadas >= 0),
 CONSTRAINT ck_mov_defeitos CHECK (defeitos >= 0),
 INDEX idx_mov_empresa_data (empresa_id, data_hora)
);
CREATE TABLE notificacoes (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 empresa_id BIGINT NOT NULL,
 lote_id BIGINT,
 tipo VARCHAR(30) NOT NULL,
 descricao VARCHAR(500) NOT NULL,
 data_hora DATETIME(6) NOT NULL,
 lida BOOLEAN NOT NULL DEFAULT FALSE,
 CONSTRAINT fk_not_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
 CONSTRAINT fk_not_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
 INDEX idx_not_empresa_lida (empresa_id, lida)
);
