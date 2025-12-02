# Cloudinary Setup

Bu layihə artıq Cloudinary istifadə edir faylları yükləmək üçün. Bu, şəkillərin, PDF-lərin və videoların serverdə qalmasını təmin edir.

## Tələb olunan Environment Variables

`.env` faylınıza aşağıdakı dəyişənləri əlavə edin:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Cloudinary Hesabı Yaratmaq

1. [Cloudinary](https://cloudinary.com/) saytına daxil olun və pulsuz hesab yaradın
2. Dashboard-da `Cloud Name`, `API Key` və `API Secret` məlumatlarını tapın
3. Bu məlumatları `.env` faylınıza əlavə edin

## Dəyişikliklər

- ✅ Bütün upload-lar artıq Cloudinary-ə yüklənir
- ✅ Local folder-də fayl saxlanılmır
- ✅ Şəkillər, PDF-lər və videolar Cloudinary-də saxlanılır
- ✅ Backend yenidən deploy olunanda fayllar silinməyəcək

## Modullar

Aşağıdakı modullar Cloudinary istifadə edir:
- Upload Module (images, pdfs, videos)
- Product Module
- Promo Module
- Testimonial Module

## Qeyd

Köhnə local upload-lar hələ də `public/uploads/` qovluğunda ola bilər. Onları təmizləmək istəsəniz, bu qovluğu silə bilərsiniz.

