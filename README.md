# GM Portas Automáticas — cópia estática do site atual

Clone fiel (HTML/CSS/JS/imagens baixados direto) da home que está no ar hoje
em `https://gmportasautomaticas.com.br/` (WordPress + Elementor). Serve como
ponto de partida editável fora do WordPress, com os dois formulários de
"Solicitar orçamento" já ligados ao CRM interno do projeto
[`gm-portas-automaticas`](../gm-portas-automaticas) (mesma planilha/Apps
Script, mesmo schema de lead).

## Rodar localmente

```
python3 -m http.server 8000
```

Abra `http://localhost:8000`.

## Conectar ao CRM

1. Copie `assets/crm-config.example.js` para `assets/crm-config.js` (já está
   no `.gitignore`, não sobe pro repo).
2. Cole a mesma URL do Apps Script (termina em `/exec`) que está em
   `VITE_SHEETS_WEBHOOK_URL` no `.env.local` do projeto `gm-portas-automaticas`
   em `window.GM_CRM_WEBHOOK_URL`.
3. Pronto — os dois formulários da página gravam o lead na mesma planilha
   (`leads_gmesquadrias_crm`) e abrem o WhatsApp com os dados preenchidos,
   igual o comportamento do site novo em Lovable.

Sem o passo 2, os formulários continuam abrindo o WhatsApp normalmente, só
não gravam o lead na planilha (um aviso aparece no console do navegador).

## Estrutura

- `index.html` — página clonada, com os dois `<form class="elementor-form">`
  marcados com `data-crm-form` e o AJAX nativo do Elementor desligado nesses
  dois widgets (`data-widget_type="form.default-crm-static"`), pra não
  tentar postar pro `admin-ajax.php` do WordPress (que não existe aqui).
- `assets/crm-submit.js` — intercepta o submit dos dois formulários, monta o
  payload no mesmo formato de `scripts/apps-script-leads.gs` e dispara o
  `fetch` (`mode: "no-cors"`) + abertura do WhatsApp.
- `wp-content/`, `wp-includes/` — assets originais baixados (CSS/JS do tema
  e dos plugins Elementor/Elementor Pro, imagens, fontes). O carrossel de
  logos ("Nossos clientes") ainda depende do JS do Elementor, por isso ele
  não foi removido — só o handler de formulário foi desligado.

## O que não foi trazido

- Backend do WordPress (wp-admin, REST API, grecaptcha de verdade no
  servidor) — o badge do reCAPTCHA v3 ainda aparece (fidelidade visual), mas
  nada valida o token, porque não existe mais PHP por trás.
- `comments/feed`, `wp-json` e outros endpoints do WordPress citados no HTML
  original: ficaram como link morto, não afetam a página.
