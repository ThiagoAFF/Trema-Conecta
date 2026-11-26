CREATE TABLE pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(36) NOT NULL UNIQUE,
    empresa_id BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    data_criacao DATETIME(6) NOT NULL,
    prazo_entrega DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO',
    observacoes VARCHAR(1000),
    CONSTRAINT fk_pedidos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    CONSTRAINT fk_pedidos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT ck_pedidos_status CHECK (status IN ('ABERTO','ENTREGUE','CANCELADO')),
    INDEX idx_pedidos_empresa_prazo (empresa_id, prazo_entrega),
    INDEX idx_pedidos_empresa_status (empresa_id, status)
);
CREATE TABLE pedido_itens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    descricao VARCHAR(180) NOT NULL,
    quantidade INT NOT NULL,
    CONSTRAINT fk_pedido_itens_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT ck_pedido_itens_quantidade CHECK (quantidade > 0)
);
