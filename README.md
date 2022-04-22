# collections-app

Este tutorial demostrara os paços para a criação de um projeto para gerenciar coleções

dados de games: titulo, editora 

dados de livros: título, autor(es), tradutor(es), número da edição, editor, local, data de publicação, número de páginas e ISBN da obra ex.:
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
```json
{
  "title": "Zappa's Universe",
  "artist": "Various (Tribute)",
  "musicList": [
    "Elvis Has Just Left The Building",
    "Brow Shoes Don't Make It",
    "Jazz Discharge Party Hats",
    "Inca Roads",
    "Moggio",
    "Nite School",
    "Echidna's Art (Of You)",
    "Hungry Freaks, Daddy",
    "Heavenly Bank Account",
    "The Meek Shall Inherit Nothing",
    "Waka Jawaka",
    "Sofa",
    "Dirty Love",
    "Hot Plate Heaven At The Green Hotel",
  ],
}
```

# inicialização
* mkdir collections-app && cd collections-app
* projen new awscdk-app-ts --projen-ts --cdk-version=2.20.0

# first-step
Vamos criar um Lambda e integrar ele com o ApiGateway

# second-step
Incluir o ApiKey, UsagePlan e habilitando tracing e log no gateway

# third-step
Incluir o versionamento e alias no Lambda