import React, { useState } from 'react';
import { 
  Dialog, DialogContent, Typography, Box, IconButton, Stack, Grid, 
  Chip, Divider, alpha, useTheme
} from '@mui/material';
import { X, Flame, ShieldCheck, Info } from 'lucide-react';
import { DietaryFlags } from '../api/types';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  photos?: string[];
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  description?: string;
  flags?: number;
  categoryName?: string;
  ingredients?: { productName: string; amount: number }[];
}

export default function DetailsModal({
  open, onClose, title, photos, calories, proteins, fats, carbohydrates, 
  description, flags, categoryName, ingredients
}: DetailsModalProps) {
  const theme = useTheme();
  const hasPhotos = photos && photos.length > 0;
  const [photoIdx, setPhotoIdx] = useState(0);

  // Сброс индекса при открытии/смене фото
  React.useEffect(() => { setPhotoIdx(0); }, [open, photos]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(16px)',
          backgroundImage: 'none',
          boxShadow: `0 24px 48px -12px rgba(0,0,0,0.5)`,
          border: '1px solid ' + alpha(theme.palette.divider, 0.1)
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 10,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(10px)',
            '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.8) }
          }}
        >
          <X size={20} />
        </IconButton>

        <Grid container>
          {hasPhotos && (
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ 
                height: { xs: 240, md: 320 }, 
                width: '100%',
                maxWidth: 400, 
                mx: 'auto',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.background.default, 0.5),
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[2]
              }}>
                <Box 
                  component="img"
                  src={`data:image/jpeg;base64,${photos[photoIdx]}`}
                  sx={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                    borderRadius: 2
                  }}
                />
                {photos.length > 1 && (
                  <Box sx={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1 }}>
                    {photos.map((_, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setPhotoIdx(idx)}
                        sx={{
                          width: 12, height: 12, borderRadius: '50%',
                          bgcolor: idx === photoIdx ? 'primary.main' : 'grey.400',
                          border: idx === photoIdx ? '2px solid white' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: idx === photoIdx ? theme.shadows[2] : undefined
                        }}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 20, 
                  left: 20, 
                  px: 1.5, 
                  py: 0.5, 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  borderRadius: 1.5,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  boxShadow: theme.shadows[4]
                }}>
                  {categoryName}
                </Box>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: hasPhotos ? 7 : 12 }}>
            <DialogContent sx={{ p: { xs: 4, md: 6 } }}>
              {!hasPhotos && categoryName && (
                <Chip 
                  label={categoryName} 
                  color="primary" 
                  size="small" 
                  sx={{ mb: 2, fontWeight: 700, borderRadius: 1.5 }} 
                />
              )}
              
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>
                {title}
              </Typography>
              
              <Stack direction="row" spacing={1} mb={4}>
                {Boolean(flags && (flags & DietaryFlags.Vegan)) && <Chip label="Веган" color="success" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />}
                {Boolean(flags && (flags & DietaryFlags.GlutenFree)) && <Chip label="Без Глют." color="warning" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />}
                {Boolean(flags && (flags & DietaryFlags.SugarFree)) && <Chip label="Без Сах." color="info" size="small" variant="outlined" sx={{ borderRadius: 1.5 }} />}
              </Stack>

              <Box sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3, mb: 4 }}>
                <Stack 
                  direction="row" 
                  spacing={4} 
                  justifyContent="center"
                  divider={<Divider orientation="vertical" flexItem sx={{ opacity: 0.1, my: 1 }} />}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={0.5}>
                      <Flame size={18} color={theme.palette.secondary.main} />
                      <Typography variant="h4" fontWeight={800}>{calories}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Калории</Typography>
                  </Box>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">{proteins}г</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Белки</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">{fats}г</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Жиры</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">{carbohydrates}г</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Углев.</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>

              {description && (
                <Box sx={{ mb: 4 }}>
                   <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                    <Info size={18} color={theme.palette.primary.main} />
                    <Typography variant="subtitle1" fontWeight={700}>Описание</Typography>
                  </Stack>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {description}
                  </Typography>
                </Box>
              )}

              {ingredients && ingredients.length > 0 && (
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <ShieldCheck size={18} color={theme.palette.primary.main} />
                    <Typography variant="subtitle1" fontWeight={700}>Ингредиенты</Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {ingredients.map((ing, i) => (
                      <Box key={i} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        bgcolor: alpha(theme.palette.divider, 0.03), 
                        borderRadius: 2,
                        '&:hover': { bgcolor: alpha(theme.palette.divider, 0.05) }
                      }}>
                        <Typography variant="body2" fontWeight={600}>{ing.productName}</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={800}>{ing.amount} г</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </DialogContent>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}
