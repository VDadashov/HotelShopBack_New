import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { i18nConfig } from '../config/i18n.config';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let lang = req.headers['x-lang'] || req.query.lang || i18nConfig.defaultLanguage;
    if (Array.isArray(lang)) lang = lang[0];
    if (!i18nConfig.supportedLanguages.includes(lang as string)) {
      lang = i18nConfig.defaultLanguage;
    }
    req['lang'] = lang;
    next();
  }
} 