import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  processChat(pdfText: string): string {
    const response = `Processed text: ${pdfText}`;
    return response;
  }
}
