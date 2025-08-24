import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { I18nService } from './i18n.service';
import { I18nMiddleware } from './i18n.middleware';

@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(I18nMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 