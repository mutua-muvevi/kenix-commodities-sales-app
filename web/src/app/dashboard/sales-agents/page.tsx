import type { Metadata } from 'next';
import { SalesAgentsListView } from '@/sections/sales-agents';

export const metadata: Metadata = {
  title: 'Sales Agents Management | Kenix Commodities',
  description: 'Manage sales agents, track performance, and monitor commissions',
};

export default function SalesAgentsPage() {
  return <SalesAgentsListView />;
}
