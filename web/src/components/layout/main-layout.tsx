// src/components/layout/main-layout.tsx - SIMPLIFIED (no duplicate theme providers)
'use client';

import Box from '@mui/material/Box';
import Header from './header/header';
import Footer from './footer/footer';

// ----------------------------------------------------------------------

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
      
      <Footer />
    </Box>
  );
}