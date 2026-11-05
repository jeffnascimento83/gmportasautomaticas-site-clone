// Intercepta os formulários "Solicitar orçamento" (Elementor) e grava o
// lead direto na planilha do CRM interno do projeto gm-portas-automaticas,
// usando o mesmo Apps Script e o mesmo schema de colunas (ver
// scripts/apps-script-leads.gs naquele projeto). Depois abre o WhatsApp com
// os dados preenchidos, igual o comportamento original do formulário.
(function () {
  "use strict";

  function getField(form, name) {
    var el = form.querySelector('[name="form_fields[' + name + ']"]:checked, input[name="form_fields[' + name + ']"], textarea[name="form_fields[' + name + ']"]');
    return el ? el.value.trim() : "";
  }

  function getUtm() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
      fbclid: params.get("fbclid") || "",
    };
  }

  function buildWhatsAppLink(payload) {
    var numero = window.GM_WHATSAPP_NUMBER || "5521970741711";
    var linhas = [
      "Olá, GM Portas Automáticas! Gostaria de um orçamento.",
      "",
      "Nome: " + payload.nome,
      payload.empresa ? "Empresa: " + payload.empresa : null,
      payload.email ? "E-mail: " + payload.email : null,
      "WhatsApp: " + payload.whatsapp,
      payload.servico ? "Serviço: " + payload.servico : null,
      payload.finalidade ? "Finalidade: " + payload.finalidade : null,
      payload.mensagem ? "Demanda: " + payload.mensagem : null,
    ].filter(Boolean);
    return "https://api.whatsapp.com/send?phone=" + numero + "&text=" + encodeURIComponent(linhas.join("\n"));
  }

  function registrarLead(payload) {
    var webhookUrl = window.GM_CRM_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("GM_CRM_WEBHOOK_URL não configurada em assets/crm-config.js — lead não foi gravado no CRM.");
      return;
    }
    fetch(webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch(function (err) {
      console.error("Falha ao enviar lead pro CRM:", err);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;

    var payload = Object.assign(
      {
        nome: getField(form, "name"),
        empresa: getField(form, "field_e55d09b"),
        email: getField(form, "email"),
        whatsapp: getField(form, "field_aadad5a"),
        servico: getField(form, "field_82512a2"),
        finalidade: getField(form, "field_4d26aa2"),
        mensagem: getField(form, "message"),
        page_url: window.location.origin + window.location.pathname,
        referrer: document.referrer,
      },
      getUtm(),
    );

    if (!payload.nome || !payload.whatsapp) {
      window.alert("Informe ao menos seu nome e WhatsApp para retornarmos.");
      return;
    }

    registrarLead(payload);
    window.open(buildWhatsAppLink(payload), "_blank", "noopener,noreferrer");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll("form[data-crm-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", handleSubmit);
    });
  });
})();
