'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  Store,
  Inventory2,
  Category,
  ShoppingCart,
  Route,
  MyLocation,
  LocalShipping,
  Assessment,
  TwoWheeler,
  SupportAgent,
  Payments,
  Warehouse,
  AccountBalance,
  Analytics,
  Settings,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';

const DRAWER_WIDTH = 280;

const menuItems = [
  {
    title: 'Overview',
    path: '/dashboard',
    icon: <Dashboard />,
  },
  {
    title: 'Shops',
    path: '/dashboard/shops',
    icon: <Store />,
  },
  {
    title: 'Products',
    path: '/dashboard/products',
    icon: <Inventory2 />,
  },
  {
    title: 'Categories',
    path: '/dashboard/categories',
    icon: <Category />,
  },
  {
    title: 'Orders',
    path: '/dashboard/orders',
    icon: <ShoppingCart />,
  },
  {
    title: 'Routes',
    path: '/dashboard/routes',
    icon: <Route />,
  },
  {
    title: 'Live Tracking',
    path: '/dashboard/tracking',
    icon: <MyLocation />,
  },
  {
    title: 'Deliveries',
    path: '/dashboard/deliveries',
    icon: <LocalShipping />,
  },
  {
    title: 'Riders',
    path: '/dashboard/riders',
    icon: <TwoWheeler />,
  },
  {
    title: 'Sales Agents',
    path: '/dashboard/sales-agents',
    icon: <SupportAgent />,
  },
  {
    title: 'Payments',
    path: '/dashboard/payments',
    icon: <Payments />,
  },
  {
    title: 'Inventory',
    path: '/dashboard/inventory',
    icon: <Warehouse />,
  },
  {
    title: 'Loans',
    path: '/dashboard/loans',
    icon: <AccountBalance />,
  },
  {
    title: 'Analytics',
    path: '/dashboard/analytics',
    icon: <Analytics />,
  },
  {
    title: 'Reports',
    path: '/dashboard/reports',
    icon: <Assessment />,
  },
  {
    title: 'Settings',
    path: '/dashboard/settings',
    icon: <Settings />,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Kenix
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Commodities Admin
        </Typography>
      </Box>

      <Divider />

      {/* User Info */}
      {user && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user.firstName[0]}
            {user.lastName[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="medium">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
