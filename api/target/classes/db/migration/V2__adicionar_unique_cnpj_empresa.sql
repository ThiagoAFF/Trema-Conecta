ALTER TABLE empresas
    ADD CONSTRAINT uk_empresas_cnpj UNIQUE (cnpj);