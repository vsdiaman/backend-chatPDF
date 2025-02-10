import { FirebaseService } from '../config/firebase.service';
export declare class FilesService {
    private readonly firebaseService;
    constructor(firebaseService: FirebaseService);
    uploadJson(fileName: string, jsonData: string): Promise<void>;
    getFileUrl(): Promise<{
        name: string;
        url: string;
    }[]>;
    getBucketName(): string;
}
