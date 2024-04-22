import {IpBlock} from "./Contract";

export default interface User {
    username: string,
    company: string, //TODO this one is technically not needed anymore
    role: string,
    region: string, //todo there are no regions, but divisions now
    email: string,
    purchasedIpBlocks?: IpBlock[], //TODO is this one needed?
    uniqueIdentifier?: string //todo is this one needed?
    toDelete?: boolean
    sent?: boolean,
    signed?: boolean,
    revoked?: boolean,
    selected?: boolean
    canEdit?: boolean
}
