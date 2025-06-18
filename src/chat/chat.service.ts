import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;
  private readonly model = 'gpt-4o';

  constructor(cfg: ConfigService) {
    const key = cfg.get<string>('OPENAI_API_KEY');
    if (!key) throw new Error('OPENAI_API_KEY não definido');
    this.openai = new OpenAI({ apiKey: key });
  }

  /** Helper de retry (já era seu) ------------------------- */
  private async retryRequest<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn();
    } catch (e: any) {
      if (e.response?.status === 429 && attempt < 5) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000));
        return this.retryRequest(fn, attempt + 1);
      }
      throw e;
    }
  }

  /** ------------------------------------------------------- */
  async getCompletion(prompt: string): Promise<string> {
    /* 1. monta as mensagens */
    const messages: ChatMsg[] = [
      {
        role: 'system',
        content:
          'Você é um advogado virtual experiente. Explique em linguagem simples e oriente o usuário.',
      },
      { role: 'user', content: prompt },
    ];

    let fullAnswer = '';
    let done = false;

    /* 2. loop enquanto o modelo cortar por length */
    while (!done) {
      const resp = await this.retryRequest(() =>
        this.openai.chat.completions.create({
          model: this.model,
          messages,
          max_tokens: 4096, // 0 ==> “todo espaço restante” (também funciona)
          temperature: 0.3,
        }),
      );

      const chunk = resp.choices[0]?.message?.content ?? '';
      fullAnswer += chunk;

      /* 3. verifica motivo de término */
      if (resp.choices[0].finish_reason === 'length') {
        // adiciona contexto para a próxima chamada
        messages.push({ role: 'assistant', content: chunk });
        messages.push({ role: 'user', content: 'Continue…' });
        // e continua o while
      } else {
        done = true;
      }
    }

    return fullAnswer;
  }
}
