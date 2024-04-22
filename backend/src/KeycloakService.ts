import KcAdminClient from "@keycloak/keycloak-admin-client";
import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import {Credentials} from "@keycloak/keycloak-admin-client/lib/utils/auth";
import ConfigCache from "./ConfigCache";

export default class KeycloakService {

    private static instance: KeycloakService = undefined;

    public static getInstance(): KeycloakService {
        if (this.instance === undefined) {
            this.instance = new KeycloakService();
        }

        return this.instance;
    }

    private constructor() {
    }

    private config = new ConfigCache().getConfig();

    public REALM_NAME = this.config.keycloak.realmName;

    public kcAdminClient = new KcAdminClient(this.config.keycloak.connection);

    private runAuthOnce = true;

    private async authenticate() {
        const credentials: Credentials = this.config.keycloak.credentials;
        return this.kcAdminClient
            .auth(credentials)
            .then(() => {
                return true;
            }).catch(error => {
                console.log("Keycloak failed to auth, reason: " + error.toString());
                return false;
            });
    }


    public async getUser(username: string, email: string): Promise<UserRepresentation | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            const users = await this.kcAdminClient.users.find({
                realm: this.REALM_NAME,
                username: username,
                email: email,
                exact: true
            });

            if (users.length === 1) {
                return users[0];
            } else {
                return undefined
            }
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to find user based on username and email, reason: " + e.toString());
            return undefined;
        }
    }

    public async getUserBasedOnEmail(email: string): Promise<UserRepresentation | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            const users = await this.kcAdminClient.users.find({
                realm: this.REALM_NAME,
                email: email,
                exact: true
            });

            if (users.length === 1) {
                return users[0];
            } else {
                return undefined
            }
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to find user based on email, reason: " + e.toString());
            return undefined;
        }
    }

    public async getUserBasedOnUsername(username: string): Promise<UserRepresentation | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            const users = await this.kcAdminClient.users.find({
                realm: this.REALM_NAME,
                username: username,
                exact: true,
            });

            if (users.length === 1) {
                return users[0];
            } else {
                return undefined
            }
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to find user based on username, reason: " + e.toString());
            return undefined;
        }
    }

    public async createIndieUser(username: string, email: string, password: string): Promise<string | undefined> {
        return this.createUser(username, email, this.config.indie.group, password);
    }

    public async createUser(username: string, email: string, client: string, password?: string): Promise<string | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            const usernameSplit: string[] = username.split(" ");

            const kcAddUserRes = await this.kcAdminClient.users.create({
                username: username,
                email: email,
                enabled: true,
                emailVerified: true,
                firstName: usernameSplit[0],
                lastName: usernameSplit[1] ? usernameSplit[1] : undefined,
                credentials: [
                    {
                        type: 'password',
                        value: password || 'codasip',
                        temporary: false,
                    },
                ],
                attributes: {
                    // uniqueIdentifier: uniqueIdentifier
                },
                realm: this.REALM_NAME,
                groups: [
                    client
                ]
            });
            return kcAddUserRes.id || undefined;
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to create a new User, reason: " + e.toString());
            return undefined;
        }
    }

    public async removeUser(username: string, email: string): Promise<boolean> {
        const auth = await this.authenticate();
        if(!auth) {
            return false;
        }

        try {
            const user = await this.getUser(username, email);
            return await this.kcAdminClient.users.del({realm: this.REALM_NAME, id: user.id})
                .then(() => true)
                .catch(() => false);
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to remove a User, reason: " + e.toString());
            return false;
        }
    }

    public async sendAuthEmail(userId: string) {
        const auth = await this.authenticate();
        if(!auth) {
            return false;
        }

        try {
            return await this.kcAdminClient.users.sendVerifyEmail({
                realm: this.REALM_NAME,
                id: userId,
            }).then(() => true).catch(() => false);
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to send Authentication Email, reason: " + e.toString());
            return false;
        }
    }


    public async getAllUsers(): Promise<UserRepresentation[] | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            return await this.kcAdminClient.users.find({
                realm: this.REALM_NAME,
                max: 99999999 //TODO is roughly a hard limit, I've tried to add more and it broke the function
            });
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to get all Users, reason: " + e.toString());
            return undefined;
        }
    }

    public async updateUser(
        oldUserDetails: {
            username: string,
            email: string
        }, newUserDetails: {
            username: string,
            email: string,
        }
    ): Promise<boolean> {
        const auth = await this.authenticate();
        if(!auth) {
            return false;
        }

        try {
            const kcUser = await this.getUser(oldUserDetails.username, oldUserDetails.email);
            kcUser.username = newUserDetails.username;
            kcUser.email = newUserDetails.email;

            return await this.kcAdminClient.users.update({
                id: kcUser.id,
                realm: this.REALM_NAME
            }, kcUser).then(() => true).catch(() => false);

        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to update Users, reason: " + e.toString());
            return false;
        }
    }

    public async getAllExistingGroups(): Promise<string[] | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            const allGroups = await this.kcAdminClient.groups.find({realm: this.REALM_NAME});
            return allGroups.map(e => e.name);
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to get All Existing Groups, reason: " + e.toString());
            return undefined;
        }
    }

    public async getGroupsUserBelongsIn(userId: string): Promise<GroupRepresentation[] | undefined> {
        const auth = await this.authenticate();
        if(!auth) {
            return undefined;
        }

        try {
            return await this.kcAdminClient.users.listGroups({
                realm: this.REALM_NAME,
                id: userId
            })
        } catch (e: any) {
            console.error("KEYCLOAK SERVICE -> Failed to get All Existing Groups, reason: " + e.toString());
            return undefined;
        }
    }


    //This is old secred, most likely not needed
    // clientSecret: "H39KtMmjBziDoaShPseDdHwbOPSVfqAX", //generated by keycloak
    //TODO this is an old version
    // public async performKeycloakAuth() {
    //     if (this.runAuthOnce) {
    //         try {
    //             const credentials: Credentials = this.config.keycloak.credentials;
    //             await this.kcAdminClient.auth(credentials);
    //             setInterval(() => {
    //                 try {
    //                     this.kcAdminClient.auth(credentials)
    //                 } catch (e) {
    //                     console.error("KEYCLOAK SERVICE -> Failed to authenticate, reason: " + e.toString());
    //                 }
    //             }, 1000);
    //             this.runAuthOnce = false;
    //         } catch (error) {
    //             throw error;
    //         }
    //     }
    // };


}
