# PublicId İstifadəsi

## PublicId nədir?

`publicId` Cloudinary-də faylın unikal identifikatorudur. Məsələn:
```
"publicId": "hotelshop/images/1764608698070-364854808"
```

## Nə üçün lazımdır?

### 1. Faylı silmək
Məhsul, kateqoriya və ya digər entity silinəndə, Cloudinary-dəki şəkli də silmək lazımdır:

```typescript
// Məhsul silinəndə
async remove(id: number) {
  const product = await this.productRepository.findOne({ where: { id } });
  
  // Köhnə şəkli Cloudinary-dən sil
  if (product.cloudinaryPublicId) {
    await this.uploadService.deleteFile(product.cloudinaryPublicId, 'image');
  }
  
  await this.productRepository.remove(product);
}
```

### 2. Faylı yeniləmək
Yeni şəkil yüklənəndə, köhnə şəkli silmək lazımdır:

```typescript
async update(id: number, updateDto: UpdateDto, file?: Express.Multer.File) {
  const entity = await this.repository.findOne({ where: { id } });
  
  if (file) {
    // Köhnə şəkli sil
    if (entity.cloudinaryPublicId) {
      await this.uploadService.deleteFile(entity.cloudinaryPublicId, 'image');
    }
    
    // Yeni şəkil yüklə
    const uploadResult = await this.uploadService.saveFile(file, 'images');
    entity.imageUrl = uploadResult.media.url;
    entity.cloudinaryPublicId = uploadResult.media.publicId; // ✅ PublicId saxla
  }
  
  return await this.repository.save(entity);
}
```

### 3. Transformasiya
Şəkil ölçülərini dəyişdirmək:

```typescript
// Thumbnail yaratmaq
const thumbnailUrl = `https://res.cloudinary.com/your-cloud/image/upload/w_200,h_200/${publicId}`;
```

## Database-də saxlanılması

Entity-lərdə `publicId`-ni də saxlamalısınız:

```typescript
@Entity('products')
export class Product extends BaseEntity {
  @Column({ nullable: true })
  mainImg: string; // URL
  
  @Column({ nullable: true })
  cloudinaryPublicId: string; // ✅ PublicId saxla
}
```

## Hazırkı vəziyyət

Hazırda `publicId` response-da qaytarılır, amma database-də saxlanılmır. 
Bu, sonradan faylları silməyi çətinləşdirir.

## Tövsiyə

1. Entity-lərə `cloudinaryPublicId` column-u əlavə edin
2. Upload zamanı `publicId`-ni də saxlayın
3. Delete/Update zamanı köhnə faylları Cloudinary-dən silin

Bu, Cloudinary-də lazımsız faylların yığılmasının qarşısını alır və storage-dan qənaət edir.

