import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Leia os Termos de Uso do Bloom: condições de uso da plataforma, responsabilidades, planos e pagamentos.",
  openGraph: { title: "Termos de Uso — Bloom", description: "Condições de uso da plataforma Bloom." },
};

const sections = [
  {
    title: "1. Aceitação dos Termos",
    content: `Ao criar uma conta ou utilizar o Bloom, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize a plataforma.

Estes termos se aplicam a todos os usuários da plataforma, incluindo visitantes, usuários do plano gratuito e assinantes de planos pagos.`,
  },
  {
    title: "2. Descrição do Serviço",
    content: `O Bloom é uma plataforma de gestão de relacionamento com clientes (CRM) desenvolvida para revendedoras de cosméticos. A plataforma oferece funcionalidades para gerenciamento de clientes, pedidos, produtos, agenda e relatórios de desempenho.

O serviço é oferecido em três modalidades: plano Grátis, plano Pro e plano Premium, cada um com limites e funcionalidades distintos conforme descritos na página de Planos.`,
  },
  {
    title: "3. Cadastro e Conta",
    content: `Para utilizar o Bloom, você deve criar uma conta fornecendo informações verdadeiras, precisas e atualizadas. Você é responsável por:

• Manter a confidencialidade de suas credenciais de acesso
• Todas as atividades realizadas sob sua conta
• Notificar imediatamente qualquer uso não autorizado da sua conta

É vedado o compartilhamento de credenciais entre múltiplas pessoas, exceto nos planos que preveem múltiplos usuários.`,
  },
  {
    title: "4. Uso Permitido",
    content: `Você pode utilizar o Bloom exclusivamente para fins legítimos de gestão do seu negócio de revenda de cosméticos. São exemplos de uso permitido:

• Cadastrar e gerenciar sua carteira de clientes
• Registrar e acompanhar pedidos e entregas
• Controlar o catálogo de produtos e estoque
• Organizar follow-ups e eventos na agenda
• Visualizar relatórios de desempenho do negócio`,
  },
  {
    title: "5. Uso Proibido",
    content: `É expressamente vedado:

• Utilizar a plataforma para fins ilegais ou não autorizados
• Tentar obter acesso não autorizado a sistemas ou dados de terceiros
• Fazer engenharia reversa, descompilar ou desmontar qualquer parte do software
• Utilizar scripts, bots ou meios automatizados para acessar a plataforma sem autorização
• Revender, sublicenciar ou transferir o acesso à plataforma a terceiros
• Inserir dados de clientes sem o consentimento prévio dessas pessoas
• Utilizar a plataforma para enviar comunicações não solicitadas (spam)`,
  },
  {
    title: "6. Dados dos Clientes",
    content: `Ao cadastrar dados de terceiros (seus clientes) na plataforma, você declara que:

• Obteve o consentimento necessário para o tratamento desses dados, conforme exigido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
• É o responsável pelo tratamento desses dados perante seus clientes
• Utilizará os dados exclusivamente para os fins de gestão do seu negócio

O Bloom atua como operador dos dados que você, como controlador, insere na plataforma.`,
  },
  {
    title: "7. Planos e Pagamento",
    content: `O plano Grátis é oferecido sem custo, com as limitações descritas na página de Planos. Os planos pagos (Pro e Premium) são cobrados mensalmente e renovados automaticamente.

• O cancelamento pode ser feito a qualquer momento pelo painel de configurações
• Não há reembolso proporcional por período não utilizado após o cancelamento
• Após o cancelamento de um plano pago, sua conta retorna ao plano Grátis
• Os preços podem ser alterados com aviso prévio de 30 dias por e-mail`,
  },
  {
    title: "8. Disponibilidade e Suporte",
    content: `Buscamos manter a plataforma disponível 24 horas por dia, 7 dias por semana, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência.

O suporte é oferecido conforme o plano contratado: comunidade (Grátis), e-mail com resposta em até 48 horas (Pro) e atendimento prioritário em até 24 horas (Premium).`,
  },
  {
    title: "9. Propriedade Intelectual",
    content: `Todo o conteúdo da plataforma — incluindo software, design, textos, logotipos e funcionalidades — é de propriedade exclusiva do Bloom ou de seus licenciantes, protegido pelas leis de propriedade intelectual aplicáveis.

Os dados que você insere na plataforma continuam sendo de sua propriedade. Você pode exportar seus dados a qualquer momento (plano Premium) ou solicitar por e-mail.`,
  },
  {
    title: "10. Limitação de Responsabilidade",
    content: `O Bloom não se responsabiliza por perdas ou danos resultantes de:

• Uso inadequado da plataforma
• Falhas de conexão à internet fora do nosso controle
• Perda de dados causada por ação do próprio usuário
• Decisões de negócio tomadas com base nas informações da plataforma

Nossa responsabilidade total, em qualquer circunstância, fica limitada ao valor pago nos últimos 3 meses de assinatura.`,
  },
  {
    title: "11. Alterações nos Termos",
    content: `Reservamo-nos o direito de alterar estes Termos de Uso a qualquer momento. Alterações significativas serão comunicadas por e-mail com antecedência mínima de 15 dias.

O uso continuado da plataforma após a vigência das alterações implica na aceitação dos novos termos.`,
  },
  {
    title: "12. Legislação Aplicável",
    content: `Estes Termos de Uso são regidos pelas leis brasileiras. Qualquer disputa será submetida ao foro da comarca de São Paulo — SP, com renúncia expressa a qualquer outro foro, por mais privilegiado que seja.

Para dúvidas ou questões jurídicas, entre em contato pelo e-mail: juridico@rosecrm.com.br`,
  },
];

export default function TermosPage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Termos de Uso
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Última atualização: 1º de maio de 2026 · Vigência imediata
        </p>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
          Leia estes termos com atenção antes de utilizar o Bloom. Eles definem seus direitos e obrigações ao usar nossa plataforma.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              {section.title}
            </h2>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-12 p-5 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Dúvidas sobre os Termos?</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Entre em contato pelo e-mail{" "}
          <a href="mailto:juridico@rosecrm.com.br" className="text-rose-500 hover:underline font-medium">
            juridico@rosecrm.com.br
          </a>{" "}
          ou acesse nossa página de{" "}
          <a href="/suporte" className="text-rose-500 hover:underline font-medium">
            suporte
          </a>
          .
        </p>
      </div>
    </div>
  );
}
