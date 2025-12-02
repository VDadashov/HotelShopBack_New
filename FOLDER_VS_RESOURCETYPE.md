# Folder vs ResourceType Fərqi

## Folder (Qovluq Strukturu)

**Folder** bizim təşkil etdiyimiz qovluq strukturudur. Cloudinary-də faylları təşkil etmək üçün istifadə olunur.

### Nümunələr:
```
hotelshop/images/1764608698070-364854808.png
hotelshop/pdfs/document-123.pdf
hotelshop/videos/video-456.mp4
```

### Məqsəd:
- Faylları məntiqi qruplara bölmək
- Asan tapmaq və idarə etmək
- Təşkilat və struktur yaratmaq

---

## ResourceType (Cloudinary Texniki Tipi)

**ResourceType** Cloudinary-in öz sistemidir. Cloudinary faylları 3 əsas tipə bölür:

### 1. `image` - Şəkillər
- JPG, PNG, GIF, WebP və s.
- Transformasiya dəstəyi (resize, crop, filter və s.)
- Optimizasiya imkanları

### 2. `video` - Videolar
- MP4, WebM, AVI, MKV və s.
- Video transformasiya dəstəyi
- Streaming imkanları

### 3. `raw` - Digər Fayllar
- PDF, DOC, TXT və s.
- Transformasiya dəstəyi yoxdur
- Sadəcə storage kimi istifadə olunur

---

## Fərq

| Xüsusiyyət | Folder | ResourceType |
|------------|--------|--------------|
| **Məqsəd** | Təşkilat | Texniki təsnifat |
| **Kim təyin edir** | Biz (developer) | Cloudinary |
| **Nümunə** | `hotelshop/images` | `image` |
| **Dəyişdirilə bilər** | Bəli | Xeyr (Cloudinary təyin edir) |
| **İstifadə** | Təşkilat üçün | API çağırışları üçün |

---

## Praktik Nümunələr

### Nümunə 1: Şəkil yükləmək
```typescript
// Folder: hotelshop/images
// ResourceType: image (avtomatik)
await uploadService.saveFile(file, 'images');
// Result: hotelshop/images/123.png (resourceType: image)
```

### Nümunə 2: Video yükləmək
```typescript
// Folder: hotelshop/videos
// ResourceType: video (avtomatik)
await uploadService.saveFile(file, 'videos');
// Result: hotelshop/videos/456.mp4 (resourceType: video)
```

### Nümunə 3: PDF yükləmək
```typescript
// Folder: hotelshop/pdfs
// ResourceType: raw (PDF olduğu üçün)
await uploadService.saveFile(file, 'pdfs');
// Result: hotelshop/pdfs/doc.pdf (resourceType: raw)
```

---

## GET Request-də İstifadə

### Yalnız folder ilə:
```bash
GET /api/upload?folder=images
# Bütün hotelshop/images qovluğundakı faylları gətirir
# Amma resourceType avtomatik 'image' olacaq
```

### Yalnız resourceType ilə:
```bash
GET /api/upload?resourceType=image
# Bütün image tipli faylları gətirir
# hotelshop/images, hotelshop/pdfs və s. hamısından
```

### Hər ikisi ilə:
```bash
GET /api/upload?folder=images&resourceType=image
# Yalnız hotelshop/images qovluğundakı image tipli faylları gətirir
# Ən dəqiq filter
```

---

## Qeyd

**PDF-lər üçün:**
- Folder: `hotelshop/pdfs` ✅
- ResourceType: `raw` ✅ (çünki PDF image və ya video deyil)

**Şəkillər üçün:**
- Folder: `hotelshop/images` ✅
- ResourceType: `image` ✅

**Videolar üçün:**
- Folder: `hotelshop/videos` ✅
- ResourceType: `video` ✅

---

## Xülasə

- **Folder** = Bizim təşkilatımız (qovluq strukturumuz)
- **ResourceType** = Cloudinary-in texniki təsnifatı (image/video/raw)

Hər ikisi birlikdə istifadə olunanda ən dəqiq filter alınır! 🎯

