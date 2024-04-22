export interface MongoContract {
    _id?: string,
    contract: Contract
}
export interface Contract {
    client: string;
    "contract-auid": string;
    hash: string,
    divisions: Division[];
    designers: Designer[];
}

export interface IpBlockDef {
    name: string,
    version:string,
    startDate?:string,
    endDate?: string
}

// export interface IpBlockContract {
//     name: string,
//     version:string,
//     startDate:string,
//     endDate: string
// }


export interface IpBlock {
    ipblockName: string,
    ipblockVersion: string,
    blockchainHash: string,
    fileChecksum?: string //TODO it is only undefined because it will involve a lot of code changes
    //todo obviously change it later, in fact rename all parameters as they are different from IpBlockDef `name vs ipblockname`
    curationStatus?: "Loaded" | "Verified" | "Rejected"
}

export interface Division {
    "division-auid": string;
    hash: string;
    name: string;
    blocksreleased: IpBlockDef[];
}

export interface Designer {
    "designer-auid": string;
    name: string;
    hash: string;
    division: string;
    purchases: IpBlock[];
    publishedIpBlocks: IpBlock[]
}

// export interface DivisionDef {
//     "division-auid": string;
//     name: string;
//     hash : string;
//     blocksreleased: IpBlockDef[];
// }
