import React, { useState, useEffect, useMemo } from 'react';
import { 
  Button, Typography, Box, Paper, IconButton, TextField, MenuItem, Select, 
  FormControl, Stack, Grid, Card, CardMedia, CardContent,
  alpha, useTheme, Chip, InputAdornment, Tooltip
} from '@mui/material';
import { Plus, Edit2, Trash2, Search, Filter, Utensils, Eye, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDishes, deleteDish, getProducts } from '../api';
import type { DishDto, ProductDto, DishIngredientDto } from '../api/types';
import { DishCategory, DietaryFlags, DishCategoryLabels } from '../api/types';
import DetailsModal from '../components/DetailsModal';

export default function Dishes() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [dishes, setDishes] = useState<DishDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishDto | null>(null);
  
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('');

  const fetchDishes = useMemo(() => async () => {
    try {
      const data = await getDishes({ 
        query, 
        category: category || undefined, 
        flags: undefined
      });
      setDishes(data);
    } catch (e) {
      console.error(e);
      setDishes([]);
    }
  }, [query, category]);

  useEffect(() => {
    getProducts({}).then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Удалить это блюдо?')) return;
    try {
      await deleteDish(id);
      fetchDishes();
    } catch {
      alert('Ошибка при удалении блюда.');
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dishes/edit/${id}`);
  };

  const modalIngredients = useMemo(() => {
    if (!selectedDish || !selectedDish.ingredients) return [];
    return selectedDish.ingredients.map((ing: DishIngredientDto) => {
      const p = products.find((prod: ProductDto) => prod.id === ing.productId);
      return {
        productName: p?.title || 'Неизвестный продукт',
        amount: ing.amountInGrams
      };
    });
  }, [selectedDish, products]);

  return (
    <Box sx={{ pb: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>Блюда</Typography>
          <Typography variant="body1" color="text.secondary">Ваша коллекция кулинарных шедевров</Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large"
          color="secondary"
          startIcon={<Plus size={20} />} 
          onClick={() => navigate('/dishes/new')}
          sx={{ boxShadow: `0 8px 16px -4px ${alpha(theme.palette.secondary.main, 0.4)}` }}
        >
          Создать блюдо
        </Button>
      </Stack>

      <Paper sx={{ p: 3, mb: 6, borderRadius: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Поиск блюд..."
          size="medium"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '300px' }}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            )
          }}
        />
        
        <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
          <FormControl size="medium" sx={{ minWidth: 200 }}>
            <Select 
              value={category} 
              onChange={(e: any) => setCategory(e.target.value)}
              displayEmpty
              startAdornment={<Filter size={18} style={{ marginRight: 8, opacity: 0.6 }} />}
            >
              <MenuItem value="">Все категории</MenuItem>
              {Object.entries(DishCategoryLabels).map(([val, label]) => (
                <MenuItem key={val} value={Object.keys(DishCategory).find(k => (DishCategory as any)[k] === Number(val))}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Grid container spacing={4}>
        {dishes.length === 0 && (
          <Grid size={12}>
            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
              <Utensils size={64} style={{ marginBottom: 16 }} />
              <Typography variant="h5">Блюда не найдены</Typography>
            </Box>
          </Grid>
        )}
        {dishes.map((d) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={d.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-12px)',
                  boxShadow: theme.shadows[4],
                  '& .actions': { opacity: 1 }
                }
              }}
              onClick={() => setSelectedDish(d)}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="240"
                  image={d.photos && d.photos.length > 0 ? `data:image/jpeg;base64,${d.photos[0]}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                  alt={d.title || ''}
                  sx={{ 
                    transition: 'transform 0.5s ease',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
                
                <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                  <Chip 
                    label={DishCategoryLabels[d.category]} 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.background.paper, 0.8), 
                      backdropFilter: 'blur(4px)',
                      fontWeight: 700
                    }} 
                  />
                </Box>

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
                    <IconButton size="small" sx={{ bgcolor: 'background.paper' }} onClick={(e) => handleEdit(d.id, e)}><Edit2 size={16} /></IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }} onClick={(e) => handleDelete(d.id, e)}><Trash2 size={16} /></IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  p: 3, 
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h5" noWrap fontWeight={800} sx={{ mb: 0.5 }}>{d.title}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PieChart size={14} color={theme.palette.primary.main} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>
                      {d.calories} ккал <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>(на порцию)</Typography>
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                <Stack spacing={2.5}>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {Boolean(d.flags & DietaryFlags.Vegan) && <Chip size="small" label="Веган" sx={{ border: '1px solid ' + theme.palette.success.main, color: 'success.main', bgcolor: 'transparent' }} />}
                    {Boolean(d.flags & DietaryFlags.GlutenFree) && <Chip size="small" label="Без Глют." sx={{ border: '1px solid ' + theme.palette.warning.main, color: 'warning.main', bgcolor: 'transparent' }} />}
                    {Boolean(d.flags & DietaryFlags.SugarFree) && <Chip size="small" label="Без Сах." sx={{ border: '1px solid ' + theme.palette.info.main, color: 'info.main', bgcolor: 'transparent' }} />}
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontSize="1.1rem" fontWeight={800}>{d.proteins}г</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>Белки</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontSize="1.1rem" fontWeight={800}>{d.fats}г</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>Жиры</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontSize="1.1rem" fontWeight={800}>{d.carbohydrates}г</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>Углев.</Typography>
                    </Box>
                  </Box>

                  <Button 
                    fullWidth 
                    variant="outlined" 
                    endIcon={<Eye size={16} />}
                    sx={{ borderRadius: 3, py: 1 }}
                  >
                    Посмотреть детали
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedDish && (
        <DetailsModal 
          open={!!selectedDish} 
          onClose={() => setSelectedDish(null)} 
          title={selectedDish.title ?? ''}
          photos={selectedDish.photos ?? undefined}
          calories={selectedDish.calories}
          proteins={selectedDish.proteins}
          fats={selectedDish.fats}
          carbohydrates={selectedDish.carbohydrates}
          flags={selectedDish.flags}
          categoryName={DishCategoryLabels[selectedDish.category]}
          ingredients={modalIngredients}
        />
      )}
    </Box>
  );
}
