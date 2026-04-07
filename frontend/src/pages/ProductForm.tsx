import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, MenuItem, Paper, Stack, Checkbox, 
  FormControlLabel, FormGroup, alpha, useTheme, Grid, Divider, IconButton
} from '@mui/material';
import { ChevronLeft, Save, Trash2, Info } from 'lucide-react';
import { getProductById, createProduct, updateProduct, deleteProduct } from '../api';
import type { ProductCreateDto } from '../api/types';
import { ProductCategory, CookingNecessity, DietaryFlags } from '../api/types';
import PhotoUpload from '../components/PhotoUpload';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ProductCreateDto>({
    title: '',
    calories: 0,
    proteins: 0,
    fats: 0,
    carbohydrates: 0,
    description: '',
    category: ProductCategory.Vegetables,
    necessity: CookingNecessity.ReadyToEat,
    flags: DietaryFlags.None,
    photos: []
  });

  useEffect(() => {
    if (isEdit && id) {
      getProductById(id).then(data => {
        if (data) setForm(data);
      }).catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['calories', 'proteins', 'fats', 'carbohydrates'].includes(name);
    
    setForm((prev: ProductCreateDto) => ({
      ...prev,
      [name]: isNumeric
        ? (value === '' ? '' : value) // Keep as string to allow clearing
        : value
    }));
  };

  const bjuSum = Number(form.proteins || 0) + Number(form.fats || 0) + Number(form.carbohydrates || 0);
  const isBjuInvalid = bjuSum > 100;


  const handleFlagChange = (flag: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: ProductCreateDto) => ({
      ...prev,
      flags: (e.target.checked ? prev.flags | flag : prev.flags & ~flag) as DietaryFlags
    }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setForm((prev: ProductCreateDto) => ({ ...prev, photos }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBjuInvalid) return;

    try {
      if (isEdit && id) {
        await updateProduct(id, { ...form, id } as any);
      } else {
        await createProduct(form);
      }
      navigate('/products');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data || 'Ошибка при сохранении продукта.');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Удалить этот продукт?')) return;
    try {
      await deleteProduct(id);
      navigate('/products');
    } catch (err: any) {
      alert(err.response?.data || 'Ошибка при удалении.');
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 8 }}>
      <Button 
        startIcon={<ChevronLeft size={18} />} 
        onClick={() => navigate('/products')}
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        Назад к продуктам
      </Button>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }}>
            {isEdit ? 'Редактирование' : 'Новый продукт'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Заполните данные о пищевой ценности и категориях
          </Typography>
        </Box>
        {isEdit && (
          <IconButton color="error" onClick={handleDelete} sx={{ mb: 1, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <Trash2 size={20} />
          </IconButton>
        )}
      </Stack>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Основная информация</Typography>
                <Stack spacing={3}>
                  <TextField 
                    fullWidth 
                    required 
                    label="Название продукта" 
                    name="title" 
                    value={form.title ?? ''} 
                    onChange={handleChange} 
                    inputProps={{ minLength: 2 }} 
                  />
                  <TextField 
                    fullWidth 
                    multiline 
                    rows={4} 
                    label="Описание или Состав" 
                    name="description" 
                    value={form.description ?? ''} 
                    onChange={handleChange} 
                  />
                </Stack>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: isBjuInvalid ? 'error.main' : 'inherit' }}>
                   Пищевая ценность (на 100г)
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      type="number" 
                      required 
                      label="Энергия (ккал)" 
                      name="calories" 
                      value={form.calories} 
                      onChange={handleChange} 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                     <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                        <Info size={20} color={theme.palette.info.main} />
                        <Typography variant="caption" color="text.secondary">
                          Сумма БЖУ не должна превышать 100г. Сейчас: {bjuSum}г
                        </Typography>
                     </Box>
                  </Grid>
                  <Grid size={4}>
                    <TextField fullWidth type="number" required label="Белки (г)" name="proteins" value={form.proteins} onChange={handleChange} error={isBjuInvalid} />
                  </Grid>
                  <Grid size={4}>
                    <TextField fullWidth type="number" required label="Жиры (г)" name="fats" value={form.fats} onChange={handleChange} error={isBjuInvalid} />
                  </Grid>
                  <Grid size={4}>
                    <TextField fullWidth type="number" required label="Углеводы (г)" name="carbohydrates" value={form.carbohydrates} onChange={handleChange} error={isBjuInvalid} />
                  </Grid>
                </Grid>
                {isBjuInvalid && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                    Ошибка: Сумма макронутриентов ({bjuSum}г) превышает 100г!
                  </Typography>
                )}
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Фотография</Typography>
                <PhotoUpload photos={form.photos ?? []} onChange={handlePhotosChange} />
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Классификация</Typography>
                <Stack spacing={3}>
                  <TextField fullWidth select label="Категория" name="category" value={form.category} onChange={handleChange}>
                    <MenuItem value={ProductCategory.Frozen}>Замороженный</MenuItem>
                    <MenuItem value={ProductCategory.Meat}>Мясной</MenuItem>
                    <MenuItem value={ProductCategory.Vegetables}>Овощи</MenuItem>
                    <MenuItem value={ProductCategory.Greens}>Зелень</MenuItem>
                    <MenuItem value={ProductCategory.Spices}>Специи</MenuItem>
                    <MenuItem value={ProductCategory.Cereals}>Крупы</MenuItem>
                    <MenuItem value={ProductCategory.Canned}>Консервы</MenuItem>
                    <MenuItem value={ProductCategory.Liquid}>Жидкость</MenuItem>
                    <MenuItem value={ProductCategory.Sweets}>Сладости</MenuItem>
                  </TextField>
                  <TextField fullWidth select label="Степень готовки" name="necessity" value={form.necessity} onChange={handleChange}>
                    <MenuItem value={CookingNecessity.ReadyToEat}>Готовый к употреблению</MenuItem>
                    <MenuItem value={CookingNecessity.SemiFinished}>Полуфабрикат</MenuItem>
                    <MenuItem value={CookingNecessity.RequiresCooking}>Требует приготовления</MenuItem>
                  </TextField>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Особенности</Typography>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={Boolean(form.flags & DietaryFlags.Vegan)} onChange={handleFlagChange(DietaryFlags.Vegan)} />} label="Веганский" />
                    <FormControlLabel control={<Checkbox checked={Boolean(form.flags & DietaryFlags.GlutenFree)} onChange={handleFlagChange(DietaryFlags.GlutenFree)} />} label="Без Глютена" />
                    <FormControlLabel control={<Checkbox checked={Boolean(form.flags & DietaryFlags.SugarFree)} onChange={handleFlagChange(DietaryFlags.SugarFree)} />} label="Без Сахара" />
                  </FormGroup>
                </Stack>
              </Paper>

              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                fullWidth
                disabled={isBjuInvalid}
                startIcon={<Save size={20} />}
                sx={{ py: 2, borderRadius: 4, boxShadow: `0 8px 24px -6px ${alpha(theme.palette.primary.main, 0.5)}` }}
              >
                {isEdit ? 'Обновить данные' : 'Создать и сохранить'}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
