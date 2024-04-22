import {GrantTypes} from "@keycloak/keycloak-admin-client/lib/utils/auth";
import * as fs from "fs";
import * as Path from "path";
import {MongoConfig} from "./MongoService";


export interface Config {
    smpServer: {
        host: string,
        port: number,
        secure: boolean,
        auth: {
            user: string,
            pass: string,
        },
        emailAddress: string
    },
    mongo: MongoConfig,
    indie: {
        name: string,
        group: string,
    }
    artifactory: {
        address: string,
        credentials: string
    },
    keycloak: {
        connection: {
            baseUrl: string,
            realmName: string,
        },
        realmName: string
        credentials: {
            username: string,
            password: string,
            grantType: GrantTypes,
            clientId: string,
            clientSecret: string,
        }
    },
    blockchain: {
        metadata: string,
        provider: string,
        contractAddress: string,
        keyring: string
    },
    accounts: {
        jamie : string,
        mocka : string,
        alice : string,
        bob : string,
        charlie : string,
        mark : string,
      },
    license : {
        address: string,
        apiToken: string
    },
    dropdownOptions: {
        availableDivisions: string[],
        availableRoles: string[]
    }
}

export default class ConfigCache {

    protected readonly configLocation: string = Path.join(__dirname, "config");
    protected readonly configName: string = "config.json";
    protected readonly configFullPath: string = Path.resolve(this.configLocation, this.configName);

    protected readonly blockchainLocation: string = Path.join(__dirname, "blockchain");
    protected readonly blockchainName: string = "metadata.json";
    protected readonly blockchainFullPath: string = Path.resolve(this.blockchainLocation, this.blockchainName);


    configExists(): boolean {
        return fs.existsSync(this.configFullPath);
    }

    getConfig(): Config | undefined {
        const a = fs.readFileSync(this.configFullPath);
        if (a.toString().length <= 0) {
            return undefined;
        } else {
            return JSON.parse(a.toString());
        }
    }


    getBlockchainMetadata() {
        const a = fs.readFileSync(this.blockchainFullPath);
        if (a.toString().length <= 0) {
            return undefined;
        } else {
            return JSON.parse(a.toString());
        }
    }
}

