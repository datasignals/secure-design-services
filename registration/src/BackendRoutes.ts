import axios, {AxiosResponse} from "axios";
import {IpBlockDef} from "./common/Contract";
import config from "./config.json"
import {IpBlockWithProperties} from "./common/ArtifactoryIpBlock";

export default class BackendRoutes {

    static BACKEND_ADDRESS = config.backendAddress

    public static ROUTE_ASSET = (assetName: string) => {
        return encodeURI(BackendRoutes.BACKEND_ADDRESS + `/assets/${assetName}`);
    }

    public static ROUTE_ASSET_COMPANY = (assetName: string) => {
        return encodeURI(BackendRoutes.BACKEND_ADDRESS + `/assets/company/${assetName}`);
    }

    public static ROUTE_GET_COMPANY_ASSET = (companyName: string) => {
        return encodeURI(BackendRoutes.BACKEND_ADDRESS + `/assets/company/test/${companyName}`);
    }


    public static ROUTE_LIST_USERS = (company?: string) =>
        company ?
            axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/list-users?company=${company}`)) :
            axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + "/list-users"));


    public static ROUTE_FIND_USER_FROM_EMAIL = (email: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/find-user?email=${email}`));

    public static ROUTE_FIND_USERNAME = (username: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/find-username?username=${username}`));

    public static ROUTE_FIND_EMAIL = (email: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/find-email?email=${email}`));

    //TODO change to POSt
    public static ROUTE_DELETE_USER = (username: string, email: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/delete-user?username=${username}&email=${email}`));

    public static ROUTE_SEND_EMAIL = (username: string, email: string, batchID: string, docName: string) =>
        //TODO change to post
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/send-email?username=${username}&email=${email}&id=${batchID}&docname=${docName}`));

    public static ROUTE_CREATE_BATCH = (company: string, id: string, docName: string, users: string[]) =>
        //TODO change to POST
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/create-batch?company=${company}&docname=${docName}&id=${id}${users.map(e => `&users=${e}`).reduce((a, b) => a + b)}`));


    public static ROUTE_GET_BATCH = (company: string, id: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-batch?company=${company}&id=${id}`));

    public static ROUTE_CREATE_USER = (
        username: string,
        email: string,
        region: string,
        role: string,
        company: string,
        //TODO this seems to not be used
        uniqueIdentifier: string,
        client: string
    ) =>
        //TODO change to POST
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/create-user?username=${username}&email=${email}&region=${region}&role=${role}&company=${company}&uniqueIdentifier=${uniqueIdentifier}&client=${client}`));


    public static ROUTE_SEND_PDF = (username: string, email: string, batchID: string, body: any) => {
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/send-pdf?username=${username}&email=${email}&id=${batchID}`), body);
    }

    public static ROUTE_DOCUMENT_SIGNED = (username: string, email: string, batchID: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/document-signed?username=${username}&email=${email}&id=${batchID}`))

    public static ROUTE_LIST_BATCHES = (company: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/list-batches?company=${company}`));

    public static ROUTE_REVOKE_USER_CONSENT = (username: string, company: string, batchID: string) =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/revoke-user-consent?username=${username}&company=${company}&id=${batchID}`));

    public static ROUTE_UPLOAD_DOC = (company: string, docName: string, body: any) =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/upload-doc?company=${company}&docname=${docName}`));

    public static ROUTE_GET_DOCUMENTS = (company: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-documents?company=${company}`));

    public static ROUTE_GET_DOCUMENT = (company: string, docName: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-document?company=${company}&docname=${docName}`));

    public static ROUTE_GET_SIGNATURE = (company: string, docName: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-signature?company=${company}&docname=${docName}`));

    public static ROUTE_POST_PUT_SIGNATURE = (company: string, docName: string, body: any) =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/put-signature?company=${company}&docname=${docName}`), body, {
            headers: {
                'Content-Type': "application/json"
            }
        });

    public static ROUTE_GET_GROUP_USER_BELONGS = (username: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-group-user-belongs?username=${username}`));

    public static ROUTE_GET_COMPANIES_ASSOCIATED_WITH_CLIENT = (username: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-companies-associated-with-client?username=${username}`));

    public static ROUTE_GET_COMPANIES = () =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-companies`));

    public static ROUTE_GET_GROUPS = () =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + '/get-groups'));

    public static ROUTE_EDIT_EXISTING_USER = (oldUsername: string, oldEmail: string, oldRole: string, oldRegion: string, newUsername: string, newEmail: string, newRole: string, newRegion: string) =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/edit-existing-user?old-username=${oldUsername}&old-email=${oldEmail}&old-role=${oldRole}&old-region=${oldRegion}&new-username=${newUsername}&new-email=${newEmail}&new-role=${newRole}&new-region=${newRegion}`));

    public static ROUTE_CREATE_COMPANY = (company: string, manager: string, group: string, body: any) =>
        axios.post(encodeURI(
            BackendRoutes.BACKEND_ADDRESS + `/create-company?companyName=${company}&companyManager=${manager}&group=${group}`),
            body,
            {headers: {"Content-Type": "multipart/form-data"}}
        );

    public static ROUTE_CREATE_INDIE_USER = (username: string, divisionName: string, email: string, password: string) =>
        axios.post(
            encodeURI(BackendRoutes.BACKEND_ADDRESS + `/indie/user/create?username=${username}&division=${divisionName}&email=${email}`),
            {password: password},
        )

    public static ROUTE_UPLOAD_INDIE_IPBLOCK = (ipblockName: string, ipblockFile: File) =>
        axios.post(
            encodeURI(BackendRoutes.BACKEND_ADDRESS + `/indie/ipblock/upload?ipblockName=${ipblockName}`),
            {ipblockFile: ipblockFile}
        )

    // public static ROUTE_GET_COMPANY_IMAGE = (companyName: string) =>
    //     axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-company-image?companyName=${companyName}`));

    public static ROUTE_GET_COMPANY_DATA = (companyName: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-company-data?companyName=${companyName}`));


    public static ROUTE_GET_AVAILABLE_ROLES = () =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-available-roles`));

    public static ROUTE_GET_EXISTING_DIVISIONS = (company: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-existing-divisions?company=${company}`));

    public static ROUTE_GET_AVAILABLE_DIVISIONS = (): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-available-divisions`));

    public static ROUTE_GET_DIVISIONS_BELONGING_TO_COMPANY = (company: string): Promise<AxiosResponse<any, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/division?company=${company}`))

    public static ROUTE_GET_IPBLOCK_PROPERTIES = (): Promise<AxiosResponse<any, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/properties/all`))

    public static ROUTE_GET_IPBLOCKS_FOR_CURATION = (): Promise<AxiosResponse<IpBlockWithProperties[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/curation/all`))

    //TODO rename this route
    public static ROUTE_POST_ADD_IPBLOCK_TO_DIVISION = (company: string, division: string, ipBlock: IpBlockDef) =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/mongo/division/add?company=${company}&division=${division}&ipblock=${ipBlock.name}&ipblockversion=${ipBlock.version}`));

    public static ROUTE_GET_USERS_IPBLOCKS = (username: string, company: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/mongo/ipblock?username=${username}&company=${company}`))


    public static ROUTE_POST_ADD_DIVISION = (company: string, division: string, body?: IpBlockDef[]): Promise<AxiosResponse<any, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/division/add?company=${company}&division=${division}`), body)

    public static ROUTE_POST_REMOVE_DIVISION = (company: string, division: string): Promise<AxiosResponse<any, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/division/remove?company=${company}&division=${division}`))

    public static ROUTE_GET_CONTRACT_EXISTS = (company: string): Promise<AxiosResponse<any, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/exists?company=${company}`))

    public static ROUTE_POST_ADD_CONTRACT = (company: string): Promise<AxiosResponse<any, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/add?company=${company}`))
}
