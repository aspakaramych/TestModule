import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Typography, useTheme, alpha, Stack
} from '@mui/material';
import { Utensils, Package, ChefHat } from 'lucide-react';

const DRAWER_WIDTH = 280;

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: NavItemProps[] = [
  { label: 'Продукты', icon: <Package size={22} />, path: '/products' },
  { label: 'Блюда', icon: <Utensils size={22} />, path: '/dishes' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid ' + alpha(theme.palette.divider, 0.05),
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            px: 2,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 4, mb: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 3, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            display: 'flex'
          }}>
            <ChefHat size={32} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Книга Рецептов
          </Typography>
        </Stack>

        <List sx={{ px: 1 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: isActive ? 'primary.main' : 'inherit',
                    transition: 'color 0.3s ease'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.95rem'
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4, maxWidth: '1400px', margin: '0 auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
}
