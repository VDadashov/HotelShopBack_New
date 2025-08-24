# GStone Backend Development Process

## Modul Statusları

- [x] Base Setup & Multi-language System (TypeORM, PostgreSQL və i18n tamamlandı)
- [x] Company CRUD & Swagger
- [x] Category CRUD & Swagger
- [x] Product CRUD & Swagger
- [ ] GalleryCategory CRUD & Swagger
- [ ] GalleryItem CRUD & Swagger
- [ ] Settings CRUD & Swagger
- [ ] Admin CRUD & Swagger
- [ ] Contact CRUD & Swagger
- [ ] Authentication System
- [x] File Upload System
- [x] Product Search System
- [ ] Download System
- [ ] Documentation (Swagger)

---

## Entity Field-ləri

### Company
- id
- title (az, en, ru)
- description (az, en, ru)
- logo
- createdAt
- updatedAt

### Category
- id
- title (az, en, ru)
- slug
- parentId
- isActive
- createdAt
- updatedAt

### Product
- id
- title (az, en, ru)
- slug
- description (az, en, ru)
- mainImage
- imageList
- detailPdf
- categoryId
- isActive
- createdAt
- updatedAt

### GalleryCategory
- id
- title (az, en, ru)
- slug
- isActive
- createdAt
- updatedAt

### GalleryItem
- id
- title (az, en, ru)
- description (az, en, ru)
- mainImage
- imageList
- galleryCategoryId
- isActive
- createdAt
- updatedAt

### Settings
- id
- key
- value (JSON)
- type
- description
- isActive
- createdAt
- updatedAt

### Admin
- id
- username
- email
- password (hashed)
- role
- isActive
- lastLogin
- createdAt
- updatedAt

### Contact
- id
- name
- email
- subject
- message
- isRead
- createdAt
- updatedAt

---

## TODO
- [x] Product CRUD & Swagger
- [ ] GalleryCategory CRUD & Swagger
- [ ] GalleryItem CRUD & Swagger
- [ ] Settings CRUD & Swagger
- [ ] Admin CRUD & Swagger
- [ ] Contact CRUD & Swagger
- [ ] JWT authentication və RBAC
- [x] File upload və validation
- [x] Product search sistemi
- [ ] Swagger documentation
- [ ] Error handling və validation pipes

---

## Completed Features
- [x] Layihə başlanğıc konfiqurasiyası
- [x] process.md faylı yaradıldı
- [x] TypeORM və PostgreSQL bağlantısı tamamlandı
- [x] i18n (multi-language) sistemi tam quruldu
- [x] Slug generation service əlavə olundu
- [x] Entity-lər yaradıldı
- [x] Company CRUD & Swagger tamamlandı
- [x] Product CRUD & Swagger tamamlandı
- [x] File upload və validation tamamlandı
- [x] Product search sistemi tamamlandı 