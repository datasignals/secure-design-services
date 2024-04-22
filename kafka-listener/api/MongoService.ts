import mongoose, { ConnectOptions } from 'mongoose';
import {Collection, MongoClient} from "mongodb";
import * as mongoDB from "mongodb";
import { FileSystemRecords } from "./common/FileSystemRecords";
import { mongoconfig } from './index';
import { mongo } from '../config/config.json';

export const collections: { FileSystemRecords?: mongoDB.Collection } = {}
export class MongoService{
    private static instance: MongoService;
    private uri: string;
    private collection : string;
    private dbname: string;
    private constructor() {
        this.uri = mongo.connection;
        this.collection = mongo.collections.filesystem.collection;
        this.dbname = mongo.collections.filesystem.connectionDb
    }

    public static getInstance(): MongoService {
        if (!MongoService.instance) {
            MongoService.instance = new MongoService();
        }
        return MongoService.instance;
    }

    public async connect(): Promise<void> {
        try {
            const client: mongoDB.MongoClient = new mongoDB.MongoClient(this.uri,{ssl:mongo.ssl});
            await client.connect();
            const db: mongoDB.Db = client.db(this.dbname);
            const fileCollection: mongoDB.Collection = db.collection(this.collection);
            collections.FileSystemRecords = fileCollection;
            console.log(`Successfully connected to database: ${db.databaseName} and collection: ${fileCollection.collectionName}`);
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}