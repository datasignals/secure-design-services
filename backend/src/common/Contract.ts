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

//for contract
export interface IpBlockDef {
    name: string,
    version: string
    startDate?: string | undefined,
    endDate?: string | undefined
}

//for mongodb
export interface IpBlock {
    ipblockName: string,
    ipblockVersion: string,
    blockchainHash: string,
    fileChecksum?: string //TODO it is only undefined because it will involve a lot of code changes
    //todo obviously change it later, in fact rename all parameters as they are different from IpBlockDef `name vs ipblockname`
    curationStatus?: "Loaded" | "Verified" | "Rejected",
}

export interface Division {
    "division-auid": string;
    hash: string;
    name: string;
    blocksreleased: IpBlockDef[];
    designers: Designer[];
}

export interface Designer {
    "designer-auid": string;
    name: string;
    hash: string;
    division: string;
    purchases: IpBlock[];
    publishedIpBlocks: IpBlock[]
}

/////////////// Struct for Contract /////////////////

// export interface Division1 {
//     divisionAuid: string,
//     name: string,
//     blockReleased: IpBlock1[],
//     designers : Designer1[],
// }

// export interface IpBlock1 {
//     name: string;
//     version: string;
// }

// export interface Designer1 {
//     designer_auid : string;
//     purchase: any[];
// }

