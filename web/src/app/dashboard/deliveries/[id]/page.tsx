import { Metadata } from 'next';
import { DeliveryDetailView } from '@/sections/deliveries';

export const metadata: Metadata = {
  title: 'Delivery Details | Kenix Commodities',
  description: 'View detailed information about a specific delivery'
};

interface DeliveryDetailPageProps {
  params: {
    id: string;
  };
}

export default function DeliveryDetailPage({ params }: DeliveryDetailPageProps) {
  return <DeliveryDetailView deliveryId={params.id} />;
}
