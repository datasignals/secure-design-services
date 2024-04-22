import axios, {AxiosResponse} from "axios";
import {Division, IpBlock, IpBlockDef} from "./common/Contract";
import config from "./config.json"
import User from "./common/User";
import ConsentBatch from "./common/ConsentBatch";
import SignatureBox from "./common/SignatureBox";
import CompanyData from "./common/CompanyData";
import {IpBlockWithProperties} from "./common/ArtifactoryIpBlock";

export default class BackendRoutes {

    static readonly BACKEND_ADDRESS = config.backendAddress
    static readonly KAFKALISTENER_ADDRESS = config.kafkslistenerAddress


    // public static ROUTE_ASSET = (assetName: string) => {
    //     return encodeURI(BackendRoutes.BACKEND_ADDRESS + `/assets/${assetName}`);
    // }
    //
    // public static ROUTE_ASSET_COMPANY = (assetName: string) => {
    //     return encodeURI(BackendRoutes.BACKEND_ADDRESS + `/assets/company/${assetName}`);
    // }

    public static ROUTE_GET_COMPANY_ASSET = (companyName: string) => {
        return encodeURI(BackendRoutes.BACKEND_ADDRESS + `/assets/company/test/${companyName}`);
    }

    public static ROUTE_GET_LICENSE_OK = (licenseKey: string): Promise<AxiosResponse<boolean, any>> =>
        axios.get<boolean>(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/license?license-key=${licenseKey}`));

    public static ROUTE_LIST_USERS = (company?: string): Promise<AxiosResponse<User[], any>> =>
        company ?
            axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/list-users?company=${company}`)) :
            axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + "/list-users"));


    public static ROUTE_FIND_USER_FROM_EMAIL = (email: string): Promise<AxiosResponse<string, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/find-user?email=${email}`));

    public static ROUTE_FIND_USERNAME = (username: string): Promise<AxiosResponse<string, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/find-username?username=${username}`));

    public static ROUTE_FIND_EMAIL = (email: string): Promise<AxiosResponse<string, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/find-email?email=${email}`));

    //TODO change to POSt
    //TODO change the response from string that just says "ok" back to boolean value
    public static ROUTE_DELETE_USER = (username: string, email: string): Promise<AxiosResponse<string, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/delete-user?username=${username}&email=${email}`));

    public static ROUTE_SEND_EMAIL = (username: string, email: string, batchID: string, docName: string): Promise<AxiosResponse<string, any>> =>
        //TODO change to post
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/send-email?username=${username}&email=${email}&id=${batchID}&docname=${docName}`));

    //TODO change the response from string that just says "ok" back to boolean value
    public static ROUTE_CREATE_BATCH = (company: string, id: string, docName: string, users: string[]): Promise<AxiosResponse<string, any>> =>
        //TODO change to POST
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/create-batch?company=${company}&docname=${docName}&id=${id}${users.map(e => `&users=${e}`).reduce((a, b) => a + b)}`));


    public static ROUTE_GET_BATCH = (company: string, id: string): Promise<AxiosResponse<ConsentBatch, any>> =>
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
    ): Promise<AxiosResponse<string, any>> =>
        //TODO change to POST
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/create-user?username=${username}&email=${email}&region=${region}&role=${role}&company=${company}&uniqueIdentifier=${uniqueIdentifier}&client=${client}`));


    public static ROUTE_SEND_PDF = (username: string, email: string, batchID: string, body: any): Promise<AxiosResponse<string, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/send-pdf?username=${username}&email=${email}&id=${batchID}`), body);

    public static ROUTE_DOCUMENT_SIGNED = (username: string, email: string, batchID: string): Promise<AxiosResponse<{
        name: string,
        sent: boolean,
        signed: boolean,
        revoked: boolean
    }, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/document-signed?username=${username}&email=${email}&id=${batchID}`))

    public static ROUTE_LIST_BATCHES = (company: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/list-batches?company=${company}`));

    public static ROUTE_REVOKE_USER_CONSENT = (username: string, company: string, batchID: string): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/revoke-user-consent?username=${username}&company=${company}&id=${batchID}`));

    public static ROUTE_UPLOAD_DOC = (company: string, docName: string, body: any): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/upload-doc?company=${company}&docname=${docName}`));

    public static ROUTE_GET_DOCUMENTS = (company: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-documents?company=${company}`));

    public static ROUTE_GET_DOCUMENT = (company: string, docName: string): Promise<AxiosResponse<Blob, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-document?company=${company}&docname=${docName}`));

    public static ROUTE_GET_SIGNATURE = (company: string, docName: string): Promise<AxiosResponse<SignatureBox[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-signature?company=${company}&docname=${docName}`));

    public static ROUTE_POST_PUT_SIGNATURE = (company: string, docName: string, body: any): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/put-signature?company=${company}&docname=${docName}`), body, {
            headers: {
                'Content-Type': "application/json"
            }
        });

    public static ROUTE_GET_GROUP_USER_BELONGS = (username: string): Promise<AxiosResponse<string, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-group-user-belongs?username=${username}`));

    public static ROUTE_GET_COMPANIES_ASSOCIATED_WITH_CLIENT = (username: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-companies-associated-with-client?username=${username}`));

    public static ROUTE_GET_COMPANIES = (): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-companies`));

    public static ROUTE_GET_GROUPS = (): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + '/get-groups'));

    public static ROUTE_EDIT_EXISTING_USER = (oldUsername: string, oldEmail: string, newUsername: string, newEmail: string, newRole: string): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/edit-existing-user?old-username=${oldUsername}&old-email=${oldEmail}&new-username=${newUsername}&new-email=${newEmail}&new-role=${newRole}`));

    public static ROUTE_CREATE_COMPANY = (company: string, manager: string, group: string, body: any): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(
                BackendRoutes.BACKEND_ADDRESS + `/create-company?companyName=${company}&companyManager=${manager}&group=${group}`),
            body,
            {headers: {"Content-Type": "multipart/form-data"}}
        );


    public static ROUTE_GET_COMPANY_DATA = (companyName: string): Promise<AxiosResponse<CompanyData, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-company-data?companyName=${companyName}`));

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


    public static ROUTE_GET_AVAILABLE_ROLES = (): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-available-roles`));

    public static ROUTE_GET_EXISTING_DIVISIONS = (company: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-existing-divisions?company=${company}`));

    public static ROUTE_GET_AVAILABLE_DIVISIONS = (): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/get-available-divisions`));

    public static ROUTE_GET_DIVISIONS_BELONGING_TO_COMPANY = (company: string): Promise<AxiosResponse<Division[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/division?company=${company}`))

    public static ROUTE_GET_ALL_IPBLOCK_PROPERTIES = (): Promise<AxiosResponse<IpBlockWithProperties[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/properties/all`))

    public static ROUTE_GET_IPBLOCK_PROPERTIES_BELONGING_TO_USER = (username: string, company: string): Promise<AxiosResponse<IpBlockWithProperties[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/properties?username=${username}&company=${company}`));

    public static ROUTE_GET_ALL_IPBLOCKS_FOR_CURATION = (): Promise<AxiosResponse<{
        designerName: string,
        publishedIpBlocks: IpBlock[]
    }[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/curation/all`))

    //TODO rename this route
    //TODO change signature, return boolean if okay?
    public static ROUTE_POST_ADD_IPBLOCK_TO_DIVISION = (company: string, division: string, ipBlock: IpBlockDef): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/mongo/division/add?company=${company}&division=${division}&ipblock=${ipBlock.name}&ipblockversion=${ipBlock.version}${ipBlock.startDate ? `&start-date=${ipBlock.startDate}` : ''}${ipBlock.startDate ? `&end-date=${ipBlock.endDate}` : ''}`));

    public static ROUTE_GET_USERS_IPBLOCKS = (username: string, company: string): Promise<AxiosResponse<IpBlockDef[], any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/mongo/ipblock?username=${username}&company=${company}`))


    public static ROUTE_POST_ADD_DIVISION = (company: string, division: string, body?: IpBlockDef[]): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/division/add?company=${company}&division=${division}`), body)

    public static ROUTE_POST_REMOVE_DIVISION = (company: string, division: string): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/division/remove?company=${company}&division=${division}`))

    public static ROUTE_GET_CONTRACT_EXISTS = (company: string): Promise<AxiosResponse<boolean, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/exists?company=${company}`))

    public static ROUTE_POST_ADD_CONTRACT = (company: string): Promise<AxiosResponse<boolean, any>> =>
        axios.post(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/contract/add?company=${company}`))
    public static ROUTE_GET_DOWNLOAD_IPBLOCK = (ipblockName: string, ipblockVersion: string) =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/mongo/ipblock/download?ip-block-name=${ipblockName}&ip-block-version=${ipblockVersion}`),
            {
                responseType: 'blob',
            }
        );

    //TODO change function name to PATCH?
    public static ROUTE_POST_APPROVE_IPBLOCK_FOR_CURATION = (ipblockFullName: string, ipblockName: string, ipblockVersion: string, username: string) =>
        axios.post(encodeURI(
                BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/curation/approve?ipblockFullName=${ipblockFullName}&ipblockName=${ipblockName}&ipblockVersion=${ipblockVersion}&username=${username}`
            )
        )

    public static ROUTE_POST_REJECT_IPBLOCK_FOR_CURATION = (ipblockFullName: string, ipblockName: string, ipblockVersion: string, username: string) =>
        axios.post(encodeURI(
                BackendRoutes.BACKEND_ADDRESS + `/artifactory/ipblock/curation/reject?ipblockFullName=${ipblockFullName}&ipblockName=${ipblockName}&ipblockVersion=${ipblockVersion}&username=${username}`
            )
        )

    public static ROUTE_GET_BACKEND_VERSION = (): Promise<AxiosResponse<string, any>> =>
        axios.get(encodeURI(BackendRoutes.BACKEND_ADDRESS + `/version`));


    public static ROUTE_GET_RECORDS_DESIGNER = (designerName: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.KAFKALISTENER_ADDRESS + `/get-designer-file-records?designerName=${designerName}`));

    public static ROUTE_GET_RECORDS_TIME = (designerName: string, startDate: string, endDate: string): Promise<AxiosResponse<string[], any>> =>
        axios.get(encodeURI(BackendRoutes.KAFKALISTENER_ADDRESS + `/get-designer-file-records-timerange?designerName=${designerName}&fromDate=${startDate}&toDate=${endDate}`))
}
