import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findForUser(@Query('userId') userId: string, @Query('role') role: string) {
    return this.messagesService.findForUser(+userId, role);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Body('userId') userId: string) {
    return this.messagesService.markAsRead(+id, +userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.messagesService.remove(+id, +userId);
  }
}
