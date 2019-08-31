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

Desfazer a última migração:

```
yarn sequelize db:migrate:undo
yarn sequelize db:migrate:undo:all
```
