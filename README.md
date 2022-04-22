# collections-app

Este tutorial demostrara os paços para a criação de um projeto para gerenciar coleções

dados de games: titulo, editora
dados de livros: título, autor(es), tradutor(es), número da edição, editor, local, data de publicação, número de páginas e ISBN da obra
ex.:
```json
{
    "title": "A Guerra dos Consoles",
    "author": "Blake J. Harris",
    "ISBN": "978-85-8057-822-5"
}
```
```json
{
    "title": "Cracking the Coding Interview",
    "author": "Gayle Laakmann McDowell",
    "ISBN": "978-0-9847828-5-7"
}
```
dados de CD: Artista, Álbum, Ano de Lançamento, Nº de discos, Gravadora, Gênero e Nº de músicas

# inicialização
* mkdir collections-app && cd collections-app
* projen new awscdk-app-ts --projen-ts --cdk-version=2.20.0

# first-step
Nesse momento vamos criar um modo de inserir um item na minha tabela de coleções da forma mais básica

# second-step
Incluiro api-key

# dynamodb uteis
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html

# lambda uteis
https://docs.aws.amazon.com/lambda/latest/dg/services-cloudformation.html

# apigateway uteis
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-method.html
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-resource.html
