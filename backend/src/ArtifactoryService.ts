import axios, {AxiosResponse} from "axios";
import {ArtifactoryIpBlock, ArtifactoryResponseAllBlocks, IpBlockProperties} from "./common/ArtifactoryIpBlock";
import fs from "fs";


export default class ArtifactoryService {

    private backendAddress: string
    private credentials: string

    constructor(config: { address: string, credentials: string }) {
        this.backendAddress = config.address;
        this.credentials = btoa(config.credentials);
    }


    async downloadIpBlock(ipBlockName: string, ipBlockVersion: string): Promise<string> {
        const zipFilename = `${ipBlockName}_${ipBlockVersion}.zip`;
        const apiUrl = `${this.backendAddress}/artifactory/ipblocks/${zipFilename}`
        const downloadFileStream = await axios.get(apiUrl, {
            headers: {
                "Authorization": "Basic " + this.credentials
            },
            responseType: "stream"
        });


        //TODO add timestamp?
        const destinationPath = `/tmp/ip-blocks/${zipFilename}`
        fs.mkdirSync(`/tmp/ip-blocks`, {recursive: true});

        const writer = fs.createWriteStream(destinationPath);
        downloadFileStream.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('error', (err) => {
                console.log("there was an erorr: " + err.toString());
                reject();
            });

            writer.on('finish', () => {
                resolve(destinationPath);
            });
        });
    }

    async uploadIpBlock(fileContent: Buffer, ipblockFullName: string, props: {
        owner: string, //derived
        curated: string, //derived
        id: string,
        version: string,
        changelog: string,
        type: string,
        summary: string,
        description: string,
        depends: string
    }): Promise<boolean> {
        const response = await axios.put(
            `${this.backendAddress}/artifactory/ipblocks/${ipblockFullName}`,
            fileContent,
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    Authorization: `Basic ${this.credentials}`,
                },
            }
        ).catch((e: any) => {
            console.error("" + e.toString());
            return false;
        });
        ////////////////////////////////////


        const prop: IpBlockProperties = {
            id: props.id,
            depends: props.depends,
            version: props.version,
            uri: "todo?",
            type: props.type,
            summary: props.summary,
            description: props.description,
            changelog: props.changelog,
            owner: props.owner,
            curated: props.curated === "undefined" ? undefined : props.curated.toLowerCase() === "true"
        }

        const apiUrl = encodeURI(`${this.backendAddress}/artifactory/api/storage/ipblocks/${ipblockFullName}?properties=ipblocks.id=${prop.id};ipblocks.depends=${prop.depends};ipblocks.version=${prop.version};ipblocks.type=${prop.type};ipblocks.summary=${prop.summary};ipblocks.description=${prop.description};ipblocks.changelog=${props.changelog};ipblocks.owner=${props.owner};ipblocks.curated=${props.curated}`);

        const axiosConfig = {
            headers: {
                Authorization: `Basic ${this.credentials}`,
            },
        };

        return await axios.put(apiUrl, null, axiosConfig)
            .then((response) => {
                console.log('Artifact properties updated successfully:', response.data);
                return true;
            })
            .catch((error) => {
                console.error('Error updating artifact properties:', error.response?.data || error.message);
                return false;
            });
    }

    async getAllIpBlocksWithProperties(): Promise<ArtifactoryIpBlock[]> {
        const apiUrl = `${this.backendAddress}/artifactory/api/storage/ipblocks`
        const res1: AxiosResponse<ArtifactoryResponseAllBlocks> = await axios.get(apiUrl, {
            headers: {
                "Authorization": "Basic " + this.credentials
            },
        });

        const allRepos: string[] = res1.data.children.map(repo =>
            repo.uri.slice(1, repo.uri.length)
        );


        //TODO this can be improved if we are 100% sure that data in mongo is correct all the time
        // then I do not need to filter against, I can just pull a list from Mongo and
        // fetch those
        const res2 = allRepos.map(async repoName => {
            const apiGetPropsUri = `${this.backendAddress}/artifactory/api/storage/ipblocks/${repoName}?properties`;
            const repo = await axios.get(apiGetPropsUri, {
                headers: {
                    "Authorization": "Basic " + this.credentials
                },
            });
            return ({
                name: repoName,
                properties: repo.data
            });
        });

        const res3: ArtifactoryIpBlock[] = await Promise.all(res2);

        return res3;
    }

    async approveIpBlock(ipblockFullName: string) {
        const url = `${this.backendAddress}/artifactory/api/storage/ipblocks/${ipblockFullName}?properties=ipblocks.curated=true`;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////
        const response = await axios.put(url, {}, {
            headers: {
                "Authorization": "Basic " + this.credentials
            },
        });
        console.log('Artifact properties approving successfully:', response.data);
        console.log(JSON.stringify(response.data));
    }

    async rejectIpBlock(ipblockFullName: string) {
        const url = `${this.backendAddress}/artifactory/api/storage/ipblocks/${ipblockFullName}?properties=ipblocks.curated=false`;

        const response = await axios.put(url, {}, {
            headers: {
                "Authorization": "Basic " + this.credentials
            },
        });
        console.log('Artifact properties rejection successfully:', response.data);
        console.log(JSON.stringify(response.data));
    }


}
