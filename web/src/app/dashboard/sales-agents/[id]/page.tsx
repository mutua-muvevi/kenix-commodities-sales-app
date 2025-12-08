import type { Metadata } from 'next';
import { SalesAgentDetailView } from '@/sections/sales-agents';

export const metadata: Metadata = {
  title: 'Sales Agent Details | Kenix Commodities',
  description: 'View sales agent details, performance metrics, and commission tracking',
};

interface SalesAgentDetailPageProps {
  params: {
    id: string;
  };
}

export default function SalesAgentDetailPage({ params }: SalesAgentDetailPageProps) {
  return <SalesAgentDetailView agentId={params.id} />;
}
