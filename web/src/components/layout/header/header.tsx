// src/components/layout/header/header.tsx
"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Products",
    path: "/products",
  },
  {
    title: "Services",
    path: "/services",
  },
  {
    title: "About",
    path: "/about",
  },
  {
    title: "Contact",
    path: "/contact",
  },
];

const PORTAL_LINKS = [
  {
    title: "Retailer",
    path: "/retailer/dashboard",
    icon: ShoppingBagIcon,
    color: "primary",
    description: "Access your orders & inventory",
  },
  {
    title: "Sales",
    path: "/sales/dashboard", 
    icon: TrendingUpIcon,
    color: "secondary",
    description: "Manage your sales pipeline",
  },
  {
    title: "Admin",
    path: "/admin/dashboard",
    icon: AdminPanelSettingsIcon,
    color: "info",
    description: "System administration",
  },
];

// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    // Handle navigation
    window.location.href = path;
    setMobileMenuOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 70, md: 80 } }}>
            {/* Logo */}
            <Box
              onClick={() => handleNavClick('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: { xs: 2, md: 4 },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                  }}
                >
                  K
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Kenix Commodities
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "none", lg: "flex" },
                flex: 1,
                justifyContent: "center",
              }}
            >
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.title}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: "text.primary",
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)',
                    },
                    "&:before": {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: theme.palette.primary.main,
                      transform: 'scaleX(0)',
                      transition: 'transform 0.3s ease',
                    },
                    "&:hover:before": {
                      transform: 'scaleX(1)',
                    },
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Stack>

            {/* Portal Links & CTA - Desktop */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
              }}
            >
              {PORTAL_LINKS.map((portal) => (
                <Button
                  key={portal.title}
                  variant="outlined"
                  size="small"
                  startIcon={<portal.icon sx={{ fontSize: 18 }} />}
                  onClick={() => handleNavClick(portal.path)}
                  sx={{
                    borderColor: `${portal.color}.main`,
                    color: `${portal.color}.main`,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    minWidth: "auto",
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    "&:hover": {
                      bgcolor: `${portal.color}.main`,
                      color: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette[portal.color as keyof typeof theme.palette]?.main || theme.palette.primary.main, 0.3)}`,
                    },
                  }}
                >
                  {portal.title}
                </Button>
              ))}

              <Button
                variant="contained"
                size="medium"
                sx={{
                  ml: 2,
                  bgcolor: "primary.main",
                  color: 'white',
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    bgcolor: "primary.dark",
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  },
                }}
                onClick={() => handleNavClick('/get-started')}
              >
                Get Started
              </Button>
            </Stack>

            {/* Mobile Menu Toggle */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{
                ml: 'auto',
                display: { xs: "flex", lg: "none" },
                color: 'text.primary',
                width: 44,
                height: 44,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                },
              }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: 300,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: '16px 0 0 16px',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Menu
            </Typography>
            <IconButton 
              onClick={() => setMobileMenuOpen(false)} 
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Navigation Links */}
          <List sx={{ px: 0 }}>
            {NAV_ITEMS.map((item) => (
              <ListItem 
                key={item.title} 
                sx={{ 
                  px: 0, 
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
                onClick={() => handleNavClick(item.path)}
              >
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          {/* Portal Links */}
          <Typography
            variant="subtitle2"
            sx={{ px: 0, py: 1, color: "text.secondary", fontWeight: 600, mb: 2 }}
          >
            Quick Access
          </Typography>

          <Stack spacing={2}>
            {PORTAL_LINKS.map((portal) => (
              <Button
                key={portal.title}
                fullWidth
                variant="outlined"
                size="medium"
                startIcon={<portal.icon />}
                onClick={() => handleNavClick(portal.path)}
                sx={{
                  justifyContent: "flex-start",
                  borderColor: `${portal.color}.main`,
                  color: `${portal.color}.main`,
                  py: 1.5,
                  px: 2,
                  textTransform: 'none',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: `${portal.color}.main`,
                    color: 'white',
                  },
                }}
              >
                <Stack alignItems="flex-start">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {portal.title} Portal
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {portal.description}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>

          {/* CTA Button */}
          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => handleNavClick('/get-started')}
              sx={{
                bgcolor: "primary.main",
                color: 'white',
                fontWeight: 700,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                textTransform: 'none',
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                },
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Spacer for fixed header */}
      <Toolbar sx={{ minHeight: { xs: 70, md: 80 } }} />
    </>
  );
}
