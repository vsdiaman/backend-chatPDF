"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const datastore_1 = require("@google-cloud/datastore");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    async onModuleInit() {
        try {
            this.logger.log('🔥 Carregando credenciais do Firebase...');
            const serviceAccount = {
                type: process.env.TYPE,
                project_id: process.env.PROJECT_ID,
                private_key_id: process.env.PRIVATE_KEY_ID,
                private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.CLIENT_EMAIL,
                client_id: process.env.CLIENT_ID,
                auth_uri: process.env.AUTH_URI,
                token_uri: process.env.TOKEN_URI,
                auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
                client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
                universe_domain: process.env.UNIVERSE_DOMAIN,
            };
            if (!serviceAccount.private_key || !serviceAccount.client_email) {
                throw new Error('❌ Credenciais do Firebase ausentes no .env!');
            }
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    storageBucket: `${serviceAccount.project_id}.appspot.com`,
                });
            }
            this.bucket = admin.storage().bucket();
            this.datastore = new datastore_1.Datastore({
                projectId: serviceAccount.project_id,
                credentials: {
                    private_key: serviceAccount.private_key,
                    client_email: serviceAccount.client_email,
                },
            });
            this.logger.log('✅ Firebase inicializado com sucesso!');
        }
        catch (error) {
            this.logger.error('❌ Erro ao inicializar Firebase:', error);
            throw new Error('Falha ao carregar credenciais do Firebase');
        }
    }
    getBucket() {
        return this.bucket;
    }
    getDatastore() {
        return this.datastore;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map