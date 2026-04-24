# Dita Bolsas — Site + Plataforma de Pedidos

## Como rodar o projeto

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior)

### 2. Instalar dependências
Abra o terminal (Prompt de Comando ou PowerShell) **dentro da pasta `dita-bolsas-app`** e rode:

```bash
npm install
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

Acesse **http://localhost:5173** no navegador.

### 4. Gerar versão para publicar
```bash
npm run build
```

Os arquivos prontos para publicar ficarão na pasta `dist/`.

---

## Estrutura do projeto

```
src/
  pages/
    Home.jsx          → Página inicial (vermelho/branco)
    Products.jsx      → Catálogo de produtos
    About.jsx         → Sobre Nós
    Contact.jsx       → Contato
    pedido/
      PedidoLayout    → Layout do sistema de pedidos (verde/branco)
      Dashboard       → Painel principal
      EmitirPedido    → Formulário de pedido + geração de PDF
      CadastroCliente → Cadastrar/editar clientes
      CadastroProduto → Cadastrar/editar produtos
      ListaClientes   → Listagem de clientes
      ListaProdutos   → Listagem de produtos
  utils/
    storage.js        → Gerenciamento de dados (localStorage)
    pdf.js            → Gerador de PDF (modelo ORÇAMENTO)
  components/
    Navbar.jsx
    Footer.jsx
```

## URLs

| URL                     | Descrição                          |
|-------------------------|------------------------------------|
| `/`                     | Site institucional - Início        |
| `/produtos`             | Catálogo de produtos               |
| `/sobre`                | Sobre Nós                          |
| `/contato`              | Contato                            |
| `/pedido`               | Dashboard do sistema de pedidos    |
| `/pedido/emitir`        | Emitir novo pedido / orçamento     |
| `/pedido/clientes`      | Lista de clientes                  |
| `/pedido/clientes/novo` | Cadastrar novo cliente             |
| `/pedido/produtos`      | Lista de produtos                  |
| `/pedido/produtos/novo` | Cadastrar novo produto             |

## Dados

Os dados de **clientes**, **produtos** e **pedidos** ficam salvos no navegador (localStorage).
Para limpar todos os dados: abra o DevTools (F12) > Application > localStorage > Limpar.

## Customizações futuras

- Trocar a logo: substitua o arquivo `public/logo.svg`
- Alterar cores: edite as variáveis CSS em `src/App.css` (seção `:root`)
- Adicionar fotos de produtos: inclua imagens em `public/` e referencie em `Products.jsx`
- Conectar a um banco de dados: substitua as funções em `src/utils/storage.js`

---

*Desenvolvido para Dita Bolsas · Serra/ES · CNPJ: 19.943.654/0001-87*
