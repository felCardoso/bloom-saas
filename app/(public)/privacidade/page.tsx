import type { Metadata } from "next";
import { Shield, Lock, Eye, Trash2, Mail, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade — RoséCRM",
};

const highlights = [
  { icon: Shield, label: "Conformidade com a LGPD", desc: "Seguimos a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) em todas as operações." },
  { icon: Lock, label: "Seus dados são seus", desc: "Nunca vendemos ou compartilhamos seus dados com terceiros para fins publicitários." },
  { icon: Eye, label: "Transparência total", desc: "Descrevemos exatamente quais dados coletamos e como cada um é utilizado." },
  { icon: Trash2, label: "Direito ao esquecimento", desc: "Você pode solicitar a exclusão de todos os seus dados a qualquer momento." },
];

const sections = [
  {
    title: "1. Quem somos",
    content: `O RoséCRM é uma plataforma de CRM desenvolvida para revendedoras de cosméticos, operada por RoséCRM LTDA, inscrita no CNPJ XX.XXX.XXX/0001-XX, com sede em São Paulo — SP.

Para fins da Lei Geral de Proteção de Dados (LGPD), atuamos como controlador dos dados pessoais dos usuários da plataforma e como operador dos dados de clientes inseridos pelas revendedoras.

Encarregada de Dados (DPO): privacidade@rosecrm.com.br`,
  },
  {
    title: "2. Dados que coletamos",
    content: `Coletamos apenas os dados necessários para o funcionamento da plataforma:

Dados de cadastro (fornecidos por você):
• Nome completo
• Endereço de e-mail
• Senha (armazenada com criptografia bcrypt — nunca em texto puro)
• Telefone (opcional)

Dados de uso (coletados automaticamente):
• Endereço IP e localização aproximada
• Tipo de dispositivo e navegador
• Páginas acessadas e tempo de uso
• Eventos de interação (cliques em funcionalidades)

Dados dos seus clientes (inseridos por você):
• Nome, telefone, e-mail, endereço, aniversário
• Histórico de pedidos e produtos adquiridos
• Anotações e observações que você registra`,
  },
  {
    title: "3. Como utilizamos os dados",
    content: `Utilizamos seus dados para:

• Criar e manter sua conta na plataforma
• Processar pagamentos de planos pagos (via processador terceiro)
• Enviar comunicações sobre sua conta, plano e atualizações
• Melhorar funcionalidades com base em padrões de uso anônimos
• Prestar suporte técnico quando solicitado
• Cumprir obrigações legais e regulatórias

Nunca utilizamos seus dados para:
• Vender publicidade segmentada
• Compartilhar com terceiros para marketing
• Treinar modelos de inteligência artificial sem consentimento explícito`,
  },
  {
    title: "4. Base legal para tratamento",
    content: `Tratamos seus dados com base nas seguintes hipóteses legais da LGPD (art. 7º):

• Execução de contrato: para prestar o serviço que você contratou
• Legítimo interesse: para melhorar a plataforma e prevenir fraudes
• Cumprimento de obrigação legal: quando exigido por lei
• Consentimento: para comunicações de marketing (você pode revogar a qualquer momento)`,
  },
  {
    title: "5. Compartilhamento de dados",
    content: `Compartilhamos seus dados apenas com:

Processador de pagamentos (ex: Stripe/PagSeguro): apenas dados de cobrança, para processar assinaturas. Esses parceiros seguem suas próprias políticas de privacidade e são auditados periodicamente.

Serviços de infraestrutura (ex: Supabase/AWS): para hospedagem segura dos dados, com contratos de processamento conforme a LGPD.

Autoridades competentes: quando exigido por lei, ordem judicial ou para proteger direitos do RoséCRM.

Não vendemos, alugamos ou comercializamos seus dados com nenhuma outra empresa.`,
  },
  {
    title: "6. Armazenamento e segurança",
    content: `Seus dados são armazenados em servidores seguros localizados no Brasil ou na União Europeia (adequada pela Comissão Europeia), com:

• Criptografia em trânsito (TLS 1.3)
• Criptografia em repouso (AES-256)
• Backups automáticos diários com retenção de 30 dias
• Controle de acesso restrito por função (RBAC)
• Monitoramento de segurança 24/7
• Plano de resposta a incidentes documentado

Em caso de violação de dados que possa causar risco a você, notificaremos a ANPD e os usuários afetados em até 72 horas.`,
  },
  {
    title: "7. Cookies e rastreamento",
    content: `Utilizamos cookies para:

Essenciais (sem consentimento): manter sessão ativa, preferências de idioma, segurança da conta.

Analíticos (com consentimento): entender como a plataforma é usada para melhorá-la. Utilizamos dados anonimizados e agregados.

Não utilizamos cookies de publicidade ou de rastreamento entre sites.

Você pode gerenciar cookies nas configurações do seu navegador. A desativação de cookies essenciais pode prejudicar o funcionamento da plataforma.`,
  },
  {
    title: "8. Seus direitos (LGPD)",
    content: `Conforme a Lei Geral de Proteção de Dados, você tem direito a:

• Confirmação de que tratamos seus dados
• Acesso aos dados que temos sobre você
• Correção de dados incompletos, inexatos ou desatualizados
• Anonimização, bloqueio ou eliminação de dados desnecessários
• Portabilidade dos dados em formato legível por máquina
• Eliminação de dados tratados com consentimento
• Informação sobre com quem compartilhamos seus dados
• Revogação do consentimento a qualquer momento
• Oposição ao tratamento em caso de descumprimento da LGPD

Para exercer qualquer direito, envie um e-mail para privacidade@rosecrm.com.br. Responderemos em até 15 dias.`,
  },
  {
    title: "9. Retenção de dados",
    content: `Mantemos seus dados pelo tempo necessário para:

• Prestar o serviço contratado (enquanto sua conta estiver ativa)
• Cumprir obrigações legais (ex: dados fiscais por 5 anos)
• Resolver disputas e fazer cumprir acordos

Após o encerramento da conta, seus dados são anonimizados em 30 dias e excluídos permanentemente em 90 dias, salvo obrigação legal em contrário.

Os dados dos seus clientes inseridos na plataforma são excluídos junto com sua conta.`,
  },
  {
    title: "10. Alterações nesta Política",
    content: `Esta política pode ser atualizada periodicamente. Quando houver alterações significativas, você será notificado por e-mail com antecedência mínima de 15 dias.

A data da última atualização está sempre indicada no início deste documento. Recomendamos revisão periódica.`,
  },
];

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
          Política de Privacidade
        </h1>
        <p className="text-neutral-500 text-sm">
          Última atualização: 1º de maio de 2026 · Em conformidade com a LGPD
        </p>
        <p className="mt-4 text-neutral-600 text-sm leading-relaxed">
          Sua privacidade é fundamental para nós. Este documento explica de forma clara quais dados coletamos, como os utilizamos e quais são seus direitos.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {highlights.map((h) => (
          <div
            key={h.label}
            className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100"
          >
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <h.icon className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-800">{h.label}</p>
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold text-neutral-800 mb-3 pb-2 border-b border-neutral-100">
              {section.title}
            </h2>
            <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="mailto:privacidade@rosecrm.com.br"
          className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 hover:bg-neutral-100 transition-colors"
        >
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Mail className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">DPO / Privacidade</p>
            <p className="text-xs text-neutral-500">privacidade@rosecrm.com.br</p>
          </div>
        </a>
        <a
          href="/suporte"
          className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 hover:bg-neutral-100 transition-colors"
        >
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Central de Suporte</p>
            <p className="text-xs text-neutral-500">Dúvidas e solicitações</p>
          </div>
        </a>
      </div>
    </div>
  );
}
