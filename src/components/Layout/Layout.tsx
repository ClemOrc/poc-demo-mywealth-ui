import React, { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Badge, Container } from '@mui/material';
import { Notifications as NotificationsIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useAppContext } from '@contexts/AppContext';
import { COLORS } from '@/constants';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { notifications } = useAppContext();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Agreement Management
          </Typography>
          <IconButton
            size="large"
            aria-label={`show ${unreadCount} new notifications`}
            color="inherit"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: COLORS.BACKGROUND_LIGHT,
          borderTop: `1px solid ${COLORS.BORDER_GRAY}`,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Agreement Management System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;