export class MenuItemDto {
  id: number;
  title: string;
  url: string;
  children?: MenuItemDto[];
}
