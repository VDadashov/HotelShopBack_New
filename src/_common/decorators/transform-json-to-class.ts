import { Transform } from 'class-transformer';

export function TransformJsonToClass(cls: new (...args: any[]) => any) {
  return Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return new cls(JSON.parse(value));
      } catch {
        throw new Error(`Invalid JSON format for ${cls.name}`);
      }
    }
    if (typeof value === 'object') return new cls(value);
    return value;
  });
}
