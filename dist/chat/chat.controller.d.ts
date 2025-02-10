import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getCompletion(pdfText: string, question: string): Promise<any>;
}
