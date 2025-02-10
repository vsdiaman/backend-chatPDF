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
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../config/firebase.service");
let FilesService = class FilesService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async uploadJson(fileName, jsonData) {
        const bucket = this.firebaseService.getBucket();
        const fileReference = bucket.file(fileName);
        try {
            await fileReference.save(jsonData, {
                contentType: 'application/json',
                public: true,
                metadata: {
                    customMetadata: {
                        uploadDate: new Date().toISOString(),
                        fileId: fileName.split('/')[1].split('_')[0],
                    },
                },
            });
        }
        catch (error) {
            console.error('❌ Erro ao fazer upload do JSON:', error);
            throw new Error('Failed to upload JSON');
        }
    }
    async getFileUrl() {
        const bucket = this.firebaseService.getBucket();
        const [files] = await bucket.getFiles({
            prefix: 'jsons/',
        });
        return files.map((file) => ({
            name: file.name,
            url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        }));
    }
    getBucketName() {
        return this.firebaseService.getBucket().name;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FilesService);
//# sourceMappingURL=files.service.js.map