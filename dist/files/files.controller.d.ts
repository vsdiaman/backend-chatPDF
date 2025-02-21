import { FirebaseService } from '../config/firebase.service';
export declare class FilesController {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    uploadFile(file: Express.Multer.File): Promise<{
        message: string;
        fileName?: undefined;
        url?: undefined;
        fileId?: undefined;
        pdfText?: undefined;
        error?: undefined;
    } | {
        message: string;
        fileName: string;
        url: string;
        fileId: any;
        pdfText: string;
        error?: undefined;
    } | {
        message: string;
        error: any;
        fileName?: undefined;
        url?: undefined;
        fileId?: undefined;
        pdfText?: undefined;
    }>;
    getFile(fileId: string): Promise<{
        message: string;
        fileId?: undefined;
        data?: undefined;
        error?: undefined;
    } | {
        fileId: string;
        data: any;
        message?: undefined;
        error?: undefined;
    } | {
        message: string;
        error: any;
        fileId?: undefined;
        data?: undefined;
    }>;
}
