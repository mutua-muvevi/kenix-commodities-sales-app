import MainLayout from '@/components/layout/main-layout';
import { Typography, Container } from '@mui/material';
import { Iconify } from '@/components/iconify';
import { Logo } from '@/components/logo';

export default function TestPage() {
  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" gutterBottom>
          Test Page
        </Typography>
        
        <Logo variant="landscape" sx={{ mb: 4 }} />
        
        <Typography variant="h4" gutterBottom>
          Icon Test:
        </Typography>
        <Iconify icon="eva:home-fill" sx={{ fontSize: 48, color: 'primary.main' }} />
        
        <Typography variant="body1" sx={{ mt: 4 }}>
          All components are working correctly!
        </Typography>
      </Container>
    </MainLayout>
  );
}