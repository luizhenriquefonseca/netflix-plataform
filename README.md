# Netflix Clone — Interface de Streaming

Projeto prático de desenvolvimento Front-End desenvolvido com **HTML5**, **CSS3** e **JavaScript (ES Modules)** simulando a experiência de navegação da plataforma Netflix.

## Funcionalidades Implementadas

- **Seleção de Perfis (`index.html`)**: Escolha entre os perfis existentes (*Luiz*, *Yasmim*, *Maya*) ou adicione um novo perfil dinamicamente, persistindo a escolha via `localStorage`.
- **Banner em Destaque (Hero)**: Destaque principal com botões de reprodução de trailer e detalhes.
- **Carrosséis Horizontais Interativos**: Navegação fluida por categorias com botões laterais e cards expansíveis ao passar o mouse.
- **Busca em Tempo Real e Filtros**: Filtragem instantânea por título, gênero ou categoria (*Início*, *Séries*, *Filmes*, *Bombando*, *Minha Lista*).
- **Minha Lista Persistente**: Adicione ou remova títulos favoritos com salvamento automático no navegador (`localStorage`).
- **Modal de Detalhes e Player**: Visualização de sinopse, elenco, classificação indicativa e reprodução de trailers incorporados do YouTube.

## Estrutura de Pastas

```text
netflix-clone/
├── index.html              # Tela de seleção de perfis
├── style.css               # Estilos da tela de perfis
├── img/                    # Avatares ilustrados locais dos perfis
├── catalogo/
│   ├── catalogo.html       # Página principal do catálogo
│   ├── catalogo.css        # Estilos do catálogo, carrosséis e modal
│   └── js/
│       ├── data.js         # Base de dados dos filmes e séries
│       └── main.js         # Lógica de renderização, busca, filtros e modal
└── README.md               # Documentação do projeto
```

## Como Executar

1. Baixe ou clone este repositório.
2. Caso utilize o **VS Code**, abra a pasta e execute com a extensão **Live Server** (necessário para carregamento de `type="module"` no JavaScript).
3. Os avatares dos perfis são carregados automaticamente a partir da pasta `img/`.
