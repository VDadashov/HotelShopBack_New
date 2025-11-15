import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../_common/entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from '../_common/services/email.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateContactDto) {
    try {
      // Database-ə məlumatı yaz
      const contact = this.contactRepo.create(dto);
      const savedContact = await this.contactRepo.save(contact);

      // Email-ləri göndər (parallel olaraq)
      await Promise.allSettled([
        this.emailService.sendContactNotificationToAdmin(dto),
        this.emailService.sendContactConfirmationToUser(dto),
      ]);

      return {
        success: true,
        message: 'Mesajınız uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.',
        data: savedContact,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Mesaj göndərilən zaman xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        error: error.message,
      };
    }
  }

  async findAll() {
    return this.contactRepo.find({ 
      order: { createdAt: 'DESC' },
      select: ['id', 'name', 'email', 'message', 'isRead', 'createdAt']
    });
  }

  async findOne(id: number) {
    const contact = await this.contactRepo.findOneBy({ id });
    if (!contact) {
      throw new NotFoundException('Contact message not found');
    }
    
    // Mesajı oxunmuş kimi işarələ
    if (!contact.isRead) {
      contact.isRead = true;
      await this.contactRepo.save(contact);
    }
    
    return contact;
  }
  
  async remove(id: number) {
    const contact = await this.contactRepo.findOneBy({ id });
    if (!contact) {
      throw new NotFoundException('Contact message not found');
    }
    await this.contactRepo.remove(contact);
    return { 
      success: true, 
      message: 'Mesaj uğurla silindi' 
    };
  }

  // Oxunmamış mesajların sayını al
  async getUnreadCount() {
    return this.contactRepo.count({ where: { isRead: false } });
  }

  // Bütün mesajları oxunmuş kimi işarələ
  async markAllAsRead() {
    await this.contactRepo.update({ isRead: false }, { isRead: true });
    return { success: true, message: 'Bütün mesajlar oxunmuş kimi işarələndi' };
  }

  // Seçilmiş mesajları oxunmuş kimi işarələ
  async markSelectedAsRead(ids: number[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, message: 'Heç bir id göndərilməyib' };
    }
    await this.contactRepo.update(ids, { isRead: true });
    return { success: true, message: 'Seçilmiş mesajlar oxunmuş kimi işarələndi' };
  }
}
