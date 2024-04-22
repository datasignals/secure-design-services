export interface ArtifactoryIpBlockProperties {
    "properties" : {
        "ipblocks.depends" : string[],
        "ipblocks.description" : string[],
        "ipblocks.id" : string[],
        "ipblocks.summary" : string[],
        "ipblocks.type" : string[]
        "ipblocks.version" : string[]
        "ipblocks.changelog" : string[]
        "ipblocks.curated" : ("true" | "false" | "undefined")[]
        "ipblocks.owner" : string[]
    },
    "uri" : string
}

export interface IpBlockWithProperties {
    name: string,
    properties: IpBlockProperties
}


export interface ArtifactoryResponseAllBlocks {
    repo: string,
    path: string,
    created: string,
    lastModified: string,
    lastUpdated: string,
    children: {
        uri: string,
        folder: boolean
    }[],
    uri: string
}

export interface ArtifactoryIpBlock {
    name: string,
    properties: ArtifactoryIpBlockProperties
}

export interface IpBlockProperties {
    depends: string,
    description : string,
    id : string,
    summary : string,
    type : string
    version : string
    uri : string
    changelog: string,
    owner: string,
    curated: boolean | undefined
}
