import { OnModuleInit } from '@nestjs/common';
import { Datastore } from '@google-cloud/datastore';
import { Bucket } from '@google-cloud/storage';
export declare class FirebaseService implements OnModuleInit {
    private bucket;
    private datastore;
    private readonly logger;
    onModuleInit(): Promise<void>;
    getBucket(): Bucket;
    getDatastore(): Datastore;
}
