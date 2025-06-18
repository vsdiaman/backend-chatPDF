// src/chat/chat.service.ts
import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type Role = 'system' | 'user' | 'assistant';
type Msg = ChatCompletionMessageParam & { role: Role };

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;
  private readonly model = 'gpt-4o'; // troque por modelo fine-tuned quando houver
  private readonly logger = new Logger(ChatService.name);

  /** Prompt base que define o “personagem” advogada virtual */
  private readonly systemPrompt = `
Você é a **Doutora IA**, advogada inscrita na OAB-SP 999.999.
Objetivo: explicar documentos jurídicos a leigos de forma clara e objetiva,  
citar artigos pertinentes e sugerir próximos passos práticos.

• Jurisdição principal: Brasil – priorize Código Civil, CLT e legislação federal.  
• Sempre inclua o disclaimer:  
  “Esta resposta é apenas informativa e não substitui consulta a profissional habilitado.”  
• Se faltar contexto, faça perguntas de triagem antes de concluir.  
• Caso o usuário solicite algo ilegal ou antiético, recuse educadamente.  
• Responda em português formal, tom feminino, máx. 450 palavras.
`.trim();

  constructor(cfg: ConfigService) {
    const apiKey = cfg.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new HttpException('API Key not found', 500);
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Gera uma resposta textual.
   * @param prompt Pergunta ou instrução do usuário.
   * @param context  Trechos contextuais opcionais (RAG). Cada string deve ser curta (≤ 200 tokens).
   */
  async getCompletion(prompt: string, context: string[] = []): Promise<string> {
    /** 1. Monta a lista de mensagens */
    const messages: Msg[] = [
      { role: 'system', content: this.systemPrompt },
      ...this.buildContextMessages(context),
      { role: 'user', content: prompt },
    ];

    /** 2. Faz chamadas encadeadas até concluir ou atingir limite de tokens */
    let fullAnswer = '';
    let done = false;

    while (!done) {
      try {
        const resp = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          max_tokens: 448,
          temperature: 0.3,
        });

        const choice = resp.choices[0];
        const chunk = choice.message.content ?? '';
        fullAnswer += chunk;

        const usage = resp.usage;
        if (usage) {
          this.logger.verbose(
            `Prompt ${usage.prompt_tokens} tokens | Completion ${usage.completion_tokens} tokens`,
          );
        }

        if (choice.finish_reason === 'length') {
          // Armazena o que o modelo escreveu…
          messages.push({ role: 'assistant', content: chunk });
          // …e pede continuação
          messages.push({ role: 'user', content: 'Continue…' });
        } else {
          done = true; // "stop" ou "content_filter"
        }
      } catch (err) {
        this.logger.error(err);
        throw new InternalServerErrorException('Erro ao consultar OpenAI');
      }
    }

    /** 3. Garante que o disclaimer esteja presente */
    if (!/não substitui consulta a profissional habilitado/i.test(fullAnswer)) {
      fullAnswer +=
        '\n\n*Esta resposta é apenas informativa e não substitui consulta a profissional habilitado.*';
    }

    return fullAnswer.trim();
  }

  // ------------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------------

  /**
   * Converte trechos externos em mensagens “system” para RAG.
   * Cada trecho deve ser curto → evita estouro de contexto.
   */
  private buildContextMessages(snippets: string[]): Msg[] {
    if (snippets.length === 0) return [];

    const header =
      'Utilize obrigatoriamente os trechos de referência abaixo ao elaborar a resposta:\n';
    const body = snippets.map((s, i) => `Fonte ${i + 1}:\n${s}`).join('\n\n');

    return [{ role: 'system', content: `${header}${body}` }];
  }
}
