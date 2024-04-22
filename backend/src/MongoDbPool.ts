import { MongoClient, Db } from 'mongodb';

export default class MongoDBPool {
    private static instance: MongoDBPool;
    private readonly uri: string;
    private readonly options: object;
    private readonly poolSize: number;
    private pool: MongoClient[] = [];

    private constructor(uri: string, options: object, poolSize: number) {
        this.uri = uri;
        this.options = options;
        this.poolSize = poolSize;
        this.createPool();
    }

    private createPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const client = new MongoClient(this.uri, this.options);
            this.pool.push(client);
        }
    }

    public static getInstance(uri: string, options: object = {}, poolSize: number = 5): MongoDBPool {
        if (!MongoDBPool.instance) {
            MongoDBPool.instance = new MongoDBPool(uri, options, poolSize);
        }
        return MongoDBPool.instance;
    }

    public async getConnection(): Promise<MongoClient> {
        if (this.pool.length > 0) {
            return this.pool.pop() as MongoClient;
        } else {
            const newClient = new MongoClient(this.uri, this.options);
            await newClient.connect();
            return newClient;
        }
    }

    public releaseConnection(client: MongoClient) {
        this.pool.push(client);
    }

    public async closeConnections() {
        for (const client of this.pool) {
            await client.close();
        }
        this.pool = [];
    }

    public async closeConnectionPool() {
        await this.closeConnections();
        MongoDBPool.instance = undefined as any;
    }
}
