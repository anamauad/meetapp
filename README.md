# meetapp

App agregador de eventos para desenvolvedores

## Sequelize

Cria arquivo para definir novas tabelas:

```
yarn sequelize migration:create --name=create-users
```

Executa a migração (e adiciona um registro na tabela SequelizeMigrate):

```
yarn sequelize db:migrate
```
