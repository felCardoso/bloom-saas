const FROM = process.env.RESEND_FROM_EMAIL ?? "Bloom <onboarding@resend.dev>";
const API_URL = "https://api.resend.com/emails";

async function sendEmail(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bloom</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <!-- Header -->
        <tr><td style="background:#f43f5e;border-radius:16px 16px 0 0;padding:24px 32px;">
          <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Bloom</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            Bloom · CRM para Revendedoras de Cosméticos<br/>
            Você está recebendo este e-mail porque tem uma conta no Bloom.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(" ")[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://usebloom.app";

  await sendEmail({
    from: FROM,
    to,
    subject: "Bem-vinda ao Bloom! 🌸",
    html: baseTemplate(`
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
        Olá, ${firstName}! 👋
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
        Sua conta no <strong style="color:#111827;">Bloom</strong> foi criada com sucesso.
        Você está a um passo de organizar suas vendas de cosméticos de forma simples e eficiente.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7f7;border-radius:12px;border:1px solid #fecdd3;padding:20px;margin-bottom:28px;">
        <tr><td>
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#9f1239;text-transform:uppercase;letter-spacing:0.5px;">Com o Bloom você pode</p>
          <table cellpadding="0" cellspacing="0">
            <tr><td style="padding:3px 0;font-size:14px;color:#374151;">✓&nbsp; Cadastrar clientes e acompanhar histórico</td></tr>
            <tr><td style="padding:3px 0;font-size:14px;color:#374151;">✓&nbsp; Registrar pedidos e controlar estoque</td></tr>
            <tr><td style="padding:3px 0;font-size:14px;color:#374151;">✓&nbsp; Ver relatórios de vendas e crescimento</td></tr>
            <tr><td style="padding:3px 0;font-size:14px;color:#374151;">✓&nbsp; Gerenciar sua agenda de entregas</td></tr>
          </table>
        </td></tr>
      </table>

      <a href="${appUrl}/dashboard"
         style="display:inline-block;background:#f43f5e;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
        Acessar meu dashboard →
      </a>

      <p style="margin:28px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">
        Se tiver dúvidas, responda este e-mail. Estamos aqui para ajudar!
      </p>
    `),
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: {
    clientName: string;
    orderId: string;
    items: { name: string; quantity: number; unitPrice: number }[];
    total: number;
  }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://usebloom.app";

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${item.name}</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;text-align:right;">
          R$ ${item.unitPrice.toFixed(2).replace(".", ",")}
        </td>
      </tr>`
    )
    .join("");

  await sendEmail({
    from: FROM,
    to,
    subject: `Pedido registrado — ${data.clientName}`,
    html: baseTemplate(`
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;">Pedido registrado</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
        Pedido <span style="font-family:monospace;background:#f3f4f6;padding:2px 6px;border-radius:4px;">#${data.orderId.slice(0, 8).toUpperCase()}</span>
        para <strong style="color:#111827;">${data.clientName}</strong>
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <th style="text-align:left;font-size:12px;color:#9ca3af;font-weight:600;padding-bottom:8px;border-bottom:2px solid #f3f4f6;text-transform:uppercase;">Produto</th>
          <th style="text-align:center;font-size:12px;color:#9ca3af;font-weight:600;padding-bottom:8px;border-bottom:2px solid #f3f4f6;text-transform:uppercase;">Qtd</th>
          <th style="text-align:right;font-size:12px;color:#9ca3af;font-weight:600;padding-bottom:8px;border-bottom:2px solid #f3f4f6;text-transform:uppercase;">Preço</th>
        </tr>
        ${itemRows}
        <tr>
          <td colspan="2" style="padding-top:12px;font-size:14px;font-weight:600;color:#111827;">Total</td>
          <td style="padding-top:12px;font-size:16px;font-weight:700;color:#f43f5e;text-align:right;">
            R$ ${data.total.toFixed(2).replace(".", ",")}
          </td>
        </tr>
      </table>

      <a href="${appUrl}/pedidos"
         style="display:inline-block;background:#f43f5e;color:#fff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;">
        Ver pedidos →
      </a>
    `),
  });
}
