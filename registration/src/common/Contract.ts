export interface MongoContract {
    _id?: string,
    contract: Contract
}
export interface Contract {
    client: string;
    "contract-auid": string;
    divisions: Division[];
    designers: Designer[];
}

export interface IpBlockDef {
    name: string,
    version: string,
    startDate?: string,
    endDate?: string
}

export interface IpBlock {
    ipblockName: string,
    ipblockVersion: string
    blockchainHash: string
}

export interface Division {
    "division-auid": string;
    name: string;
    blocksreleased: IpBlockDef[];
}

export interface Designer {
    "designer-auid": string;
    name: string;
    division: string;
    purchases: IpBlock[];
    publishedIpBlocks: IpBlock[]
}
