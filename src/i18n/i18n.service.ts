import { Injectable } from '@nestjs/common';
import { i18nConfig } from '../config/i18n.config';

@Injectable()
export class I18nService {
  getSupportedLanguages(): string[] {
    return i18nConfig.supportedLanguages;
  }

  getDefaultLanguage(): string {
    return i18nConfig.defaultLanguage;
  }

  translateField(field: any, lang: string): string {
    if (!field) return '';
    if (typeof field === 'object' && field[lang]) return field[lang];
    if (typeof field === 'string') return field;
    return field[i18nConfig.defaultLanguage] || '';
  }
} 