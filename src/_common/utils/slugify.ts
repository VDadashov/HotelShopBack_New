// Unicode dəstəyi ilə slug generator
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // diakritikləri sil
    .replace(/[^\w\s-əöüğçşƏÖÜĞÇŞa-zA-Z0-9]/g, '') // xüsusi simvolları sil
    .replace(/\s+/g, '-') // boşluqları - ilə əvəz et
    .replace(/-+/g, '-') // birdən çox - varsa birləşdir
    .replace(/^-+|-+$/g, '') // baş və sondakı - sil
    .toLowerCase();
} 