import { FirebaseService } from '../config/firebase.service';
export declare class FilesController {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    uploadFile(file: Express.Multer.File): Promise<{
        message: string;
        fileName?: undefined;
        url?: undefined;
        pdfText?: undefined;
        error?: undefined;
    } | {
        message: string;
        fileName: string;
        url: string;
        pdfText: string;
        error?: undefined;
    } | {
        message: string;
        error: any;
        fileName?: undefined;
        url?: undefined;
        pdfText?: undefined;
    }>;
}
