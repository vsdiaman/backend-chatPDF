import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('completion')
  async getCompletion(@Body('prompt') prompt: string) {
    return await this.chatService.getCompletion(prompt);
  }
}
