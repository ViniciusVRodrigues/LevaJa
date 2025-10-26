import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  Warning,
  LocalOffer,
  AttachMoney,
} from '@mui/icons-material';
import { useDashboard } from '../hooks';
import { formatCurrency, formatNumber } from '../utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {change >= 0 ? (
                <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: change >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}.light`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ color: `${color}.main`, fontSize: 32 }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { data: metrics, isLoading: loadingMetrics } = useDashboard();

  if (loadingMetrics) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton variant="rectangular" height={120} key={i} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!metrics) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Quick Metrics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
        <MetricCard
          title="Total de Produtos"
          value={formatNumber(metrics.totalProducts)}
          change={5.2}
          icon={<Inventory />}
          color="primary"
        />
        <MetricCard
          title="Próximos ao Vencimento"
          value={formatNumber(metrics.nearExpiryProducts)}
          change={-12.5}
          icon={<Warning />}
          color="warning"
        />
        <MetricCard
          title="Promoções Ativas"
          value={formatNumber(metrics.activePromotions)}
          change={8.1}
          icon={<LocalOffer />}
          color="success"
        />
        <MetricCard
          title="Receita Mensal"
          value={formatCurrency(metrics.monthlyRevenue)}
          change={15.3}
          icon={<AttachMoney />}
          color="info"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bem-vindo ao Sistema LevaJá
          </Typography>
          <Typography variant="body1" paragraph>
            Este é o painel administrativo completo para gerenciamento de produtos, funcionários, 
            setores e promoções. Use a navegação lateral para acessar as diferentes funcionalidades.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Funcionalidades:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2">
              • Gerenciamento de Produtos e Controle de Vencimentos
            </Typography>
            <Typography component="li" variant="body2">
              • Cadastro e Gestão de Funcionários por Setores
            </Typography>
            <Typography component="li" variant="body2">
              • Motor de Promoções Automatizado
            </Typography>
            <Typography component="li" variant="body2">
              • Relatórios e Analytics Avançados
            </Typography>
            <Typography component="li" variant="body2">
              • Sistema de Notificações em Tempo Real
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;