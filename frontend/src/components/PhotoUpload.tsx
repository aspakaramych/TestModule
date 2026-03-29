import React, { useState } from 'react';
import { Box, Button, Typography, Stack, IconButton, Badge } from '@mui/material';
import { X, Upload } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxFiles?: number;
}

export default function PhotoUpload({ photos = [], onChange, maxFiles = 5 }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > maxFiles) {
      alert(`Вы можете добавить максимум ${maxFiles} фотографий`);
      return;
    }

    setLoading(true);
    const newPhotos: string[] = [...photos];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          const res = e.target?.result as string;
          const base64 = res.split(',')[1] || res;
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      newPhotos.push(await base64Promise);
    }

    onChange(newPhotos);
    setLoading(false);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        Фотографии ({photos.length} из {maxFiles})
      </Typography>
      
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {photos.map((base64, i) => (
          <Badge
            key={i}
            badgeContent={
              <IconButton 
                size="small" 
                onClick={() => removePhoto(i)}
                sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, p: 0.2 }}
              >
                <X size={12} />
              </IconButton>
            }
          >
            <Box
              component="img"
              src={`data:image/jpeg;base64,${base64}`}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1
              }}
            />
          </Badge>
        ))}

        {photos.length < maxFiles && (
          <Button
            component="label"
            variant="outlined"
            disabled={loading}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              borderStyle: 'dashed',
              flexDirection: 'column',
              gap: 0.5,
              textTransform: 'none',
              fontSize: '0.75rem',
              p: 0
            }}
          >
            <Upload size={20} />
            {loading ? '...' : 'Загрузить'}
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        )}
      </Stack>
    </Box>
  );
}
