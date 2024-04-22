import {IpBlock} from "./Contract";

export default interface User {
    username: string,
    company: string,
    role: string,
    region: string, //todo there are no regions, but divisions now
    email: string,
    purchasedIpBlocks?: IpBlock[],
    uniqueIdentifier?: string
    toDelete?: boolean
    sent?: boolean,
    signed?: boolean,
    revoked?: boolean,
    selected?: boolean
    canEdit?: boolean
}
