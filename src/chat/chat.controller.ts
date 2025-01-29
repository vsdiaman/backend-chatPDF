import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('completion')
  async getCompletion(@Body() body: { text: string; prompt: string }) {
    const { text, prompt } = body;
    let result = ''; // A variável 'result' precisa ser 'let' para poder ser alterada

    if (!text || !prompt) {
      return {
        statusCode: 400,
        message: 'Texto do PDF e pergunta são obrigatórios',
      };
    }

    const chatPrompt = `Baseado no seguinte documento: "${text}", responda: ${prompt}`;

    // Alterando 'result' dentro do callback
    await this.chatService.getCompletion(chatPrompt, (data) => {
      result += data; // Aqui você vai adicionar os dados à variável 'result'
    });

    return { Completion: result }; // Agora você retorna o 'result' que foi atualizado
  }
}
