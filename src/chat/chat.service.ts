import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

@Injectable()
export class ChatService {
  private readonly maxRetries = 5;
  private readonly retryDelay = 1000;
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        'API Key not found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = 5,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && retries < this.maxRetries) {
        const delay = Math.pow(2, retries) * this.retryDelay;
        console.log(`Retrying request... Attempt ${retries + 1}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(fn, retries + 1);
      } else {
        console.error('Error details:', error.response?.data || error.message);
        throw error;
      }
    }
  }

  async getCompletion(prompt: string): Promise<any> {
    try {
      const response = await this.retryRequest(() =>
        this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50,
          temperature: 0.9,
          top_p: 1,
          presence_penalty: 0,
          frequency_penalty: 0,
          stop: ['\n', 'testing'],
        }),
      );

      // Acesse a resposta diretamente
      return response.choices[0].message.content;
    } catch (error) {
      const statusCode =
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.error?.message || error.message;

      console.error('Error calling OpenAI API:', { statusCode, message });

      if (statusCode === 429) {
        console.log('Cota excedida. Considere pausar ou aumentar o limite.');
      }

      throw new HttpException(
        {
          statusCode,
          message,
        },
        statusCode,
      );
    }
  }
}
