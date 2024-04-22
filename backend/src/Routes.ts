import KeycloakService from "./KeycloakService";
import {Request, Response} from "express";
import * as fs from 'fs';
import * as crypto from 'crypto';
import ConsentBatch from "./common/ConsentBatch";
import User from "./common/User";
import User1 from "./common/User";
import DocumentStorage from "./DocumentStorage";
import SignatureBox from "./common/SignatureBox";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import ContractService from "./ContractService";
import AddClient from "./AddClient";
import AddDivision from "./AddDivision";
import AddDesigner from "./AddDesigner";
import UploadIpBlock from "./UploadIpBlock";
import UpdateCurationStatus from "./UpdateCurationStatus";

import {MongoService} from "./MongoService";
import {Designer, IpBlockDef, MongoContract} from "./common/Contract";
import ConfigCache, {Config} from "./ConfigCache";
import {ArtifactoryIpBlock, IpBlockWithProperties} from "./common/ArtifactoryIpBlock";
import {Binary} from "mongodb";
import NodeCache from "node-cache";
import LicenseService from "./LicenseService";
import Path from "path";
import ArtifactoryService from "./ArtifactoryService";
import axios from "axios";
// import { runWithRetry } from "./nodeEntrypoint";


export namespace Route {

    const imageCache: NodeCache = new NodeCache();
    const config: Config = new ConfigCache().getConfig();

    // const ARTIFACTORY_ADDRESS = config.artifactory.address;
    // const ARTIFACTORY_CREDENTIALS = btoa(config.artifactory.credentials);
    const MONGO_CONFIG = config.mongo;
    const KEYCLOAK_CONFIG = config.keycloak;

    const KEYCLOAK_SERVICE = KeycloakService.getInstance();
    const MONGO_SERVICE = new MongoService(MONGO_CONFIG);
    const LICENSE_SERVICE = new LicenseService(config.license);
    const ARTIFACTORY_SERVICE = new ArtifactoryService({...config.artifactory});

    function convertTextTypeToPrimitive(input?: ("true" | "false" | "undefined")): boolean | undefined {
        return input === "undefined" ? undefined :
            input === "true";
    }

    function generateUniqueIdentifier() {
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

    async function generateFileHash(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);

            stream.on('data', (data) => {
                hash.update(data);
            });

            stream.on('end', () => {
                const fileHash = hash.digest('hex');
                resolve(fileHash);
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });
    }

    function getOrCreateConsentBatch(company: string, id: string, docName: string, users: string[]): ConsentBatch | undefined {
        if (consentBatchExists(company, id)) {
            return JSON.parse(fs.readFileSync(`uploads/confirmed/${company}/${id}/consent.json`,).toString());
        }

        const batch: ConsentBatch = {
            id: id,
            company: company,
            docName: docName,
            users: users.map(e => {
                return {name: e, signed: false, sent: false, revoked: false}
            })
        }

        try {
            fs.writeFileSync(`uploads/confirmed/${company}/${id}/consent.json`, JSON.stringify(batch, null, 2));
            return batch;
        } catch (e) {
            console.error(e);
            return undefined;
        }

    }

    function getConsentBatch(company: string, id: string): ConsentBatch | undefined {
        try {
            if (consentBatchExists(company, id)) {
                return JSON.parse(fs.readFileSync(`uploads/confirmed/${company}/${id}/consent.json`,).toString());
            } else {
                return undefined;
            }
        } catch (e: any) {
            console.error("failed to get consent batch, reason: " + e.toString());
            return undefined;
        }
    }

    function updateConsentBatch(company: string, id: string, batch: ConsentBatch): boolean {
        try {
            fs.writeFileSync(`uploads/confirmed/${company}/${id}/consent.json`, JSON.stringify(batch, null, 2));
            return true;
        } catch (e: any) {
            console.error("Failed to update consent batch, reason: " + e.toString());
            return false;
        }

    }

    function consentBatchExists(company: string, id: string): boolean {
        try {
            return fs.existsSync(`uploads/confirmed/${company}/${id}/consent.json`);
        } catch (e: any) {
            console.error("Failed to check if consent batch exists, reason: " + e.toString());
            return false;
        }
    }

    function pdfExists(username: string, company: string, id: string): boolean {
        try {
            return fs.existsSync(`uploads/confirmed/${company}/${id}/${username}.pdf`);
        } catch (e: any) {
            console.error("Failed to check if PDF exists, reason: " + e.toString());
            return false;
        }
    }

    export namespace Get {

        export async function getDebug(req: Request, res: Response) {
            console.log("Attempting to restart keycloak")
            //Auth Keycloak
            // runWithRetry(KeycloakService.getInstance().performKeycloakAuth)
                // .then(() => {
                //         console.log("Keycloak Authentication Completed");
                //         res.status(200).send("Success");
                // })
                // .catch(r => {
                //     console.error("Keycloak Authentication has Failed: " + r.toString())
                //     res.status(500).send("Failure");
                // })
        }

        export async function getBackendVersion(req: Request, res: Response) {
            try {
                const version = JSON.parse(
                    fs.readFileSync(Path.join(__dirname, "version", "version.json"))
                        .toString()
                ).version;


                version && version.length > 0 ?
                    res.status(200).send(version) :
                    res.status(200).send("Not Found");
            } catch (e: any) {
                console.error("Failed to find a version file, reason: " + e.toString());
                res.status(200).send("Not Found");
            }
        }

        export async function isIpBlockValid(req: Request, res: Response) {
            try {
                const username = req.query["username"].toString();
                const ipBlockName = req.query["ipblock-name"].toString();
                const ipBlockVersion = req.query["version"].toString();

                //TODO we can either pass division or we can ask mongo for it
                // I think limiting number of parameters required is better
                // const division = req.query["division"].toString();

                const user = await MONGO_SERVICE.getUser(username);
                const mongoContract = await MONGO_SERVICE.getCompanyUserBelongsTo(username)

                const a = mongoContract.contract.divisions
                    .find(e => e.name === user.division).blocksreleased
                    .find(e =>
                        e.name === ipBlockName &&
                        e.version === ipBlockVersion
                    )

                console.log("a", a);
                const hasExpirationRange = (
                    a.hasOwnProperty("startDate") &&
                    a.hasOwnProperty("endDate") &&
                    a.startDate !== undefined &&
                    a.startDate !== null &&
                    a.startDate !== "" &&
                    a.endDate !== undefined &&
                    a.endDate !== null &&
                    a.endDate !== ""
                );
                // console.log(hasExpirationRange);
                if (!hasExpirationRange) {
                    res.status(200).send(true);
                    return;
                }


                const today = new Date().getTime();
                const endDateNumber = parseInt(a.endDate);
                const endDate = new Date(endDateNumber);


                //TODO this is caused since we send different objects to what it is expected from the interface
                const isValid = (endDateNumber - today) > 0;

                console.log("today: " + today);
                console.log("endDateNumber: " + endDateNumber);
                console.log("found ipblock: " + JSON.stringify(a, null, 2));
                console.log("ipblockname: " + ipBlockName);
                console.log("username: " + username);
                console.log("todat: " + today);
                console.log("end date: " + endDate);
                console.log("is valid????" + isValid);

                res.status(200).send(isValid);
            } catch (e: any) {
                console.error("Failed to check IpBlock's expiry date, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function getLicenseOk(req: Request, res: Response) {
            try {
                const licenseKey = req.query["license-key"].toString();

                const a = await LICENSE_SERVICE.getLicense(licenseKey);

                const licenseOk = a.rows.length === 1 ? await LICENSE_SERVICE.isLicenseValid(a.rows[0]) : false;

                res.status(200).send(licenseOk);
            } catch (e: any) {
                console.error("Failed to find a license, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function getUserFromEmail(req: Request, res: Response) {
            try {
                const email = req.query.email.toString();

                // const users = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     email: email,
                //     exact: true
                // });
                //
                // if (users.length !== 1) {
                //     res.sendStatus(404);
                //     return;
                // }

                const user = await KEYCLOAK_SERVICE.getUserBasedOnEmail(email);
                if (user === undefined) {
                    res.sendStatus(404);
                    return;
                }

                const company = await MONGO_SERVICE.getCompanyUserBelongsTo(user.username);
                const concreteUser = company.contract.designers.find(e => e.name === user.username);


                res.status(200).send(JSON.stringify({
                    username: concreteUser.name,
                    email: email,
                    division: concreteUser.division,
                    company: company.contract.client
                }));
            } catch (e: any) {
                console.error("Failed to find an user from email, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function getAsset(req: Request, res: Response) {
            try {
                const companyName = req.params.companyName.toString();

                const cachedImage = imageCache.get(companyName);
                res.setHeader("Content-Type", "image/svg+xml");

                if (cachedImage) {
                    res.status(200);
                    res.send(cachedImage);
                } else {
                    const companyData = await MONGO_SERVICE.assets.getCompanyData(companyName);
                    imageCache.set(companyName, companyData.graphics.buffer);
                    res.status(200);
                    res.send(companyData.graphics.buffer);
                }
            } catch (e: any) {
                console.error("Failed to get an asset, reason: " + e.toString());
                res.sendStatus(500);
            }

        }

        export async function getDivisionsBelongingToCompany(req: Request, res: Response) {
            try {
                const company = req.query.company.toString();
                const contract = await MONGO_SERVICE.getContract(company);

                if (contract) {
                    res.status(200);
                    res.send(JSON.stringify(contract.contract.divisions));
                } else {
                    res.status(200);
                    res.send([])
                }
            } catch (e: any) {
                console.error("Failed ot get division belonging to the company, reason: " + e.toString());
                res.sendStatus(500);
            }
        }


        //TODO this function takes two params
        export async function getIpBlockPropertiesBelongingToUser(req: Request, res: Response) {
            try {

                const username = req.query.username.toString();
                const company = req.query.company.toString();

                const res3: ArtifactoryIpBlock[] = await ARTIFACTORY_SERVICE.getAllIpBlocksWithProperties();

                const ipBlocksByUser = await MONGO_SERVICE.getUserIpBlocks(username, company);

                const aaa = res3.filter((block) =>
                    ipBlocksByUser.some((ipBlock: IpBlockDef) => {//todo fix type

                        return block.properties.properties["ipblocks.id"][0] === ipBlock.name &&
                            block.properties.properties["ipblocks.version"][0] === ipBlock.version
                    })
                );


                const z: IpBlockWithProperties[] = aaa.map(e => ({
                    name: e.name,
                    properties: {
                        id: e.properties.properties["ipblocks.id"][0],
                        type: e.properties.properties["ipblocks.type"][0],
                        summary: e.properties.properties["ipblocks.summary"][0],
                        version: e.properties.properties["ipblocks.version"][0],
                        description: e.properties.properties["ipblocks.description"][0],
                        depends: e.properties.properties["ipblocks.depends"][0],
                        changelog: e.properties.properties["ipblocks.changelog"][0],
                        curated: convertTextTypeToPrimitive(e.properties.properties["ipblocks.curated"][0]),
                        owner: e.properties.properties["ipblocks.owner"][0],
                        uri: e.properties.uri,
                    }
                }));

                res.status(200)
                res.send(JSON.stringify(z));
            } catch (e: any) {
                console.error("Failed to get IpBlock's Properties Belonging To User, reason: " + e.toString());
                res.sendStatus(500);
            }
        }


        export async function getIpBlocksForCuration(req: Request, res: Response) {
            try {
                const a = await MONGO_SERVICE.getAllIpblocksForCuration();
                console.log("a", a);
                res.status(200).send(JSON.stringify(a));
            } catch (e: any) {
                console.error("Failed to get all IpBlocks for curation, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function getIpBlockProperties(req: Request, res: Response) {
            try {
                const res3: ArtifactoryIpBlock[] = await ARTIFACTORY_SERVICE.getAllIpBlocksWithProperties();
                console.log("res3", res3);
                const z: IpBlockWithProperties[] = res3
                    .filter(e => e !== undefined/* && e.properties.properties["ipblocks.curated"][0] === "true"*/) //We need to remove all undefined elements
                    .map(e => ({
                        name: e.name,
                        properties: {
                            id: e.properties.properties["ipblocks.id"][0],
                            type: e.properties.properties["ipblocks.type"][0],
                            summary: e.properties.properties["ipblocks.summary"][0],
                            version: e.properties.properties["ipblocks.version"][0],
                            description: e.properties.properties["ipblocks.description"][0],
                            depends: e.properties.properties["ipblocks.depends"][0],
                            owner: e.properties.properties["ipblocks.owner"][0],
                            curated: convertTextTypeToPrimitive(e.properties.properties["ipblocks.curated"][0]),
                            changelog: e.properties.properties["ipblocks.changelog"][0],
                            uri: e.properties.uri,
                        }
                    }));

                res.status(200)
                res.send(JSON.stringify(z));
            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }


        export async function getUserIpBlocksFromMongo(req: Request, res: Response) {
            try {

                const username: string = req.query.username.toString();
                const company: string = req.query.company.toString();

                const mongo = new MongoService(MONGO_CONFIG);
                const filter = await mongo.getUserIpBlocks(username, company);

                res.status(200);
                res.send(JSON.stringify(filter));
            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }


        //TODO in the future mix this function with purchaseAndDownload as the former does this alread, but
        // it also marks in DB the purchase, this is just straight download, currently to be used with
        // Curation process
        export async function downloadIpBlock(req: Request, res: Response) {
            try {
                const ipBlockName: string = req.query["ip-block-name"].toString();
                const ipBlockVersion: string = req.query["ip-block-version"].toString();

                await ARTIFACTORY_SERVICE.downloadIpBlock(ipBlockName, ipBlockVersion)
                    .then((destinationPath) => {
                        res.sendFile(destinationPath, (err) => {
                            if (err) {
                                res.sendStatus(500);
                            } else {
                                res.sendStatus(200);
                            }
                        })
                    })
            } catch (e: any) {
                console.error("Error occurred when trying to download an ipblock, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function purchaseAndDownloadIpBlock(req: Request, res: Response) {
            try {
                const username: string = req.query.username.toString();
                const company: string = req.query.company.toString();
                const division: string = req.query.division.toString();
                const ipBlockName: string = req.query["ip-block-name"].toString();
                const ipBlockVersion: string = req.query["ip-block-version"].toString();

                const contract = await MONGO_SERVICE.getContract(company);
                const clientAuid = contract.contract["contract-auid"];
                const divisionAuid = contract.contract.divisions.find[("division-auid")];
                const designerAuid = contract.contract.designers.find[("designer-auid")];
                const time_of_purchase = Date.now().toString();

                //INVOKE BLOCKCHAIN
                const blockchainHash = await new ContractService().addPurchase(clientAuid, divisionAuid, designerAuid, ipBlockName, ipBlockVersion, time_of_purchase);

                //MONGO ADD TO DB
                const del = await new MongoService(MONGO_CONFIG).purchaseBlock(username, company, {
                    ipblockName: ipBlockName,
                    ipblockVersion: ipBlockVersion,
                    blockchainHash: blockchainHash.toString(),
                });


                //ACTUALLY DOWNLOAD FILE AND SEND IT TO MARKETPLACE
                await ARTIFACTORY_SERVICE.downloadIpBlock(ipBlockName, ipBlockVersion)
                    .then((destinationPath) => {
                        res.sendFile(destinationPath, (err) => {
                            if (err) {
                                res.sendStatus(500);
                            }
                        })
                    });
            } catch (e: any) {
                console.error("Error happened when purchasing a block, reason: " + e.toString());
                res.sendStatus(500);
            }
        }


        export async function getExistingDivisions(req: Request, res: Response) {
            try {
                const companyName = req.query.company.toString();

                //TODO fix casting
                const mongoContract: MongoContract = await MONGO_SERVICE.getContract(companyName);

                const availableDivisions = mongoContract.contract.divisions.map(e => e.name);

                if (availableDivisions.length > 0) {
                    res.status(200);
                    res.send(JSON.stringify(availableDivisions));
                } else res.sendStatus(404);
            } catch (e: any) {
                console.error(e.toString());
                res.status(200);
                res.send([]);
            }
        }

        export async function getAvailableDivisions(req: Request, res: Response) {
            try {
                const availableDivisions = config.dropdownOptions.availableDivisions;
                res.status(200);
                res.send(JSON.stringify(availableDivisions));
            } catch (e: any) {
                console.error(e.toString());
                res.status(200);
                res.send([]);
            }
        }

        export async function getAvailableRoles(req: Request, res: Response) {
            try {

                const availableRoles = config.dropdownOptions.availableRoles;
                if (availableRoles.length > 0) {
                    res.status(200);
                    res.send(JSON.stringify(availableRoles));
                } else res.sendStatus(404);

            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }


        //TODO this function needs keycloak update
        //TODO this function is not used in our project anymore, also very out of date
        // export async function sendPdf(req: Request, res: Response) {
        //     try {
        //
        //         const username = req.query.username.toString();
        //         const email = req.query.email.toString();
        //         const batchID = req.query.id.toString();
        //
        //         const users = await KeycloakService.kcAdminClient.users.find({
        //             realm: KeycloakService.REALM_NAME,
        //             username: username.toString(),
        //             email: email.toString(),
        //             exact: true
        //         });
        //
        //         if (users.length !== 1) {
        //             res.sendStatus(404);
        //         }
        //
        //         const user = users[0];
        //         const fileInfo = req.file;
        //
        //         const mongoContract = await MONGO_SERVICE.getCompanyUserBelongsTo(username);
        //
        //         //Save PDF
        //         ///////////////
        //         if (pdfExists(username, mongoContract.contract.client, batchID)) {
        //             console.log("already exists, not saving");
        //         } else {
        //             fs.copyFileSync(fileInfo.path, `uploads/confirmed/${mongoContract.contract.client}/${batchID}/${username}.pdf`);
        //         }
        //
        //         //Save Consent Batch
        //         ///////////////
        //         const batch = getOrCreateConsentBatch(mongoContract.contract.client, batchID, fileInfo.path, [user.username]);
        //         const batchUser: {
        //             name: string;
        //             signed: boolean
        //         } | undefined = batch.users.find(e => e.name === username);
        //
        //         if (batchUser) {
        //             batchUser.signed = true;
        //         } else {
        //             batch.users.push({
        //                 name: user.username,
        //                 sent: true,
        //                 signed: true,
        //                 revoked: false
        //             })
        //         }
        //         updateConsentBatch(mongoContract.contract.client, batchID, batch)
        //
        //         res.status(200).send("OK");
        //     } catch (e: any) {
        //         console.error(e.toString());
        //         res.sendStatus(500);
        //     }
        // }

        //TODO this function needs keycloak update
        export async function documentSigned(req: Request, res: Response) {
            try {

                const username = req.query.username.toString();
                const email = req.query.email.toString();
                const id = req.query.id.toString();

                // const us = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     username: username,
                //     email: email,
                //     exact: true
                // });
                // const user = us[0];
                const user = await KEYCLOAK_SERVICE.getUser(username, email);
                if (user === undefined) {
                    res.sendStatus(404);
                    return;
                }

                const mongoContract = await MONGO_SERVICE.getCompanyUserBelongsTo(username);

                //TODO should be used as an extra check
                const exists = fs.existsSync(`uploads/confirmed/${mongoContract.contract.client}/${id}/${username}.pdf`);

                const consentBatch: ConsentBatch = JSON.parse(fs.readFileSync(`uploads/confirmed/${mongoContract.contract.client}/${id}/consent.json`).toString());
                const signedAndSent = consentBatch.users.find(e => e.name == user.username);

                res.status(200).send(JSON.stringify(signedAndSent));
            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }

        //TODO this function needs keycloak update
        //TODO we use keycloak email functionality now, I don't think this is needed
        // export async function sendEmail(req: Request, res: Response) {
        //     try {
        //
        //         const username = req.query.username.toString();
        //         const email = req.query.email.toString();
        //         const batchID = req.query.id.toString();
        //         const docName = req.query.docname.toString();
        //
        //         await KeycloakService.performKeycloakAuth()
        //         const us = await KeycloakService.kcAdminClient.users.find({
        //             realm: KeycloakService.REALM_NAME,
        //             username: username,
        //             email: email,
        //             exact: true
        //         });
        //
        //         if (us.length !== 1) {
        //             res.sendStatus(404);
        //         }
        //         const user = us[0];
        //
        //         const mongoContract = await MONGO_SERVICE.getCompanyUserBelongsTo(username);
        //         const em = new EmailService();
        //
        //         const emailSentSucessfully = await em.sendPdfEmail({
        //             username: user.username,
        //             authCode: user.attributes.uniqueIdentifier!,
        //             batchID
        //         }, docName);
        //
        //         if (!emailSentSucessfully) {
        //             res.sendStatus(404);
        //         } else {
        //             const batch = getConsentBatch(mongoContract.contract.client, batchID);
        //
        //             //TODO this _user is a temporary thing, it happens because I
        //             // force to send email to the first user from the company, whenever they are selected or not
        //             // (for debug's sake)
        //             // this.updateConsentBatch(user.attributes.company, batchID, batch);
        //             const _user = batch.users.find(e => e.name === user.username);
        //             if (_user) {
        //                 _user.sent = true;
        //                 updateConsentBatch(mongoContract.contract.client, batchID, batch);
        //             } else {
        //                 console.log("Failed to find user: " + user.username);
        //                 res.sendStatus(404);
        //             }
        //         }
        //         res.status(200).send("email sent to: " + user.email);
        //     } catch (e: any) {
        //         console.error(e.toString());
        //         res.sendStatus(500);
        //     }
        // }


        export async function createConsentBatch(req: Request, res: Response) {
            try {
                const company = req.query.company.toString();
                const docName = req.query.docname.toString();
                const batchID = req.query.id.toString();
                const users: string | string[] = req.query.users as string[];


                const batch: ConsentBatch = {
                    id: batchID,
                    company: company,
                    docName: docName,
                    users: Array.isArray(users) ?
                        users.map(e => {
                            return {name: e, signed: false, sent: false, revoked: false}
                        }) : [{name: users, signed: false, sent: false, revoked: false}]
                }
                fs.mkdirSync(`uploads/confirmed/${company}/${batchID}`, {recursive: true});
                fs.writeFileSync(`uploads/confirmed/${company}/${batchID}/consent.json`, JSON.stringify(batch, null, 2));
                res.status(200).send("OK");
            } catch (e) {
                res.sendStatus(404);
            }
        }

        export async function createCompany(req: Request, res: Response) {
            const companyName = req.query.companyName.toString();
            const companyManager = req.query.companyManager.toString();
            const group = req.query.group.toString();
            const fileInfo = req.file;
            const clientAuid = generateUniqueIdentifier();
            const divisions = [];

            const contractExists = await MONGO_SERVICE.contractExists(companyName);
            if (!contractExists) {
                //INVOKE BLOCKCHAIN
                const blockchainHash = await new AddClient().addClient(clientAuid, companyName, divisions);
                console.log("blockchainHash", blockchainHash);

                try {
                    await MONGO_SERVICE.assets.addCompanyData({
                        companyName: companyName,
                        companyManager: companyManager,
                        group: group,
                        graphics: new Binary(fs.readFileSync(fileInfo.path))
                    });
                } catch (e) {
                    console.error("FAILED TO SAVE: " + e.toString());
                }
                const addContractRes = await MONGO_SERVICE.addContract({
                    client: companyName,
                    "contract-auid": clientAuid,
                    hash: blockchainHash.toString(),
                    divisions: [],
                    designers: []
                });

                //TODO handle error here as well
                addContractRes.acknowledged ?
                    res.status(200).send(JSON.stringify(true)) :
                    res.status(200).send(JSON.stringify(false))
            } else {
                //TODO handle transaction part and revert changes, needs command pattern I think
                console.log("contractDOesnt Exist")
                res.sendStatus(500);
            }

        }

        export async function getAllCompanies(req: Request, res: Response) {
            try {
                const allCompanyData = await MONGO_SERVICE.assets.getAllCompanyData();
                const data = JSON.stringify(allCompanyData.map(e => e.companyName));
                res.status(200).send(data);
            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }

        export async function getAllGroups(req: Request, res: Response) {
            try {
                // const allGroups = await KeycloakService.kcAdminClient.groups.find({realm: KeycloakService.REALM_NAME});
                // const data = JSON.stringify(allGroups.map(e => e.name));
                const data = await KEYCLOAK_SERVICE.getAllExistingGroups();

                res.send(JSON.stringify(data));
                res.status(200);
            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }

        //TODO not used atm
        export async function revokeUserConsent(req: Request, res: Response) {
            try {
                const username = req.query.username.toString();
                const company = req.query.company.toString();
                const batchID = req.query.id.toString();

                const batch = getConsentBatch(company, batchID);

                batch.users.find(e => e.name === username).revoked = true;

                const updateStatus = updateConsentBatch(company, batchID, batch);
                res.status(200).send(JSON.stringify(updateStatus));
            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }

        export async function listUsers(req: Request, res: Response) {
            try {
                const company: string = req.query.company ? req.query.company!.toString() : "";

                //TODO this needs to be improved on, seems like keycloak has a default limit on the number of users it picks
                // I suspect large number later on will cause performance problems

                //TODO better query parameters
                const users: UserRepresentation[] = await KEYCLOAK_SERVICE.getAllUsers();

                // await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     max: 99999999
                // });

                if (company) {
                    const users3 = await MONGO_SERVICE.getUsersFromCompany(company);
                    const merged: User[] = users.map(kcUser => {
                        const designer: Designer | undefined = users3.find(e => e.name.toLowerCase() === kcUser.username.toLowerCase());
                        if (designer) {
                            return {
                                username: kcUser.username,
                                // company: company,
                                role: "Designer",
                                region: designer.division,
                                email: kcUser.email
                            }
                        } else return undefined
                    }).filter(e => e);

                    res.status(200).send(
                        JSON.stringify(merged)
                    );

                } else {
                    const allCompanies: string[] = await MONGO_SERVICE.getAllCompanyNames();

                    const mergedX: User[] = [];
                    for (const company in allCompanies) {

                        const users3 = await MONGO_SERVICE.getUsersFromCompany(company);

                        const merged: User1[] = users.map(kcUser => {
                            const designer: Designer | undefined = users3.find(e => e.name === kcUser.username);
                            if (designer) {
                                return {
                                    username: kcUser.username,
                                    company: company,
                                    role: "Designer",
                                    region: designer.division,
                                    email: kcUser.email
                                }
                            } else return undefined
                        }).filter(e => e);

                        mergedX.push(...merged);
                    }

                    res.status(200).send(
                        JSON.stringify(mergedX)
                    );
                }

            } catch (e: any) {
                console.error(e.toString());
                res.sendStatus(500);
            }
        }

        export async function createUser(req: Request, res: Response) {
            try {
                const username: string = req.query.username.toString().toLowerCase().trimEnd().trimStart();
                const usernameSplit: string[] = username.split(" ");

                const email: string = req.query.email.toString();
                //TODO regions are now divisions
                const region: string = req.query.region.toString();
                //TODO no longer needed
                const role: string = req.query.role.toString();
                const company: string = req.query.company.toString();

                //TODO client is the topmost company that manages sub-companies'
                // documents
                const client: string = req.query.client.toString();

                //TODO this should be generated on-site
                // and not passed from front-end
                const uniqueIdentifier: string = req.query.uniqueIdentifier.toString();


                const contractId = await MONGO_SERVICE.getContractId(company);

                const designer: Designer = {
                    name: username,
                    "designer-auid": generateUniqueIdentifier(),
                    hash: "",
                    division: region,
                    purchases: [],
                    publishedIpBlocks: []
                };

                const MOCK_ARTIFACTS: IpBlockDef[] = [
                    {
                        name: "codasip_urisc",
                        version: "5.0.1",
                        startDate: "",
                        endDate: ""
                    },
                    {
                        name: "codasip_alu",
                        version: "1.0.1",
                        startDate: "",
                        endDate: ""
                    }
                ]

                const contract = await MONGO_SERVICE.getContract(company);
                const clientAuid = contract.contract["contract-auid"];
                const divisionAuid = contract.contract.divisions.find[("division-auid")];
                const designerAuid = designer["designer-auid"];
                const purchase = [];
                const blockupload = [];

                //TODO we do not create a user if contract doesn't exist first!
                if (contractId) {

                    //INVOKE BLOCKCHAIN
                    const blockchainHash = await new AddDesigner().addDesigner(clientAuid, divisionAuid, designerAuid, purchase, blockupload);
                    console.log("blockchainHash", blockchainHash);
                    designer.hash = blockchainHash.toString();
                    const mongoRes = await MONGO_SERVICE.addUser(designer, contractId);
                } else {
                    const addContractRes = await MONGO_SERVICE.addContract({
                        client: company,
                        "contract-auid": "uid",
                        hash: "",
                        divisions: [{
                            name: region,
                            "division-auid": "duid",
                            hash: "",
                            blocksreleased: MOCK_ARTIFACTS,
                            designers: [designer]
                        }],
                        designers: []
                    });
                    // designers: [designer]
                    // TODO stop process if there is no contract
                    res.sendStatus(404);
                }

                // const kcAddUserRes = await KeycloakService.kcAdminClient.users.create({
                //     username: username,
                //     email: email,
                //     enabled: true,
                //     emailVerified: false,
                //     firstName: usernameSplit[0],
                //     lastName: usernameSplit[1] ? usernameSplit[1] : undefined,
                //     credentials: [
                //         {
                //             type: 'password',
                //             value: 'codasip',
                //             temporary: true,
                //         },
                //     ],
                //     attributes: {
                //         // region: region,
                //         // role: role,
                //         // company: company,
                //         uniqueIdentifier: uniqueIdentifier
                //     },
                //     realm: KeycloakService.REALM_NAME,
                //     groups: [
                //         client
                //     ]
                // });
                const kcAddUserId = await KEYCLOAK_SERVICE.createUser(username, email, client);
                // await KeycloakService.kcAdminClient.users.sendVerifyEmail({
                //     realm: KeycloakService.REALM_NAME,
                //     id: kcAddUserRes.id,
                // });

                if (kcAddUserId) {
                    await KEYCLOAK_SERVICE.sendAuthEmail(kcAddUserId);
                    res.status(200).send("Created User: " + username)
                } else {
                    res.sendStatus(404);
                }
            } catch (e) {
                res.sendStatus(404);
            }
        }

        export async function findUsername(req: Request, res: Response) {
            try {

                const username: string = req.query.username.toString();

                // const user = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     username: username,
                //     exact: true,
                // });
                const user = await KEYCLOAK_SERVICE.getUserBasedOnUsername(username);

                // const mongoUser: Designer = await MONGO_SERVICE.getAllUsers()
                //     .then(e => e.find(a =>
                //         a.name === user[0].username)
                //     )
                const mongoUser: Designer = await MONGO_SERVICE.getUser(username);


                if (user && mongoUser) {
                    const id = user.id!;
                    res.status(200).send(id);
                } else if (user || !mongoUser) {
                    res.sendStatus(204);
                } else {
                    //TODO there might be need for different code
                    res.sendStatus(204);
                }
            } catch (e: any) {
                console.error("Failed to find a user, reason: " + e.toString());
                res.sendStatus(500);
            }

        }

        export async function findEmail(req: Request, res: Response) {
            try {

                const email: string = req.query.email.toString();

                // const user = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     email: email,
                //     exact: true
                // });

                const user = await KEYCLOAK_SERVICE.getUserBasedOnEmail(email);

                if (user) {
                    res.status(200).send(user.id);
                } else {
                    //TODO there might be need for different code
                    res.sendStatus(204);
                }
            } catch (e: any) {
                console.error("Failed to find an email, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function listBatches(req: Request, res: Response) {
            try {

                const company: string = req.query.company.toString();

                if (fs.existsSync(`uploads/confirmed/${company}`)) {
                    const list = fs.readdirSync(`uploads/confirmed/${company}/`);
                    if (list) {
                        res.status(200).send(JSON.stringify(list));
                    }
                } else {
                    res.status(200).send([]);
                }
            } catch (e: any) {
                console.error("Failed to list batches, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        //TODO for now assumes its only one group
        export async function getGroupUserBelongsTo(req: Request, res: Response) {
            try {

                const username: string = req.query.username.toString();
                console.log("username: " + username);

                const a = await KEYCLOAK_SERVICE.getUserBasedOnUsername(username);

                console.log(JSON.stringify(a, null, 2));

                // const a = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     username: username,
                //     exact: true
                // });

                // const mongoUser: Designer = await MONGO_SERVICE.getAllUsers()
                //     .then(e => e.find(a =>
                //         a.name === a[0].username)
                //     )
                const mongoUser: Designer = await MONGO_SERVICE.getUser(username);

                console.log("Mongo User: " + JSON.stringify(mongoUser, null, 2));

                //TODO reactive this if statement after testing
                if (a && mongoUser) {
                    // const c = await KeycloakService.kcAdminClient.users.listGroups({
                    //     realm: KeycloakService.REALM_NAME,
                    //     id: a.id
                    // })
                    const c = await KEYCLOAK_SERVICE.getGroupsUserBelongsIn(a.id);
                    res.status(200).send(JSON.stringify(c[0].name));
                } else {
                    //TODO because of JAmie we need to temporarily assume user might NOT be in mongo
                    // also JAmie is in both realms, making it weird
                    const c = await KEYCLOAK_SERVICE.getGroupsUserBelongsIn(a.id);
                    // const c = await KeycloakService.kcAdminClient.users.listGroups({
                    //     realm: KeycloakService.REALM_NAME,
                    //     id: a.id
                    // })
                    res.status(200).send(JSON.stringify(c[0].name));
                    // res.sendStatus(404);
                }

            } catch (e: any) {
                console.error("Failed to get a group a user belongs to, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function getBatch(req: Request, res: Response) {
            try {

                const company: string = req.query.company.toString();
                const id: string = req.query.id.toString();

                const batch = getConsentBatch(company, id);

                if (batch) {
                    res.status(200).send(JSON.stringify(batch));
                } else {
                    res.sendStatus(404);
                }
            } catch (e: any) {
                console.error("Failed to get a batch, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function deleteUser(req: Request, res: Response) {
            try {
                const username: string = req.query.username.toString();
                const email: string = req.query.email.toString();

                // const user = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     username: username,
                //     email: email,
                //     exact: true
                // });

                // const user = await KEYCLOAK_SERVICE.getUser(username, email);

                const company = await MONGO_SERVICE.getCompanyUserBelongsTo(username);

                const removeUserRes = await KEYCLOAK_SERVICE.removeUser(username, email);

                if (removeUserRes) {
                    // const id = user.id;

                    //TODO add check if both were successful
                    // await KeycloakService.kcAdminClient.users.del({realm: KeycloakService.REALM_NAME, id: id})
                    await MONGO_SERVICE.deleteUserFromCompany(company.contract.client, username) //todo find company name


                    res.status(200).send("Removed user successfully")
                } else {
                    res.sendStatus(404);
                }
            } catch (e: any) {
                console.error("Failed to delete a user, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function uploadDoc(req: Request, res: Response) {
            try {
                const company: string = req.query.company.toString();
                const docName: string = req.query.docname.toString();

                const storage = new DocumentStorage(company);
                const fileInfo: Express.Multer.File = req.files[0];

                const putDocumentResult = storage.putDocument(fileInfo.path, docName);

                res.status(200).send(putDocumentResult)
            } catch (e: any) {
                console.error("Failed to upload a document, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        //TODO describe better that this is a list of names
        export async function getDocuments(req: Request, res: Response) {
            const company: string = req.query.company.toString();
            const storage = new DocumentStorage(company);
            const documents = storage.listDocuments();

            res.status(200).send(JSON.stringify(documents));
        }

        //TODO describe better that this is returning a pdf blob
        export async function getDocument(req: Request, res: Response) {
            try {

                const company: string = req.query.company.toString();
                const docName: string = req.query.docname.toString();

                const storage = new DocumentStorage(company);
                const docPath = storage.getDocumentPath(docName);
                const document = fs.statSync(docPath);

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Length', document.size);

                const stream = fs.createReadStream(docPath);
                stream.pipe(res);
            } catch (e: any) {
                console.error("Failed to get a document, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        //TODO not plurar, currently only one signature
        export async function getSignatures(req: Request, res: Response) {
            try {

                const company: string = req.query.company.toString();
                const docName: string = req.query.docname.toString();

                const storage = new DocumentStorage(company);
                const signatures = storage.getSignatures(docName);

                res.status(200).send(JSON.stringify(signatures));
            } catch (e: any) {
                console.error("Failed to get a signature, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function putSignature(req: Request, res: Response) {
            try {

                const company: string = req.query.company.toString();
                const docName: string = req.query.docname.toString();

                const signatures: SignatureBox[] = req.body;
                const storage = new DocumentStorage(company);

                const putSignatureResult = storage.putSignature(signatures, company, docName)
                res.status(200).send(JSON.stringify(putSignatureResult));
            } catch (e: any) {
                console.error("Failed to put a signature, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function getCompaniesAssociatedWithClient(req: Request, res: Response) {
            try {
                const username: string = req.query.username.toString();
                // const a = await KeycloakService.kcAdminClient.users.find({
                //     realm: KeycloakService.REALM_NAME,
                //     username: username,
                //     exact: true
                // });

                const a = await KEYCLOAK_SERVICE.getUserBasedOnUsername(username);
                //TODO logic check length of ARr to be 1

                const c = await KEYCLOAK_SERVICE.getGroupsUserBelongsIn(a.id);

                // const c = await KeycloakService.kcAdminClient.users.listGroups({
                //     realm: KeycloakService.REALM_NAME,
                //     id: a.id
                // });

                const groupName = c[0].name;
                const companyData = await MONGO_SERVICE.assets.getAllCompanyData()//companyStorage.getCompanyData();
                const companiesAssociated = companyData.filter(e => e.group === groupName).map(e => e.companyName);
                res.status(200).send(JSON.stringify(companiesAssociated));
            } catch (e: any) {
                console.error("Failed to get companies associated with the client, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function editExistingUser(req: Request, res: Response) {
            const oldUsername: string = req.query[`old-username`].toString();
            const oldEmail: string = req.query[`old-email`].toString();

            //TODO those two fields might be unnecessary
            // const oldRole: string = req.query[`old-role`].toString();
            // const oldRegion: string = req.query[`old-region`].toString();

            const newUsername: string = req.query[`new-username`].toString();
            const newEmail: string = req.query[`new-email`].toString();
            //TODO no longer needed
            // const newRole: string = req.query[`new-role`].toString();

            const newRegion: string = req.query[`new-region`].toString();

            // const kcUser = await KeycloakService.kcAdminClient.users.find(
            //     {
            //         realm: KeycloakService.REALM_NAME,
            //         username: oldUsername,
            //         email: oldEmail,
            //         exact: true
            //     }
            // );

            const updateUserResult = await KEYCLOAK_SERVICE.updateUser({
                username: oldUsername, email: oldEmail
            }, {
                username: newUsername, email: newEmail
            })

            const mongoUser = await MONGO_SERVICE.getUser(oldUsername);

            if (!updateUserResult) {
                res.status(200).send(JSON.stringify(false));
            } else {
                // const concreteUser = updateUserResult;
                // concreteUser.username = newUsername;
                // concreteUser.email = newEmail;

                mongoUser.division = newRegion;
                mongoUser.name = newUsername;

                try {
                    const mongoRes = await MONGO_SERVICE.editUser(oldUsername, mongoUser.name, mongoUser.division);
                    if (mongoRes) {
                        // const kcUpdateResult = await KeycloakService.kcAdminClient.users.update({
                        //     id: concreteUser.id,
                        //     realm: KeycloakService.REALM_NAME
                        // }, concreteUser);

                        res.status(200).send(JSON.stringify(true));
                    } else {
                        res.status(200).send(JSON.stringify(false));
                    }

                } catch (e) {
                    res.sendStatus(404);
                    console.error("Error occurred when updating user data: " + e);
                }
            }
        }


        export async function getCompanyData(req: Request, res: Response) {
            try {
                const companyName: string = req.query[`companyName`].toString();

                const allCompanyData = await MONGO_SERVICE.assets.getAllCompanyData();
                const graphicRoute = allCompanyData.find(e => e.companyName === companyName);

                if (graphicRoute) {
                    res.send(graphicRoute);
                    res.status(200);
                } else {
                    res.sendStatus(404);
                }
            } catch (e: any) {
                console.error("Failed to retrieve companyData, reason: " + e.toString());
                res.sendStatus(500);
            }
        }

        export async function contractExists(req: Request, res: Response) {
            const company = req.query.company.toString();

            const contractAlreadyExists = await MONGO_SERVICE.contractExists(company);


            if (contractAlreadyExists !== undefined) {
                res.status(200);
                res.send(contractAlreadyExists)
            } else {
                res.status(200).send(false);
            }
        }

    }

    export namespace Post {

        export async function approveIpblockForCuration(req: Request, res: Response) {
            try {
                const repoKey = req.query.ipblockFullName.toString();
                const username = req.query.username.toString();
                const ipBlockName = req.query.ipblockName.toString()
                const ipBlockVersion = req.query.ipblockVersion.toString()

                const fileChecksum = await MONGO_SERVICE.getFileChecksumFromIpBlockName(repoKey);
                console.log("data", fileChecksum);

                const designerAuid = (await MONGO_SERVICE.getUser(username))["designer-auid"];

                const data = await MONGO_SERVICE.getClientAndDesignerWithDivision(designerAuid);

                const clientAuid = data.clientid;
                const divisionAuid = await MONGO_SERVICE.getDivisionId(data.clientName, data.designer.division);
                const curationStatus = "Verified";

                const blockchainHash = await new UpdateCurationStatus().updateCurationStatus(clientAuid, divisionAuid, designerAuid, fileChecksum, curationStatus);

                console.log("hash", blockchainHash.toString());

                await ARTIFACTORY_SERVICE.approveIpBlock(repoKey);

                await MONGO_SERVICE.approveIpBlock(username, ipBlockName, ipBlockVersion);

                res.sendStatus(200)
            } catch (error) {
                console.error('Error approving artifact properties:', error.message);
                res.sendStatus(404)
            }

        }

        export async function rejectIpblockForCuration(req: Request, res: Response) {
            try {
                const repoKey = req.query.ipblockFullName.toString();
                const username = req.query.username.toString();
                const ipBlockName = req.query.ipblockName.toString()
                const ipBlockVersion = req.query.ipblockVersion.toString()

                const fileChecksum = await MONGO_SERVICE.getFileChecksumFromIpBlockName(repoKey);
                console.log("data", fileChecksum);

                const designerAuid = (await MONGO_SERVICE.getUser(username))["designer-auid"];

                const data = await MONGO_SERVICE.getClientAndDesignerWithDivision(designerAuid);

                const clientAuid = data.clientid;
                const divisionAuid = await MONGO_SERVICE.getDivisionId(data.clientName, data.designer.division);
                const curationStatus = "Rejected";

                const blockchainHash = await new UpdateCurationStatus().updateCurationStatus(clientAuid, divisionAuid, designerAuid, fileChecksum, curationStatus);
                console.log("hash", blockchainHash.toString());

                await ARTIFACTORY_SERVICE.rejectIpBlock(repoKey);

                await MONGO_SERVICE.rejectIpBlock(username, ipBlockName, ipBlockVersion);

                res.sendStatus(200)
            } catch (error) {
                console.error('Error rejecting artifact properties:', error.message);
                res.sendStatus(404)
            }
        }

        export async function uploadIndieIpBlock(req: Request, res: Response) {

            const username = req.query.username.toString();

            const designerAuid = (await MONGO_SERVICE.getUser(username))["designer-auid"];

            const data = await MONGO_SERVICE.getClientAndDesignerWithDivision(designerAuid);
            const fileContent = fs.readFileSync(req.file.path);

            const props: {
                owner: string, //derived
                curated: string, //derived
                id: string,
                version: string,
                changelog: string,
                type: string,
                summary: string,
                description: string,
                depends: string
            } = req.body;

            console.log("do we have anything in the body: " + JSON.stringify(props, null, 2));

            const fileHash = await generateFileHash(req.file.path);

            const clientAuid = data.clientid;
            const divisionAuid = await MONGO_SERVICE.getDivisionId(data.clientName, data.designer.division);

            const curationStatus = "Loaded";
            const time_of_upload = Date.now().toString();

            const blockchainHash = await new UploadIpBlock().uploadIpblock(clientAuid, divisionAuid, designerAuid, fileHash, curationStatus, time_of_upload);
            console.log("hash", blockchainHash.toString());

            const fullArtifactName = `${props.id}_${props.version}.zip`;

            // const input = {
            //     "path": req.file.path
            // }
            // console.log("inputs", input);
            // var upload = axios.post("http://localhost:3007/api/uploadIpBlock", input);
            // console.log("upload", upload);

            const test = await ARTIFACTORY_SERVICE.uploadIpBlock(fileContent, fullArtifactName, props);

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////

            //TODO mongo add to user's published ip blocks?
            const mongoRes = await MONGO_SERVICE.userPublishIpBlock(username, {
                ipblockName: props.id,
                ipblockVersion: props.version,
                blockchainHash: blockchainHash.toString(),
                fileChecksum: fileHash,
                curationStatus: curationStatus,
            });
            //TODO error handling
            console.log("mongo res?: " + JSON.stringify(mongoRes, null, 2));

            res.sendStatus(200);
        }

        export async function createIndieUser(req: Request, res: Response) {
            try {
                const username = req.query.username.toString();
                const division = req.query.division.toString();

                const usernameSplit: string[] = username.split(" ");

                const email = req.query.email.toString();

                const password = req.body.password.toString();

                const contractId = await MONGO_SERVICE.getContractId(config.indie.name);

                if (contractId) {
                    const contract = await MONGO_SERVICE.getContract(config.indie.name);
                    const clientAuid = contract.contract["contract-auid"];
                    const divisionAuid = contract.contract.divisions.find[("division-auid")];
                    const designerAuid = generateUniqueIdentifier();
                    const purchase = [];
                    const blockupload = [];

                    const blockchainHash = await new AddDesigner().addDesigner(clientAuid, divisionAuid, designerAuid, purchase, blockupload);
                    console.log("hash", blockchainHash.toString());

                    const addUserRes = await MONGO_SERVICE.addUser({
                        name: username,
                        division: division,
                        hash: blockchainHash.toString(),
                        "designer-auid": clientAuid,
                        purchases: [],
                        publishedIpBlocks: []
                    }, contractId);

                    // const addUserKcRes = await KeycloakService.kcAdminClient.users.create({
                    //     username: username,
                    //     email: email,
                    //     enabled: true,
                    //     emailVerified: false,
                    //     firstName: usernameSplit[0],
                    //     lastName: usernameSplit[1] ? usernameSplit[1] : undefined,
                    //     credentials: [{
                    //         type: "password",
                    //         value: password,
                    //         temporary: true
                    //     }],
                    //     attributes: {
                    //         // region: region,
                    //         // role: role,
                    //         // company: company,
                    //         uniqueIdentifier: "todo"
                    //     },
                    //     realm: KeycloakService.REALM_NAME,
                    //     groups: [
                    //         config.indie.group
                    //     ]
                    // });

                    const indieUserId = await KEYCLOAK_SERVICE.createIndieUser(username, email, password);
                    const sendEmailRes = await KEYCLOAK_SERVICE.sendAuthEmail(indieUserId)

                    // await KeycloakService.kcAdminClient.users.sendVerifyEmail({
                    //     realm: KeycloakService.REALM_NAME,
                    //     id: addUserKcRes.id,
                    // });

                    if (addUserRes.modifiedCount > 0 && indieUserId) {
                        res.status(200).send("ok");
                    } else {
                        console.error("Failed to update mongo db when creating Indie User");
                        res.sendStatus(401)
                    }
                } else {
                    console.error("Failed to create a Indie User");
                    res.sendStatus(400);
                }
            } catch (e: any) {
                res.sendStatus(401)
                console.error("Failed to create a Indie User, reason: " + e.toString());
            }
        }

        export async function addDivision(req: Request, res: Response) {
            const company = req.query.company.toString();
            const division = req.query.division.toString();

            const contract = await MONGO_SERVICE.getContract(company);

            const divisionAlreadyExists = !!contract.contract.divisions.find(e => e.name === division)

            if (divisionAlreadyExists) {
                console.error("Division already exists, refuse to add it");
                res.sendStatus(400);
                return;
            } else {
                const ipblocks: IpBlockDef[] = req.body;
                if (ipblocks) {
                    console.log("found ipblocks: " + JSON.stringify(ipblocks, null, 2));
                } else {
                    console.log("no ip blocks in the request");
                }

                console.log("ipblocks", ipblocks);
                const clientAuid = contract.contract["contract-auid"]
                const divisionAuid = generateUniqueIdentifier();
                const blockReleased = ipblocks;
                const designers = [];

                if (contract) {
                    //INVOKE BLOCKCHAIN
                    const blockchainHash = await new AddDivision().addDivision(clientAuid, divisionAuid, division, blockReleased, designers);
                    console.log("blockchainHash", blockchainHash);
                    await MONGO_SERVICE.addDivision(company, divisionAuid, blockchainHash.toString(), division, ipblocks)

                    res.status(200).send(JSON.stringify(true)); //blockchainHash.modifiedCount > 0));
                } else {
                    res.status(200).send(JSON.stringify(false));
                }
            }
        }

        export async function removeDivision(req: Request, res: Response) {
            const company = req.query.company.toString();
            const division = req.query.division.toString();

            const contractAlreadyExists = await MONGO_SERVICE.contractExists(company);

            if (contractAlreadyExists) {
                const removeDivisionResult = await MONGO_SERVICE.removeDivision(company, division);

                res.status(200).send(JSON.stringify(removeDivisionResult.modifiedCount > 0));
            } else {
                res.status(200).send(JSON.stringify(false));
            }

        }

        export async function createContract(req: Request, res: Response) {
            const company = req.query.company.toString();
            const divisions = [];
            const clientAuid = generateUniqueIdentifier();
            const contractAlreadyExists = await MONGO_SERVICE.contractExists(company);

            if (!contractAlreadyExists) {
                //INVOKE BLOCKCHAIN
                const blockchainHash = await new AddClient().addClient(clientAuid, company, divisions,);
                console.log("blockchainHash", blockchainHash);
                console.log("type", typeof (blockchainHash));
                const getCall = async () => {
                    const result = await MONGO_SERVICE.addContract({
                        client: company,
                        "contract-auid": clientAuid,
                        hash: "",
                        divisions: [],
                        designers: []
                    });

                    result.acknowledged ?
                        res.sendStatus(200) :
                        res.sendStatus(404);
                }
                if (blockchainHash != undefined) {
                    getCall();
                }
            } else {
                res.status(200).send(false);
            }
        }

        export async function postAddIpBlockToDivision(req: Request, res: Response) {
            try {
                const company = req.query.company.toString();
                const division = req.query.division.toString();
                const ipBlock = req.query.ipblock.toString();
                const ipBlockVersion = req.query.ipblockversion.toString();

                const startDate = req.query["start-date"] ? req.query["start-date"].toString() : undefined;
                const endDate = req.query["end-date"] ? req.query["end-date"].toString() : undefined;

                const ipblock_auid = "ip_001";
                const releaseDate = "14242536373";

                const blockAlreadyExists = await MONGO_SERVICE.ipBlockExistsInDivision(company, division, {
                    name: ipBlock,
                    version: ipBlockVersion,
                    startDate: startDate,
                    endDate: endDate
                });
                if (!blockAlreadyExists) {

                    //INVOKE BLOCKCHAIN
                    // const blockchainHash = await new AddIpblock().addIpblock(ipblock_auid, ipBlock, ipBlockVersion, releaseDate);


                    const result = await MONGO_SERVICE.addIpBlock(company, division, {
                        name: ipBlock,
                        version: ipBlockVersion,
                        //hash : blockchainHash.toString()
                        startDate: startDate,
                        endDate: endDate

                    });
                    console.log("Result: " + JSON.stringify(result, null, 2));
                    if (result.modifiedCount > 0) { //TOOD make sure that makes sense
                        res.status(200).send(JSON.stringify(true));
                    } else {
                        res.status(200).send(JSON.stringify(false));
                    }
                }


            } catch (e: any) {
                console.error("Failed to add ipblock to the division, reason: " + e.toString());
                res.sendStatus(500);
            }
        }


    }
}
