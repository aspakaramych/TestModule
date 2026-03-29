import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, MenuItem, Paper, Stack, IconButton, 
  Checkbox, FormControlLabel, FormGroup, alpha, useTheme, Grid, 
  Divider, Tooltip
} from '@mui/material';
import { Trash2, Plus, ChevronLeft, Save, Info, Sparkles, Utensils } from 'lucide-react';
import { getDishById, createDish, updateDish, getProducts } from '../api';
import type { DishCreateDto, ProductDto } from '../api/types';
import { DishCategory, DietaryFlags, DishCategoryLabels } from '../api/types';
import PhotoUpload from '../components/PhotoUpload';

const CATEGORY_MACROS: Record<string, typeof DishCategory[keyof typeof DishCategory]> = {
  '!десерт': DishCategory.Dessert,
  '!первое': DishCategory.FirstCourse,
  '!второе': DishCategory.SecondCourse,
  '!напиток': DishCategory.Drink,
  '!салат': DishCategory.Salad,
  '!суп': DishCategory.Soup,
  '!перекус': DishCategory.Snack,
};

export default function DishForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isEdit = Boolean(id);

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [form, setForm] = useState<DishCreateDto>({
    title: '',
    portionSize: 100,
    category: DishCategory.FirstCourse,
    ingredients: [],
    calories: 0,
    proteins: 0,
    fats: 0,
    carbohydrates: 0,
    photos: [],
    flags: DietaryFlags.None,
  });

  const [kbjuManual, setKbjuManual] = useState(false);

  useEffect(() => {
    getProducts({}).then(setProducts).catch(console.error);
    if (isEdit && id) {
      getDishById(id).then(data => {
        if (data) {
          setForm({
            title: data.title ?? '',
            portionSize: data.portionSize ?? 100,
            category: data.category,
            ingredients: data.ingredients ?? [],
            calories: Math.round(data.calories * 10) / 10,
            proteins: Math.round(data.proteins * 10) / 10,
            fats: Math.round(data.fats * 10) / 10,
            carbohydrates: Math.round(data.carbohydrates * 10) / 10,
            photos: data.photos ?? [],
            flags: data.flags,
          });
        }
      }).catch(console.error);
    }
  }, [id, isEdit]);

  const supportedFlags = useMemo(() => {
    if (!form.ingredients || form.ingredients.length === 0) return DietaryFlags.None;
    let isVegan = true, isGlutenFree = true, isSugarFree = true;

    form.ingredients.forEach(ing => {
      const p = products.find(prod => prod.id === ing.productId);
      if (p) {
        if (!(p.flags & DietaryFlags.Vegan)) isVegan = false;
        if (!(p.flags & DietaryFlags.GlutenFree)) isGlutenFree = false;
        if (!(p.flags & DietaryFlags.SugarFree)) isSugarFree = false;
      }
    });

    let flags = DietaryFlags.None;
    if (isVegan) flags |= DietaryFlags.Vegan;
    if (isGlutenFree) flags |= DietaryFlags.GlutenFree;
    if (isSugarFree) flags |= DietaryFlags.SugarFree;
    return flags;
  }, [form.ingredients, products]);

  useEffect(() => {
    const newFlags = form.flags & supportedFlags;
    if (newFlags !== form.flags) {
      setForm(prev => ({ ...prev, flags: (newFlags as DietaryFlags) }));
    }
  }, [supportedFlags, form.flags]);

  const processMacros = (title: string) => {
    let cleanTitle = title;
    let matchedCategory: typeof DishCategory[keyof typeof DishCategory] | null = null;
    for (const [macro, cat] of Object.entries(CATEGORY_MACROS)) {
      if (title.toLowerCase().includes(macro)) {
        if (matchedCategory === null) matchedCategory = cat;
        cleanTitle = cleanTitle.replace(new RegExp(macro.replace('!', '\\!'), 'gi'), '').trim();
      }
    }
    return { cleanTitle, category: matchedCategory };
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { cleanTitle, category } = processMacros(e.target.value);
    setForm(prev => ({ 
      ...prev, 
      title: cleanTitle, 
      ...(category !== null ? { category: category as DishCategory } : {}) 
    }));
  };

  const handleKbjuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKbjuManual(true);
    setForm(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
  };

  const bjuSumTotal = form.proteins + form.fats + form.carbohydrates;
  const bjuPer100 = form.portionSize > 0 ? (bjuSumTotal / form.portionSize) * 100 : 0;
  const isBjuInvalid = bjuPer100 > 100.1;

  const handleFlagChange = (flag: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      flags: (e.target.checked ? prev.flags | flag : prev.flags & ~flag) as DietaryFlags
    }));
  };

  useEffect(() => {
    if (kbjuManual) return;
    let cal = 0, p = 0, f = 0, c = 0;
    form.ingredients?.forEach(ing => {
      const prod = products.find(pr => pr.id === ing.productId);
      if (prod) {
        cal += (prod.calories * ing.amountInGrams) / 100;
        p += (prod.proteins * ing.amountInGrams) / 100;
        f += (prod.fats * ing.amountInGrams) / 100;
        c += (prod.carbohydrates * ing.amountInGrams) / 100;
      }
    });
    setForm(prev => ({
      ...prev,
      calories: Math.round(cal * 10) / 10,
      proteins: Math.round(p * 10) / 10,
      fats: Math.round(f * 10) / 10,
      carbohydrates: Math.round(c * 10) / 10,
    }));
  }, [form.ingredients, products, kbjuManual]);

  const handleAddIngredient = () => {
    if (products.length === 0) return;
    setKbjuManual(false);
    setForm(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { productId: products[0].id, amountInGrams: 100 }]
    }));
  };

  const updateIngredient = (index: number, productId: string, amountInGrams: number) => {
    setKbjuManual(false);
    const copy = [...(form.ingredients || [])];
    copy[index] = { productId, amountInGrams };
    setForm(prev => ({ ...prev, ingredients: copy }));
  };

  const removeIngredient = (index: number) => {
    setKbjuManual(false);
    setForm(prev => ({ ...prev, ingredients: (prev.ingredients || []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBjuInvalid) return;
    try {
      if (isEdit && id) {
        await updateDish(id, { ...form, id } as any);
      } else {
        await createDish(form);
      }
      navigate('/dishes');
    } catch (err: any) {
      alert(err.response?.data || 'Ошибка при сохранении.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 8 }}>
      <Button startIcon={<ChevronLeft size={18} />} onClick={() => navigate('/dishes')} sx={{ mb: 4, color: 'text.secondary' }}>
        Назад к блюдам
      </Button>

      <Typography variant="h3" sx={{ mb: 1 }}>{isEdit ? 'Обновить шедевр' : 'Новый рецепт'}</Typography>
      <Typography variant="body1" color="text.secondary" mb={6}>Сочетание ингредиентов и магия их превращения в блюдо</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Sparkles size={24} color={theme.palette.primary.main} />
                  Основные параметры
                </Typography>
                <Stack spacing={3}>
                  <TextField 
                    fullWidth required label="Название блюда" 
                    placeholder="Борщ (можно дописать !суп для авто-категории)" 
                    value={form.title ?? ''} onChange={handleTitleChange} 
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField select fullWidth label="Категория" value={form.category} onChange={(e) => setForm(p => ({...p, category: Number(e.target.value) as DishCategory}))}>
                       {Object.entries(DishCategoryLabels).map(([val, label]) => (
                        <MenuItem key={val} value={Number(val)}>{label}</MenuItem>
                      ))}
                    </TextField>
                    <TextField fullWidth type="number" label="Вес порции (г)" value={form.portionSize || ''} onChange={(e) => setForm(p => ({...p, portionSize: Number(e.target.value)}))} />
                  </Box>
                </Stack>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Utensils size={24} color={theme.palette.primary.main} />
                  Ингредиенты
                </Typography>
                <Stack spacing={2}>
                  {(form.ingredients || []).map((ing, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: alpha(theme.palette.background.default, 0.4), borderRadius: 3 }}>
                      <TextField select fullWidth label="Продукт" size="small" value={ing.productId} onChange={e => updateIngredient(i, e.target.value, ing.amountInGrams)}>
                        {products.map(p => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
                      </TextField>
                      <TextField type="number" label="Вес (г)" size="small" sx={{ width: 120 }} value={ing.amountInGrams || ''} onChange={e => updateIngredient(i, ing.productId, Number(e.target.value))} />
                      <IconButton color="error" onClick={() => removeIngredient(i)}><Trash2 size={18} /></IconButton>
                    </Box>
                  ))}
                  <Button variant="outlined" fullWidth startIcon={<Plus size={18} />} onClick={handleAddIngredient} sx={{ border: '2px dashed ' + alpha(theme.palette.divider, 0.2), py: 1.5, borderRadius: 3 }}>
                    Добавить ингредиент
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Внешний вид</Typography>
                <PhotoUpload photos={form.photos ?? []} onChange={(photos) => setForm(p => ({...p, photos}))} />
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 4, bgcolor: kbjuManual ? alpha(theme.palette.warning.main, 0.05) : 'background.paper' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Итоговый КБЖУ</Typography>
                  {kbjuManual && (
                     <Tooltip title="Сбросить до авто-расчета">
                        <IconButton size="small" onClick={() => setKbjuManual(false)}><Sparkles size={16} /></IconButton>
                     </Tooltip>
                  )}
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField fullWidth type="number" label="Калории (ккал)" name="calories" value={form.calories || ''} onChange={handleKbjuChange} />
                  </Grid>
                  <Grid size={4}><TextField fullWidth type="number" label="Белки" name="proteins" value={form.proteins || ''} onChange={handleKbjuChange} error={isBjuInvalid} /></Grid>
                  <Grid size={4}><TextField fullWidth type="number" label="Жиры" name="fats" value={form.fats || ''} onChange={handleKbjuChange} error={isBjuInvalid} /></Grid>
                  <Grid size={4}><TextField fullWidth type="number" label="Углев." name="carbohydrates" value={form.carbohydrates || ''} onChange={handleKbjuChange} error={isBjuInvalid} /></Grid>
                </Grid>

                {isBjuInvalid && (
                   <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2, display: 'flex', gap: 1 }}>
                      <Info size={16} color={theme.palette.error.main} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Typography variant="caption" color="error.main" fontWeight={600}>
                        Плотность БЖУ выше 100%! Проверьте вес порции ({form.portionSize}г) или ингредиенты.
                      </Typography>
                   </Box>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Диетические свойства</Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={<Checkbox checked={Boolean(form.flags & DietaryFlags.Vegan)} onChange={handleFlagChange(DietaryFlags.Vegan)} disabled={!(supportedFlags & DietaryFlags.Vegan)} />} 
                    label="Веган" 
                  />
                  <FormControlLabel 
                    control={<Checkbox checked={Boolean(form.flags & DietaryFlags.GlutenFree)} onChange={handleFlagChange(DietaryFlags.GlutenFree)} disabled={!(supportedFlags & DietaryFlags.GlutenFree)} />} 
                    label="Без глютена" 
                  />
                  <FormControlLabel 
                    control={<Checkbox checked={Boolean(form.flags & DietaryFlags.SugarFree)} onChange={handleFlagChange(DietaryFlags.SugarFree)} disabled={!(supportedFlags & DietaryFlags.SugarFree)} />} 
                    label="Без сахара" 
                  />
                </FormGroup>
              </Paper>

              <Button 
                type="submit" variant="contained" size="large" fullWidth disabled={isBjuInvalid} startIcon={<Save size={20} />}
                sx={{ py: 2, borderRadius: 4, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' }, boxShadow: `0 8px 24px -6px ${alpha(theme.palette.secondary.main, 0.5)}` }}
              >
                Сохранить рецепт
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
