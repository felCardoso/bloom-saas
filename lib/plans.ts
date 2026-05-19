export type PlanId = "free" | "pro" | "premium";

export interface PlanLimits {
  clients: number;        // -1 = ilimitado
  ordersPerMonth: number;
  products: number;
  events: number;
  messageTemplates: number;
}

export interface PlanFeatures {
  revenueChart: boolean;
  reportsBasic: boolean;
  reportsAdvanced: boolean;
  birthdayReminders: boolean;
  whatsappLink: boolean;
  stockAlerts: boolean;
  csvExport: boolean;
  multipleUsers: number;  // 0 = só o titular
  support: "community" | "email" | "priority";
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  badge?: string;
  limits: PlanLimits;
  features: PlanFeatures;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Grátis",
    price: 0,
    period: "",
    description: "Para quem está começando",
    limits: {
      clients: 30,
      ordersPerMonth: 20,
      products: 20,
      events: 15,
      messageTemplates: 5,
    },
    features: {
      revenueChart: false,
      reportsBasic: false,
      reportsAdvanced: false,
      birthdayReminders: false,
      whatsappLink: false,
      stockAlerts: false,
      csvExport: false,
      multipleUsers: 0,
      support: "community",
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 29,
    period: "/mês",
    description: "Para revendedoras em crescimento",
    badge: "Mais popular",
    limits: {
      clients: 200,
      ordersPerMonth: 150,
      products: 100,
      events: -1,
      messageTemplates: -1,
    },
    features: {
      revenueChart: true,
      reportsBasic: true,
      reportsAdvanced: false,
      birthdayReminders: true,
      whatsappLink: true,
      stockAlerts: true,
      csvExport: false,
      multipleUsers: 0,
      support: "email",
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 59,
    period: "/mês",
    description: "Para top revendedoras e times",
    limits: {
      clients: -1,
      ordersPerMonth: -1,
      products: -1,
      events: -1,
      messageTemplates: -1,
    },
    features: {
      revenueChart: true,
      reportsBasic: true,
      reportsAdvanced: true,
      birthdayReminders: true,
      whatsappLink: true,
      stockAlerts: true,
      csvExport: true,
      multipleUsers: 3,
      support: "priority",
    },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "premium"];

export const RESOURCE_LABELS: Record<string, string> = {
  clients: "clientes",
  ordersPerMonth: "pedidos este mês",
  products: "produtos",
  events: "eventos na agenda",
  messageTemplates: "templates de mensagem",
};

export const FEATURE_LABELS: Record<keyof PlanFeatures, string> = {
  revenueChart: "Gráfico de receita",
  reportsBasic: "Relatórios",
  reportsAdvanced: "Relatórios avançados",
  birthdayReminders: "Lembretes de aniversário",
  whatsappLink: "Link rápido para WhatsApp",
  stockAlerts: "Alertas de estoque baixo",
  csvExport: "Exportar dados (CSV)",
  multipleUsers: "Múltiplos usuários",
  support: "Suporte prioritário",
};
