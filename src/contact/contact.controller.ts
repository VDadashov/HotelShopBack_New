import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Send contact message' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all contact messages (Admin)' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  findAll() {
    return this.contactService.findAll();
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get unread messages count (Admin)' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  getUnreadCount() {
    return this.contactService.getUnreadCount();
  }

  @Patch('mark-all-read/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Mark message as read by id (Admin)' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  markAsRead(@Param('id') id: number) {
    return this.contactService.markSelectedAsRead([+id]);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get contact message by id (Admin)' })
  @ApiResponse({ status: 200, description: 'Message detail' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(+id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete contact message (Admin)' })
  @ApiResponse({ status: 200, description: 'Message deleted' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(+id);
  }
}
