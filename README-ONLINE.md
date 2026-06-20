# Dashboard Central de Casamento

## Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. Abra o SQL Editor e execute `supabase-schema.sql`.
3. Em Project Settings > API, copie a Project URL e a Publishable key.
4. Preencha `config.js`:

```js
window.APP_CONFIG = {
  supabaseUrl: "https://SEU-PROJETO.supabase.co",
  supabasePublishableKey: "SUA_CHAVE_PUBLICA",
  storageBucket: "wedding-documents"
};
```

Nunca coloque a chave `service_role` no site.

## Configurar autenticacao

Em Authentication > URL Configuration:

- defina o Site URL com o endereco final do GitHub Pages;
- adicione esse mesmo endereco em Redirect URLs.

O primeiro login mescla os dados existentes do navegador com a conta e preserva os registros locais.

## Publicar no GitHub Pages

1. Use esta pasta como raiz do repositorio.
2. Envie os arquivos para a branch `main`.
3. No GitHub, abra Settings > Pages.
4. Em Build and deployment, escolha GitHub Actions.
5. O workflow `.github/workflows/deploy-pages.yml` publicara a interface.

## Onde cada coisa fica

- interface: GitHub Pages;
- login: Supabase Auth;
- dados: tabela `wedding_dashboards`;
- PDFs: bucket privado `wedding-documents`;
- acesso aos PDFs: URL assinada temporaria para o usuario autenticado.

O `localStorage` continua funcionando como cache e modo local. O `server.py` serve apenas para desenvolvimento e nao e publicado.
