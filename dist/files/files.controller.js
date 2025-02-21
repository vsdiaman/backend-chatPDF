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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const uuid_1 = require("uuid");
const firebase_service_1 = require("../config/firebase.service");
let FilesController = class FilesController {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async uploadFile(file) {
        console.log('Arquivo recebido:', file);
        console.log('Arquivo recebido no backend:', file.mimetype, file.originalname);
        try {
            if (file.mimetype !== 'application/pdf') {
                return { message: 'Apenas arquivos PDF são permitidos.' };
            }
            const pdfData = await (0, pdf_parse_1.default)(file.buffer);
            const jsonData = { text: pdfData.text };
            const fileId = (0, uuid_1.v4)();
            const fileName = `jsons/${fileId}.json`;
            const bucket = this.firebaseService.getBucket();
            const fileUpload = bucket.file(fileName);
            await fileUpload.save(JSON.stringify(jsonData), {
                contentType: 'application/json',
                metadata: {
                    metadata: { fileId },
                },
            });
            return {
                message: 'Arquivo convertido e enviado com sucesso!',
                fileName,
                url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
                fileId,
                pdfText: pdfData.text,
            };
        }
        catch (error) {
            console.error('Erro ao processar o arquivo:', error);
            return { message: 'Erro ao processar o arquivo.', error };
        }
    }
    async getFile(fileId) {
        try {
            const filePath = `jsons/${fileId}.json`;
            const bucket = this.firebaseService.getBucket();
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            if (!exists) {
                return { message: 'Arquivo não encontrado.' };
            }
            const [content] = await file.download();
            const jsonData = JSON.parse(content.toString());
            return { fileId, data: jsonData };
        }
        catch (error) {
            console.error('Erro ao buscar arquivo:', error);
            return { message: 'Erro ao buscar o arquivo.', error };
        }
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFile", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FilesController);
//# sourceMappingURL=files.controller.js.map