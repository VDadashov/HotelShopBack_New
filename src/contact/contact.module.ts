import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from '../_common/entities/contact.entity';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from 'src/_common/services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), ConfigModule],
  controllers: [ContactController],
  providers: [ContactService, EmailService],
  exports: [EmailService], // Başqa modullardan istifadə etmək üçün
})
export class ContactModule {}
