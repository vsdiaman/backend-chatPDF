import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('completion')
  async getCompletion(
    @Body('pdfText') pdfText: string,
    @Body('question') question: string,
  ) {
    // console.log('Recebido do frontend:', { pdfText, question });

    if (!pdfText || !question) {
      throw new HttpException(
        'pdfText e question são obrigatórios',
        HttpStatus.BAD_REQUEST,
      );
    }

    const prompt = `Baseado no seguinte conteúdo extraído de um PDF: "${pdfText}", responda a seguinte pergunta: "${question}"`;

    return await this.chatService.getCompletion(prompt);
  }
}
