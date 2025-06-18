// src/chat/chat.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private readonly model = 'gpt-4o'; // escolha o modelo
  constructor(cfg: ConfigService) {
    const apiKey = cfg.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new HttpException('API Key not found', 500);
    this.openai = new OpenAI({ apiKey });
  }

  async getCompletion(prompt: string): Promise<string> {
    const messages: Msg[] = [{ role: 'user', content: prompt }];
    let fullAnswer = '';
    let done = false;

    while (!done) {
      const resp = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: 2048, // o que couber em uma chamada
        temperature: 0.3,
      });

      const chunk = resp.choices[0].message.content;
      fullAnswer += chunk;

      if (resp.choices[0].finish_reason === 'length') {
        // armazenamos o que o modelo acabou de escrever…
        messages.push({ role: 'assistant', content: chunk });
        // …e pedimos para continuar
        messages.push({ role: 'user', content: 'Continue…' });
      } else {
        done = true; // ‘stop’ ou ‘content_filter’
      }
    }

    return fullAnswer;
  }
}
