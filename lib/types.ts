export type ClientStatus = "ativa" | "inativa" | "prospect";
export type OrderStatus = "pendente" | "confirmado" | "entregue" | "cancelado";

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  status: ClientStatus;
  notes?: string;
  birthday?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  cost_price: number;
  sale_price: number;
  stock: number;
  description?: string;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  client_id: string;
  client_name: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  delivered_at?: string;
}

export interface ScheduleEvent {
  id: string;
  client_id: string;
  client_name: string;
  type: "follow_up" | "entrega" | "aniversario" | "outro";
  title: string;
  description?: string;
  date: string;
  completed: boolean;
}

export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  total_orders: number;
  revenue_month: number;
  revenue_prev_month: number;
  pending_orders: number;
  top_products: { name: string; quantity: number; revenue: number }[];
  monthly_revenue: { month: string; revenue: number }[];
}
