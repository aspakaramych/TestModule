import React, { useState, useEffect, useMemo } from 'react';
import { 
  Button, Typography, Box, Paper, IconButton, TextField, MenuItem, Select, 
  FormControl, Stack, Grid, Card, CardMedia, CardContent,
  alpha, useTheme, Chip, InputAdornment, Tooltip
} from '@mui/material';
import { Plus, Edit2, Trash2, Search, ArrowUpDown, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../api';
import type { ProductDto } from '../api/types';
import { ProductCategory, DietaryFlags, ProductCategoryLabels, CookingNecessity } from '../api/types';
import DetailsModal from '../components/DetailsModal';

export default function Products() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | number>('');
  const [necessity, setNecessity] = useState<string | number>('');
  const [flags, setFlags] = useState<number>(0);
  const [sortBy, setSortBy] = useState('title');

  const fetchProducts = useMemo(() => async () => {
    try {
      const selectedFlags = [];
      if (flags & DietaryFlags.Vegan) selectedFlags.push('Vegan');
      if (flags & DietaryFlags.GlutenFree) selectedFlags.push('GlutenFree');
      if (flags & DietaryFlags.SugarFree) selectedFlags.push('SugarFree');

      const data = await getProducts({ 
        query, 
        category: category || undefined, 
        necessity: necessity || undefined,
        flags: selectedFlags.length > 0 ? selectedFlags.join(',') : undefined,
        sort: sortBy
      });
      setProducts(data);
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  }, [query, category, necessity, flags, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFlag = (flag: number) => {
    setFlags(prev => prev ^ flag);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Удалить этот продукт?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data || 'Ошибка при удалении продукта.');
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/products/edit/${id}`);
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>Продукты</Typography>
          <Typography variant="body1" color="text.secondary">Управление вашей базой ингредиентов</Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<Plus size={20} />} 
          onClick={() => navigate('/products/new')}
          sx={{ boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.4)}` }}
        >
          Новый продукт
        </Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 6, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(10px)' }}>
        <TextField
          placeholder="Поиск ингредиентов..."
          size="medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '250px' }}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            )
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="medium" sx={{ minWidth: 160 }}>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Все категории</MenuItem>
              {Object.entries(ProductCategoryLabels).map(([val, label]) => (
                <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="medium" sx={{ minWidth: 160 }}>
            <Select 
              value={necessity} 
              onChange={(e) => setNecessity(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Любая готовка</MenuItem>
              <MenuItem value={CookingNecessity.ReadyToEat}>Готовый</MenuItem>
              <MenuItem value={CookingNecessity.SemiFinished}>Полуфабрикат</MenuItem>
              <MenuItem value={CookingNecessity.RequiresCooking}>Готовить</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label="Веган" 
              size="medium" 
              onClick={() => toggleFlag(DietaryFlags.Vegan)}
              color={flags & DietaryFlags.Vegan ? "success" : "default"}
              variant={flags & DietaryFlags.Vegan ? "filled" : "outlined"}
              sx={{ borderRadius: 2 }}
            />
            <Chip 
              label="Без Глют." 
              size="medium" 
              onClick={() => toggleFlag(DietaryFlags.GlutenFree)}
              color={flags & DietaryFlags.GlutenFree ? "warning" : "default"}
              variant={flags & DietaryFlags.GlutenFree ? "filled" : "outlined"}
              sx={{ borderRadius: 2 }}
            />
            <Chip 
              label="Без Сах." 
              size="medium" 
              onClick={() => toggleFlag(DietaryFlags.SugarFree)}
              color={flags & DietaryFlags.SugarFree ? "info" : "default"}
              variant={flags & DietaryFlags.SugarFree ? "filled" : "outlined"}
              sx={{ borderRadius: 2 }}
            />
          </Stack>

          <FormControl size="medium" sx={{ minWidth: 160 }}>
            <Select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={<ArrowUpDown size={18} style={{ marginRight: 8, opacity: 0.6 }} />}
            >
              <MenuItem value="title">По алфавиту</MenuItem>
              <MenuItem value="calories">По калориям</MenuItem>
              <MenuItem value="proteins">Белки</MenuItem>
              <MenuItem value="fats">Жиры</MenuItem>
              <MenuItem value="carbohydrates">Углеводы</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>


      <Grid container spacing={3}>
        {products.length === 0 && (
          <Grid size={12}>
            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
              <Package size={64} style={{ marginBottom: 16 }} />
              <Typography variant="h5">Продукты не найдены</Typography>
            </Box>
          </Grid>
        )}
        {products.map((p) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[4],
                  '& .actions': { opacity: 1 }
                }
              }}
              onClick={() => setSelectedProduct(p)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={p.photos && p.photos.length > 0 ? `data:image/jpeg;base64,${p.photos[0]}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                  alt={p.title || ''}
                  sx={{ objectFit: 'cover' }}
                />
                <Box 
                  className="actions" 
                  sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    right: 12, 
                    display: 'flex', 
                    gap: 1, 
                    opacity: 0, 
                    transition: 'opacity 0.2s ease'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Редактировать">
                    <IconButton size="small" sx={{ bgcolor: 'background.paper' }} onClick={(e) => handleEdit(p.id, e)}><Edit2 size={16} /></IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }} onClick={(e) => handleDelete(p.id, e)}><Trash2 size={16} /></IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  p: 2, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                  color: 'white'
                }}>
                  <Typography variant="subtitle1" noWrap fontWeight={700}>{p.title}</Typography>
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                <Stack spacing={1.5}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">{ProductCategoryLabels[p.category]}</Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>{p.calories} <Typography component="span" variant="caption">ккал</Typography></Typography>
                  </Box>
                  
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {Boolean(p.flags & DietaryFlags.Vegan) && <Chip size="small" label="Веган" color="success" variant="outlined" sx={{ borderRadius: 1 }} />}
                    {Boolean(p.flags & DietaryFlags.GlutenFree) && <Chip size="small" label="Без Глют." color="warning" variant="outlined" sx={{ borderRadius: 1 }} />}
                    {Boolean(p.flags & DietaryFlags.SugarFree) && <Chip size="small" label="Без Сах." color="info" variant="outlined" sx={{ borderRadius: 1 }} />}
                  </Box>

                  <Grid container spacing={1}>
                    <Grid size={4}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="h6" fontSize="0.9rem" fontWeight={700}>{p.proteins}г</Typography>
                        <Typography variant="caption" color="text.secondary">Белки</Typography>
                      </Box>
                    </Grid>
                    <Grid size={4}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="h6" fontSize="0.9rem" fontWeight={700}>{p.fats}г</Typography>
                        <Typography variant="caption" color="text.secondary">Жиры</Typography>
                      </Box>
                    </Grid>
                    <Grid size={4}>
                      <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                        <Typography variant="h6" fontSize="0.9rem" fontWeight={700}>{p.carbohydrates}г</Typography>
                        <Typography variant="caption" color="text.secondary">Углев.</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedProduct && (
        <DetailsModal 
          open={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          title={selectedProduct.title ?? ''}
          photos={selectedProduct.photos ?? undefined}
          calories={selectedProduct.calories}
          proteins={selectedProduct.proteins}
          fats={selectedProduct.fats}
          carbohydrates={selectedProduct.carbohydrates}
          description={selectedProduct.description ?? undefined}
          flags={selectedProduct.flags}
          categoryName={ProductCategoryLabels[selectedProduct.category]}
          dateCreated={selectedProduct.dateCreated}
          dateModified={selectedProduct.dateModified}
        />
      )}
    </Box>
  );
}
