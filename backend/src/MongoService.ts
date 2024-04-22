import {Collection, MongoClient} from "mongodb";
import {Contract, Designer, Division, IpBlock, IpBlockDef, MongoContract} from "./common/Contract";
import CompanyData from "./common/CompanyData";
import MongoDBPool from "./MongoDbPool";
// import crypto from "crypto";

export type MongoConfig = {
    connection: string,
    collections: {
        msa: {
            connectionDb: string,
            collection: string
        },
        assets: {
            connectionDb: string,
            collection: string
        }
    }
}

export class MongoService {

    private mongoConfig: MongoConfig
    // private mongoClient: MongoClient
    private mongoDbPool: MongoDBPool

    constructor(config: MongoConfig) {
        this.mongoConfig = config;
        this.mongoDbPool = MongoDBPool.getInstance(this.mongoConfig.connection)
    }


    //TODO trying to figure out which way would make it more readable
    // either normal functions or objects that each hold functions for specific DB
    public assets = {
        getCollectionAndConnection: async (): Promise<{
            collection: Collection,
            connection: MongoClient
        } | undefined> => {
            try {
                // Get a connection from the pool
                const connection = await this.mongoDbPool.getConnection();
                // Access the database and collection
                const collection = connection?.db(this.mongoConfig.collections.assets.connectionDb).collection(this.mongoConfig.collections.assets.collection);

                return {
                    collection: collection,
                    connection: connection
                };
            } catch (e: any) {
                console.error("MONGO SERVICE -> Failed to make a connection to the database, reason: " + e.toString());
                return undefined;
            }
        },
        getCompanyData: async (company: string): Promise<CompanyData> => {
            let collection: Collection | undefined;
            let connection: MongoClient | undefined;

            try {
                ({collection, connection} = await this.assets.getCollectionAndConnection());

                if (collection) {
                    // @ts-ignore
                    return await collection.findOne({companyName: company});
                } else {
                    return undefined;
                }
            } catch (e: any) {
                console.error("MONGO SERVICE -> Failed to get company data, reason: " + e.toString());
                return undefined;
            } finally {
                if (connection) {
                    this.mongoDbPool.releaseConnection(connection);
                }
            }
        },
        getAllCompanyData: async (): Promise<CompanyData[]> => {
            let collection: Collection | undefined;
            let connection: MongoClient | undefined;

            try {
                ({collection, connection} = await this.assets.getCollectionAndConnection());

                if (collection) {
                    // @ts-ignore
                    return await collection.find({}).toArray();
                } else {
                    return undefined;
                }
            } catch (e: any) {
                console.error("MONGO SERVICE -> Failed to get company data, reason: " + e.toString());
                return undefined;
            } finally {
                if (connection) {
                    this.mongoDbPool.releaseConnection(connection);
                }
            }
        },
        addCompanyData: async (companyData: CompanyData) => {
            let collection: Collection | undefined;
            let connection: MongoClient | undefined;

            try {
                ({collection, connection} = await this.assets.getCollectionAndConnection());

                if (collection) {
                    const alreadyExists = await this.assets.companyDataExists(companyData.companyName);
                    if (!alreadyExists) {
                        return await collection.insertOne(companyData);
                    } else {
                        return undefined;
                    }
                } else {
                    return undefined;
                }
            } catch (e: any) {
                console.error("MONGO SERVICE -> Failed to add company data, reason: " + e.toString());
                return undefined;
            } finally {
                if (connection) {
                    this.mongoDbPool.releaseConnection(connection);
                }
            }
        },
        removeCompanyData: async (company: string) => {
            let collection: Collection | undefined;
            let connection: MongoClient | undefined;

            try {
                ({collection, connection} = await this.assets.getCollectionAndConnection());

                if (collection) {
                    const alreadyExists = await this.assets.companyDataExists(company);
                    if (alreadyExists) {
                        return await collection.deleteOne({companyName: company});
                    } else {
                        return undefined;
                    }
                } else {
                    return undefined;
                }
            } catch (e: any) {
                console.error("MONGO SERVICE -> Failed to remove company data, reason: " + e.toString());
                return undefined;
            } finally {
                if (connection) {
                    this.mongoDbPool.releaseConnection(connection);
                }
            }
        },
        companyDataExists: async (company: string) => {
            let collection: Collection | undefined;
            let connection: MongoClient | undefined;

            try {
                ({collection, connection} = await this.assets.getCollectionAndConnection());

                if (collection) {
                    return !!await collection.findOne({companyName: company});
                } else {
                    return undefined;
                }
            } catch (e: any) {
                console.error("MONGO SERVICE -> Failed to get company data, reason: " + e.toString());
                return undefined;
            } finally {
                if (connection) {
                    this.mongoDbPool.releaseConnection(connection);
                }
            }
        }
    }


    private async getCollectionAndConnection(): Promise<{
        collection: Collection,
        connection: MongoClient
    } | undefined> {
        try {
            // Get a connection from the pool
            const connection = await this.mongoDbPool.getConnection();
            // Access the database and collection
            const collection = connection?.db(this.mongoConfig.collections.msa.connectionDb).collection(this.mongoConfig.collections.msa.collection);

            return {
                collection: collection,
                connection: connection
            };
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to make a connection to the database, reason: " + e.toString());
            return undefined;
        }
    }


    public async purchaseBlock(username: string, companyName: string, ipblock: IpBlock) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({connection, collection} = await this.getCollectionAndConnection());

            if (collection) {
                const result = await collection.updateOne(
                    {
                        "contract.client": companyName,
                        "contract.designers.name": username
                    },
                    {
                        $push: {
                            "contract.designers.$.purchases": {
                                ipblock: ipblock
                            } as never
                        }
                    }
                )
                return result;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to purchase block, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    //Returns ID if exists
    public async getContractId(companyName: string) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            const query = {
                "contract.client": companyName
            };

            if (collection) {
                const res = await collection.findOne(query);
                return res?._id;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to get contract ID, reason: " + e.toString());
            return undefined;

        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    //Add User to the contract
    public async addUser(designer: Designer, contractID: any) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;
        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.updateOne({"_id": contractID}, {$push: {"contract.designers": designer} as never})
                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add user, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }


    //TODO IMPORTANT!!!
    // This will only work if username is unique!
    // While in keycloak we could have never had a duplicate,
    // we have to be sure that this will remain the case
    public async getUser(username: string): Promise<Designer | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;
        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.aggregate([
                    {
                        $unwind: '$contract.designers',
                    },
                    {
                        $match: {'contract.designers.name': username},
                    },
                ]).toArray();

                if (res[0].contract.designers) {
                    return res[0].contract.designers;
                } else {
                    return undefined
                }
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to get user, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async editUser(oldUsername: string, newUsername: string, newDivision: string): Promise<boolean> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;
        //todo add try catch

        try {
            ({collection, connection} = await this.getCollectionAndConnection());
            if (collection) {

                const divisionExists = await this.getCompanyUserBelongsTo(oldUsername).then(e => !!e?.contract.divisions.find(e => e.name === newDivision));
                const usernameExists = oldUsername === newUsername ? false : !!await this.getUser(newUsername);

                if (usernameExists) {
                    console.error("MONGO SERVICE -> Username already exists");
                    return false;
                }

                if (!divisionExists) {
                    console.error("MONGO SERVICE -> Division does not exist");
                    return false;
                }


                const filter = {'contract.designers.name': oldUsername};

                const update = {
                    $set: {
                        'contract.designers.$.name': newUsername,
                        'contract.designers.$.division': newDivision,
                    },
                };
                const result = await collection.updateOne(filter, update);

                return result.modifiedCount > 0;
            } else {
                return false;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to edit user, reason: " + e.toString());
            return false;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }

    }

    public async getUsersFromCompany(companyName: string): Promise<Designer[]> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.aggregate([
                    {
                        $match: {'contract.client': companyName},
                    },
                    {
                        $unwind: '$contract.designers',
                    },
                    {
                        $project: {
                            _id: 0,
                            name: '$contract.designers.name',
                            'designer-auid': '$contract.designers.designer-auid',
                            division: '$contract.designers.division',
                            purchases: '$contract.designers.purchases.ipblock',
                        },
                    },
                ]).toArray();

                return res as Designer[];
            } else {
                return [];
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add user, reason: " + e.toString());
            return [];
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async getAllIpblocksForCuration(): Promise<{ designerName: string, publishedIpBlocks: IpBlock[] }[]> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {

                const pipeline = [
                    // Unwind the divisions array
                    {$unwind: "$contract"},
                    // Unwind the designers array
                    {$unwind: "$contract.designers"},
                    // Match only the loaded IP blocks
                    {$match: {'contract.designers.publishedIpBlocks.curationStatus': 'Loaded'}},
                    // Project the necessary fields
                    {
                        $project: {
                            _id: 0,
                            designerName: "$contract.designers.name",
                            publishedIpBlocks: {
                                $filter: {
                                    input: "$contract.designers.publishedIpBlocks",
                                    as: "ipBlock",
                                    cond: {$eq: ["$$ipBlock.curationStatus", "Loaded"]}
                                }
                            }
                        },
                    },
                ];
                //TODO fix, I am sure type is correct but the thing is complaining anyway
                // @ts-ignore
                const result: { designerName: string, publishedIpBlocks: IpBlock[]}[] = await collection.aggregate<{
                    designerName: string,
                    publishedIpBlocks: IpBlock[]
                }[]>(pipeline).toArray();


                return result;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to find all IP blocks for curation, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async getCompanyUserBelongsTo(username: string): Promise<MongoContract | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.findOne(
                    {'contract.designers.name': username},
                );

                if (res) {
                    //TODO improve this cast
                    return res as unknown as MongoContract;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to find a company user belongs to, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async deleteUserFromCompany(companyName: string, username: string) {
        //TODO add check if division exists first
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.updateOne(
                    {
                        'contract.client': companyName,
                    },
                    {
                        $pull: {
                            'contract.designers': {
                                name: username
                            } as never
                        }
                    }
                );

                return res.modifiedCount > 0;
            } else {
                return false;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to remove user from DB, reason: " + e.toString());
            return false;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async getAllCompanyNames() {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res: MongoContract[] = await collection.find({}).toArray() as unknown as MongoContract[]; //todo fix cast

                return res.map(e => e.contract.client);
            } else {
                return [];
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add user, reason: " + e.toString());
            return [];
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async getAllUsers(): Promise<Designer[]> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.aggregate([
                    {
                        $unwind: '$contract.designers',
                    },
                    {
                        $project: {
                            _id: 0,
                            name: '$contract.designers.name',
                            'designer-auid': '$contract.designers.designer-auid',
                            division: '$contract.designers.division',
                            purchases: '$contract.designers.purchases',
                        },
                    },
                ]).toArray();

                return res as Designer[];
            } else {
                return [];
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add user, reason: " + e.toString());
            return [];
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }


    public async ipBlockExistsInDivision(company: string, division: string, ipblock: IpBlockDef) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.findOne(
                    {
                        "contract.client": company,
                        "contract.divisions.name": division,
                        "contract.divisions.blocksreleased": {
                            $elemMatch: {
                                "ipblockName": ipblock.name
                            }
                        }
                    },
                )
                return !!res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to search for IP block in specific division, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    //TODO improve name? A little ambigious and we have `addIpblock` already
    // This function actually adds ip block to the `publishedIpBlocks of a specific user`
    public async userPublishIpBlock(username: string, ipblock: IpBlock) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const query = {'contract.designers.name': username};
                const contract = await collection.findOne(query);


                const updatedDesigners = contract.contract.designers.map(designer => {
                    if (designer.name === username) {
                        return {
                            ...designer,
                            publishedIpBlocks: [...designer.publishedIpBlocks, ipblock],
                        };
                    }
                    return designer;
                });

                const res = await collection.updateOne(query, {$set: {'contract.designers': updatedDesigners}});

                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error(`MONGO SERVICE -> Failed to add ipblock to the publishedIpblocks of the user ${username}, reason: ` + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async addIpBlock(company: string, division: string, ipblock: IpBlockDef) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.updateOne(
                    {
                        "contract.client": company,
                        "contract.divisions.name": division
                    },
                    {$push: {"contract.divisions.$.blocksreleased": ipblock}} as never
                )
                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add division, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async addDivision(company: string, divisionAuid: string, hash: string, division: string, blocksreleased?: IpBlockDef[]) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;
        //TODO add check if division exists first
        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            //TODO add auid as a parameter
            const newDivision: Division = {
                name: division,
                hash: hash,
                "division-auid": divisionAuid,
                blocksreleased: blocksreleased || [],
                designers: []
            };

            if (collection) {
                const res = await collection.updateOne(
                    {
                        "contract.client": company,
                    },
                    {$push: {"contract.divisions": newDivision}} as never
                );
                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add contract, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async removeDivision(company: string, division: string) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;
        //TODO add check if division exists first
        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.updateOne(
                    {
                        'contract.client': company,
                        'contract.divisions.name': division
                    },
                    {
                        $pull: {
                            'contract.divisions': {
                                name: division
                            } as never
                        }
                    }
                );
                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add contract, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    //TODO finish
    // public async divisionExists(company: string, division: string): Promise<boolean> {
    //     try {
    //
    //         const collection = await this.getCollection();
    //         // const mongoContract = {
    //         //     contract: contract
    //         // }
    //
    //         if (collection) {
    //             const res = await collection.findOne(mongoContract);
    //             return !!res;
    //         } else {
    //             return undefined;
    //         }
    //     } catch (e: any) {
    //         console.error("MONGO SERVICE -> Failed to add contract, reason: " + e.toString());
    //         return undefined;
    //     }
    // }

    //TODO while its called a contract, its per Company basis,
    // so its a little bit like "addCompany"
    public async addContract(contract: Contract) {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {

            ({collection, connection} = await this.getCollectionAndConnection());
            const mongoContract = {
                contract: contract
            }

            if (collection) {
                const res = await collection.insertOne(mongoContract);
                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to add contract, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async contractExists(companyName: string): Promise<boolean> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());
            const query = {
                "contract.client": companyName
            };

            if (collection) {
                const res = await collection.findOne(query);
                return !!res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to get a contract, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    //Returns ID if exists
    public async getContract(companyName: string): Promise<MongoContract | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());
            const query = {
                "contract.client": companyName
            };

            if (collection) {
                //@ts-ignore
                const res: MongoContract = await collection.findOne(query);

                return res;
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to get a contract, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }


    //TODO this gets ipblocks that user has access to
    // Meaning we check the division they are in,
    // and from that division we pull all the blocks
    public async getUserIpBlocks(username: string, companyName: string) {
        //TODO write a better query, this is silly

        const contract: Contract = await this.getContract(companyName).then((e: any) => e.contract);

        const userDivision = contract.designers.find(e => e.name === username)?.division;

        const division: IpBlockDef[] | undefined = contract.divisions.find(e => e.name === userDivision)?.blocksreleased;

        return division;
    }

    private generateUniqueIdentifier() {
        // Generate a random UUID
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';

        for (let i = 0; i < 32; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }

        return randomString;

        // return crypto.randomUUID();
    }

    public async getDesignerWithDivision(companyName: string, designerauid: string): Promise<Designer | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.findOne(
                    {
                        'contract.client': companyName,
                        'contract.designers.designer-auid': designerauid
                    },
                    {
                        projection: {
                            _id: 0,
                            'contract.designers.$': 1
                        }
                    }
                );

                if (res) {
                    return res.contract.designers[0];
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to find designer with division, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async getDivisionId(clientName: string, divisionName: string): Promise<string | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.findOne(
                    {
                        'contract.client': clientName,
                        'contract.divisions.name': divisionName
                    },
                    {
                        projection: {
                            _id: 0,
                            'contract.divisions.$': 1
                        }
                    }
                );

                if (res && res.contract.divisions.length > 0) {
                    return res.contract.divisions[0]["division-auid"];
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to get division ID, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }


    public async getClientnameWithDesignerid(designerauid: string): Promise<string | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.findOne(
                    {
                        'contract.designers.designer-auid': designerauid
                    },
                    {
                        projection: {
                            _id: 0,
                            'contract.client': 1
                        },
                    }
                );

                if (res) {
                    return res.contract.client;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to find designer with division, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    public async getClientAndDesignerWithDivision(designerauid: string): Promise<{
        clientid: string | undefined,
        clientName: string | undefined,
        designer: Designer | undefined
    }> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const clientQuery = {
                    'contract.designers.designer-auid': designerauid
                };
                const designerQuery = {
                    'contract.designers.designer-auid': designerauid
                };

                const clientPromise = collection.findOne(clientQuery, {
                    projection: {
                        _id: 0,
                        'contract.client': 1,
                        'contract.contract-auid': 1
                    }
                });

                const designerPromise = collection.findOne(designerQuery, {
                    projection: {
                        _id: 0,
                        'contract.designers.$': 1
                    }
                });

                const [clientRes, designerRes] = await Promise.all([clientPromise, designerPromise]);

                const clientid = clientRes ? clientRes.contract['contract-auid'] : undefined;
                const clientName = clientRes ? clientRes.contract.client : undefined;
                const designer = designerRes ? designerRes.contract.designers[0] : undefined;

                return {clientid, clientName, designer};
            } else {
                return {clientid: undefined, clientName: undefined, designer: undefined};
            }
        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to find client and designer with division, reason: " + e.toString());
            return {clientid: undefined, clientName: undefined, designer: undefined};
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }


    public async getFileChecksumFromIpBlockName(ipblockName: string): Promise<any | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.findOne(
                    {
                        'contract.designers.publishedIpBlocks.ipblockName': ipblockName
                    },
                    {
                        projection: {
                            _id: 0,
                            'contract.designers.publishedIpBlocks.fileChecksum.$': 1
                        }
                    }
                );

                if (res) {
                    return res.contract.designers[0].publishedIpBlocks[0].fileChecksum;
                } else {
                    return undefined;
                }
            }

        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to find client and designer with division, reason: " + e.toString());
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
        }
    }

    async approveIpBlock(username: string, ipblockName: string, ipblockVersion: string): Promise<boolean | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.updateOne(
                    {
                        "contract.designers.name": username,
                        "contract.designers.publishedIpBlocks": {
                            $elemMatch: {
                                ipblockName: ipblockName,
                                ipblockVersion: ipblockVersion
                            }
                        }
                    },
                    {
                        $set: {
                            "contract.designers.$.publishedIpBlocks.$[block].curationStatus": "Verified"
                        }
                    },
                    {
                        arrayFilters: [
                            {
                                "block.ipblockName": ipblockName,
                                "block.ipblockVersion": ipblockVersion
                            }
                        ]
                    }
                );

                if (res) {
                    return res.modifiedCount > 0
                } else {
                    return undefined;
                }
            }

        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to approve ipBlock, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
            return undefined;
        }
    }

    async rejectIpBlock(username: string, ipblockName: string, ipblockVersion: string): Promise<boolean | undefined> {
        let collection: Collection | undefined;
        let connection: MongoClient | undefined;

        try {
            ({collection, connection} = await this.getCollectionAndConnection());

            if (collection) {
                const res = await collection.updateOne(
                    {
                        "contract.designers.name": username,
                        "contract.designers.publishedIpBlocks": {
                            $elemMatch: {
                                ipblockName: ipblockName,
                                ipblockVersion: ipblockVersion
                            }
                        }
                    },
                    {
                        $set: {
                            "contract.designers.$.publishedIpBlocks.$[block].curationStatus": "Rejected"
                        }
                    },
                    {
                        arrayFilters: [
                            {
                                "block.ipblockName": ipblockName,
                                "block.ipblockVersion": ipblockVersion
                            }
                        ]
                    }
                );

                if (res) {
                    return res.modifiedCount > 0
                } else {
                    return undefined;
                }
            }

        } catch (e: any) {
            console.error("MONGO SERVICE -> Failed to reject ipBlock, reason: " + e.toString());
            return undefined;
        } finally {
            if (connection) {
                this.mongoDbPool.releaseConnection(connection);
            }
            return undefined;
        }
    }

}
