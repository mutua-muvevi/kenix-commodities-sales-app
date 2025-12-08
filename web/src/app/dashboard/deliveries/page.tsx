import { Metadata } from 'next';
import { DeliveriesListView } from '../../../sections/deliveries';

export const metadata: Metadata = {
  title: 'Deliveries | Kenix Commodities',
  description: 'Manage and track all delivery operations'
};

export default function DeliveriesPage() {
  return <DeliveriesListView />;
}
