import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  People,
  Business,
  LocalOffer,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
  TrendingUp,
  Warning,
  Notifications,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/',
  },
  {
    text: 'Produtos',
    icon: <Inventory />,
    children: [
      { text: 'Todos os Produtos', icon: <Inventory />, path: '/produtos' },
      { text: 'Próximos ao Vencimento', icon: <Warning />, path: '/produtos?filter=near_expiry' },
      { text: 'Estoque Baixo', icon: <TrendingUp />, path: '/produtos?filter=low_stock' },
    ],
  },
  {
    text: 'Funcionários',
    icon: <People />,
    path: '/funcionarios',
  },
  {
    text: 'Setores',
    icon: <Business />,
    path: '/setores',
  },
  {
    text: 'Promoções',
    icon: <LocalOffer />,
    children: [
      { text: 'Todas as Promoções', icon: <LocalOffer />, path: '/promocoes' },
      { text: 'Sugestões Automáticas', icon: <TrendingUp />, path: '/promocoes/sugestoes' },
    ],
  },
  {
    text: 'Relatórios',
    icon: <Assessment />,
    children: [
      { text: 'Dashboard de Vendas', icon: <Assessment />, path: '/relatorios/vendas' },
      { text: 'Relatório de Perdas', icon: <Warning />, path: '/relatorios/perdas' },
      { text: 'Eficácia de Promoções', icon: <TrendingUp />, path: '/relatorios/promocoes' },
    ],
  },
  {
    text: 'Notificações',
    icon: <Notifications />,
    path: '/notificacoes',
  },
  {
    text: 'Configurações',
    icon: <Settings />,
    path: '/configuracoes',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      const isExpanded = expandedItems.includes(item.text);
      if (isExpanded) {
        setExpandedItems(expandedItems.filter(text => text !== item.text));
      } else {
        setExpandedItems([...expandedItems, item.text]);
      }
    } else if (item.path) {
      navigate(item.path);
      if (window.innerWidth < 1200) {
        onClose();
      }
    }
  };

  const isSelected = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            selected={item.path ? isSelected(item.path) : false}
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: item.path && isSelected(item.path) ? 'inherit' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {item.children &&
              (expandedItems.includes(item.text) ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {item.children && (
          <Collapse in={expandedItems.includes(item.text)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {renderNavItems(item.children, level + 1)}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    ));
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {renderNavItems(navItems)}
      </List>
      <Divider />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Box
          component="img"
          sx={{
            maxHeight: "80px",
            maxWidth: '200px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
          alt="LevaJá Logo"
          src="/levaja.png"
        />
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;