# Guia de Deploy — Dita Bolsas
## GitHub + Vercel + Domínio ditabolsas.com.br

---

## PASSO 1 — Criar as tabelas no Supabase

1. Acesse https://supabase.com e entre no seu projeto
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql` e cole na área de código
5. Clique em **Run** (▶)
6. Deve aparecer "Success" — as tabelas `clientes`, `produtos` e `pedidos` foram criadas com os dados iniciais

---

## PASSO 2 — Instalar o Git (se não tiver)

1. Acesse https://git-scm.com/download/win
2. Baixe e instale com as opções padrão
3. Abra o **PowerShell** ou **Prompt de Comando** e confirme:
   ```
   git --version
   ```

---

## PASSO 3 — Instalar o Node.js (se não tiver)

1. Acesse https://nodejs.org e baixe a versão **LTS**
2. Instale com as opções padrão
3. Confirme no terminal:
   ```
   node --version
   npm --version
   ```

---

## PASSO 4 — Criar o repositório no GitHub

1. Acesse https://github.com/devbrunochaves
2. Clique em **New** (botão verde no canto superior direito)
3. Nome do repositório: `dita-bolsas`
4. Marque como **Private** (ou Public, sua escolha)
5. **NÃO** marque "Add a README file"
6. Clique em **Create repository**
7. Copie a URL que aparece (formato: `https://github.com/devbrunochaves/dita-bolsas.git`)

---

## PASSO 5 — Subir o código para o GitHub

Abra o terminal **dentro da pasta `dita-bolsas-app`** e execute os comandos um por um:

```bash
# Inicializar o git
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: projeto inicial Dita Bolsas"

# Conectar ao repositório do GitHub
git remote add origin https://github.com/devbrunochaves/dita-bolsas.git

# Enviar o código
git branch -M main
git push -u origin main
```

Se pedir usuário e senha do GitHub, use seu email e um **Personal Access Token**
(GitHub > Settings > Developer settings > Personal access tokens > Tokens classic > Generate new token)

---

## PASSO 6 — Deploy no Vercel

1. Acesse https://vercel.com e crie uma conta gratuita (pode entrar com o GitHub)
2. Clique em **Add New → Project**
3. Clique em **Import Git Repository**
4. Selecione o repositório **dita-bolsas**
5. Na tela de configuração:
   - **Framework Preset**: Vite (deve detectar automaticamente)
   - **Root Directory**: deixe em branco (a raiz já é a pasta certa)
6. Clique em **Environment Variables** e adicione as duas variáveis:

   | Nome | Valor |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://vymthxasastskhrgjjkz.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5bXRoeGFzYXN0c2tocmdqamt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzczNzYsImV4cCI6MjA5MjYxMzM3Nn0.QvvjYvLyJt-gH8aDJw772icFgAshvh1sh3KXB2wCL-M` |

7. Clique em **Deploy**
8. Aguarde 1-2 minutos — o Vercel vai gerar uma URL como `dita-bolsas.vercel.app`

---

## PASSO 7 — Conectar o domínio ditabolsas.com.br

### No Vercel:
1. Vá em seu projeto > **Settings** > **Domains**
2. Clique em **Add Domain**
3. Digite: `ditabolsas.com.br`
4. Também adicione: `www.ditabolsas.com.br`
5. O Vercel vai mostrar os registros DNS que você precisa configurar

### No painel do seu provedor de domínio (ex: Registro.br, Hostinger, GoDaddy):
Configure os seguintes registros DNS:

**Para ditabolsas.com.br (domínio raiz):**
```
Tipo: A
Nome: @
Valor: 76.76.21.21
```

**Para www.ditabolsas.com.br:**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

> ⚠️ A propagação do DNS pode levar de 5 minutos a 48 horas.
> O Vercel vai mostrar ✅ quando estiver ativo.

---

## PASSO 8 — Testar tudo

Após o domínio propagar, acesse:

| URL | O que abre |
|-----|-----------|
| `ditabolsas.com.br` | Site institucional |
| `ditabolsas.com.br/produtos` | Catálogo de produtos |
| `ditabolsas.com.br/sobre` | Sobre Nós |
| `ditabolsas.com.br/contato` | Contato |
| `ditabolsas.com.br/pedido` | Sistema de Pedidos |

---

## Deploy automático (CI/CD)

A partir de agora, **qualquer alteração que você fizer e enviar para o GitHub é publicada automaticamente no Vercel** em 1-2 minutos:

```bash
git add .
git commit -m "descrição da alteração"
git push
```

---

## Problemas comuns

**Página 404 ao acessar /pedido diretamente:**
Certifique-se que o arquivo `vercel.json` está na raiz do projeto com o conteúdo:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Erro de banco de dados:**
Verifique se as variáveis de ambiente estão corretas no Vercel em Settings > Environment Variables.
Após alterar variáveis, é necessário fazer um novo deploy (Deployments > ... > Redeploy).

**Supabase pausando o projeto:**
O plano gratuito pausa projetos sem uso por 7+ dias.
Acesse o painel do Supabase e clique em "Restore" para reativar.

---

*Dita Bolsas · Serra/ES · github.com/devbrunochaves/dita-bolsas*
