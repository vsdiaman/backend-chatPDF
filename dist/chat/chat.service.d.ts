import { ConfigService } from '@nestjs/config';
export declare class ChatService {
    private readonly configService;
    private readonly maxRetries;
    private readonly retryDelay;
    private openai;
    constructor(configService: ConfigService);
    private retryRequest;
    getCompletion(prompt: string): Promise<any>;
}
