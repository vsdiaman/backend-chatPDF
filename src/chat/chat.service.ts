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
  private readonly model = 'gpt-4o'; // troque aqui se fizer fine-tuning
  private readonly logger = new Logger(ChatService.name);

  /** Persona (system prompt) ------------------------------------------------ */
  private readonly systemPrompt = `
Você é a **Doutora IA**, advogada inscrita na OAB-SP 999.999.
Objetivo: explicar documentos jurídicos a leigos, citar artigos
pertinentes e sugerir próximos passos práticos.

• Jurisdição: Brasil – priorize Código Civil, CLT e legislação federal.  
• Sempre inclua o disclaimer:  
  “Esta resposta é apenas informativa e não substitui consulta a profissional habilitado.”  
• Se faltar contexto, faça perguntas de triagem antes de concluir.  
• Caso o usuário solicite algo ilegal ou antiético, recuse educadamente.  
• Responda em português formal, tom feminino, máx. 450 palavras.
`.trim();

  /** Mensagem de boas-vindas ------------------------------------------------- */
  private readonly welcomeMessage = `
Olá, seja muito bem-vindo(a)! 🖐️  
  
Sou a **Doutora IA**, sua advogada virtual.  
Posso explicar contratos, petições ou artigos de lei em linguagem simples  
e orientá-lo(a) sobre seus direitos e obrigações.  

Em que posso ajudar hoje?
`.trim();

  constructor(cfg: ConfigService) {
    const apiKey = cfg.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new HttpException('API Key not found', 500);
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Se `prompt` vier vazio → devolve apenas a mensagem de boas-vindas.
   * Caso contrário, gera resposta jurídica respeitando o prompt base.
   *
   * @param prompt   Pergunta do usuário (pode ser string vazia)
   * @param context  Snippets externos (RAG) opcional
   */
  async getCompletion(prompt: string, context: string[] = []): Promise<string> {
    /* 0. Boas-vindas -------------------------------------------------------- */
    if (!prompt || !prompt.trim()) {
      return this.welcomeMessage;
    }

    /* 1. Montagem das mensagens -------------------------------------------- */
    const messages: Msg[] = [
      { role: 'system', content: this.systemPrompt },
      ...this.buildContextMessages(context),
      { role: 'user', content: prompt },
    ];

    /* 2. Loop de completions (continua…) ------------------------------------ */
    let fullAnswer = '';
    let done = false;

    while (!done) {
      try {
        const resp = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          max_tokens: 448, // ajuste se precisar de respostas maiores
          temperature: 0.3,
        });

        const choice = resp.choices[0];
        const chunk = choice.message.content ?? '';
        fullAnswer += chunk;

        /* Logagem opcional de custos --------------------------------------- */
        if (resp.usage) {
          const u = resp.usage;
          this.logger.verbose(
            `Prompt ${u.prompt_tokens} | Completion ${u.completion_tokens}`,
          );
        }

        if (choice.finish_reason === 'length') {
          // guarda o trecho gerado…
          messages.push({ role: 'assistant', content: chunk });
          // …pede continuação
          messages.push({ role: 'user', content: 'Continue…' });
        } else {
          done = true; // "stop" ou "content_filter"
        }
      } catch (err) {
        this.logger.error(err);
        throw new InternalServerErrorException('Erro ao consultar OpenAI');
      }
    }

    /* 3. Garante disclaimer jurídico --------------------------------------- */
    if (!/não substitui consulta a profissional habilitado/i.test(fullAnswer)) {
      fullAnswer +=
        '\n\n*Esta resposta é apenas informativa e não substitui consulta a profissional habilitado.*';
    }

    return fullAnswer.trim();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  private buildContextMessages(snippets: string[]): Msg[] {
    if (snippets.length === 0) return [];
    const header =
      'Utilize obrigatoriamente os trechos de referência abaixo ao elaborar a resposta:\n';
    const body = snippets.map((s, i) => `Fonte ${i + 1}:\n${s}`).join('\n\n');

    return [{ role: 'system', content: `${header}${body}` }];
  }
}
