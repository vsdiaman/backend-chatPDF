"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
let ChatService = class ChatService {
    constructor(configService) {
        this.configService = configService;
        this.maxRetries = 5;
        this.retryDelay = 1000;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new common_1.HttpException('API Key not found', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.openai = new openai_1.OpenAI({ apiKey });
    }
    async retryRequest(fn, retries = 5) {
        try {
            return await fn();
        }
        catch (error) {
            if (error.response?.status === 429 && retries < this.maxRetries) {
                const delay = Math.pow(2, retries) * this.retryDelay;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.retryRequest(fn, retries + 1);
            }
            else {
                console.error('Error details:', error.response?.data || error.message);
                throw error;
            }
        }
    }
    async getCompletion(prompt) {
        try {
            const response = await this.retryRequest(() => this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50,
                temperature: 0.9,
                top_p: 1,
                presence_penalty: 0,
                frequency_penalty: 0,
                stop: ['\n', 'testing'],
            }));
            return response.choices[0].message.content;
        }
        catch (error) {
            const statusCode = error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data?.error?.message || error.message;
            console.error('Error calling OpenAI API:', { statusCode, message });
            if (statusCode === 429) {
                console.log('Cota excedida. Considere pausar ou aumentar o limite.');
            }
            throw new common_1.HttpException({
                statusCode,
                message,
            }, statusCode);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map