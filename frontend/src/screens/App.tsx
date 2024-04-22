import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "../components/Header";
import Sidebar, {Pages} from "../components/Sidebar";
import SelectClientScreen from "./SelectClientScreen";
import MaintainPeopleScreen from "./MaintainPeopleScreen";
import Footer from "../components/Footer";
import Keycloak from 'keycloak-js';
import ReadPdf from "./ReadPdf";
import AdminScreen from "./AdminScreen";
import BackendRoutes from "../BackendRoutes";
import LoggedUser from "../common/LoggedUser";
import MaintainDivisionsScreen from "./MaintainDivisionsScreen";
import CreateReportMSAScreen from "./CreateReportMSAScreen";
import CurationScreen from "./CurationScreen";
import config from "../config.json"
import MaintainApprovalsScreen from "./MaintainApprovalsScreen";


interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null;
}

interface State {
    selectedCompanyName: string,
    documentSigned: boolean,
    pageIsDirty: boolean,
    keycloak: Keycloak,
    userAuthenticated: boolean,
    licenseOk?: boolean,
    loggedUser: LoggedUser,
    activePage: Pages
}

export default class App extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedCompanyName: "N/A",
            documentSigned: false,
            pageIsDirty: false,
            keycloak: new Keycloak("/keycloak.json"),
            userAuthenticated: false,
            licenseOk: undefined,
            loggedUser: {
                username: "",
                displayName: "",
                groupManager: "",
            },
            activePage: "/"
        }

        this.callbackChooseCompany = this.callbackChooseCompany.bind(this);
        this.callbackPageIsDirty = this.callbackPageIsDirty.bind(this);
        this.updateActivePageIcon = this.updateActivePageIcon.bind(this);
    }

    async componentDidMount() {
        const authenticated = await this.state.keycloak.init({
            onLoad: 'login-required',
        });
        this.setState({userAuthenticated: authenticated});

        //@ts-ignore
        const e: { preferred_username: string, name: string } = await this.state.keycloak.loadUserInfo();

        const p = await BackendRoutes.ROUTE_GET_GROUP_USER_BELONGS(e.preferred_username);

        const licenseOk = await BackendRoutes.ROUTE_GET_LICENSE_OK(config.licenseKey)
            .then(e => e.data)
            .catch(() => false)

        const selectedCompanyName: string | null = localStorage.getItem('selectedCompanyName');


        if (p.status === 200) {
            const groupName = await p.data;
            //TODO for some reason string has quotes
            const groupNameNoQuotes = groupName.replace(/"/g, '');
            this.setState({
                loggedUser: {
                    username: e.preferred_username,
                    displayName: e.name,
                    groupManager: groupNameNoQuotes
                },
                licenseOk: licenseOk,
                selectedCompanyName: selectedCompanyName || "N/A"
            });
        }
    }


    callbackChooseCompany(selectedCompanyName: string) {
        this.setState({selectedCompanyName: selectedCompanyName});
        localStorage.setItem('selectedCompanyName', selectedCompanyName);
    }

    callbackDocumentSigned(documentSigned: boolean) {
        this.setState({documentSigned: documentSigned});
    }

    callbackPageIsDirty(pageIsDirty: boolean) {
        this.setState({pageIsDirty: pageIsDirty});
    }


    changeCSS() {
        //TODO improve, wrong company name too
        //TODO for now it does nothing
        if (this.state.loggedUser.groupManager === "Sabien") {
            const cssLink = document.getElementById("global-css") as HTMLLinkElement;
            cssLink.href = "/css/global_codasip.css";
        } else {
            const cssLink = document.getElementById("global-css") as HTMLLinkElement;
            cssLink.href = "/css/global_codasip.css";
            // cssLink.href = "/css/lockular-global.css";
        }
    }

    updateActivePageIcon(page: Pages) {
        this.setState({activePage: page})
    }

    render() {
        if (this.state.userAuthenticated && this.state.licenseOk) {


            this.changeCSS();

            return (

                <BrowserRouter basename={process.env.PUBLIC_URL}>

                    <Header displayName={this.state.loggedUser.displayName} logoutFun={this.state.keycloak.logout}/>

                    {
                        window.location.pathname.match("/read-pdf") !== null ?
                            <></> :
                            <Sidebar pageIsDirty={this.state.pageIsDirty}
                                     parentCallbackPageIsDirty={this.callbackPageIsDirty}
                                     selectedCompany={this.state.selectedCompanyName}
                                     activePage={{
                                         activePageRoute: this.state.activePage,
                                         callbackChangeActivePage: this.updateActivePageIcon
                                     }}
                            />
                    }


                    <Routes>

                        <Route path="/"
                               element={<SelectClientScreen loggedUser={this.state.loggedUser}
                                                            parentCallbackSelectedCompany={this.callbackChooseCompany}
                                                            parentCallbackSelectActivePage={this.updateActivePageIcon}/>
                               }>
                        </Route>
                        <Route path="/maintain-people"
                               element={
                                   <MaintainPeopleScreen loggedUser={this.state.loggedUser}
                                                         parentCallbackPageIsDirty={this.callbackPageIsDirty}
                                                         selectedCompany={this.state.selectedCompanyName}
                                   />
                               }>
                        </Route>

                        <Route path="/divisions"
                               element={<MaintainDivisionsScreen selectedCompany={this.state.selectedCompanyName}/>}>
                        </Route>

                        <Route path="/provenance-report"
                               element={<CreateReportMSAScreen/>}>
                        </Route>

                        <Route path="/curation"
                               element={<CurationScreen/>}>
                        </Route>

                        {/*<Route path="/approvals"*/}
                        {/*       element={<MaintainApprovalsScreen/>}>*/}
                        {/*</Route>*/}

                        {/*<Route path="/test"*/}
                        {/*       element={<TableWIP table={{head: ["test1", "test2", "test3"]}}/>}>*/}
                        {/*</Route>*/}

                        {/*<Route path="/maintain-documents" element={<MaintainDocumentsScreen/>}></Route>*/}
                        {/*<Route path="/consent-batch"*/}
                        {/*       element={<ConsentBatchScreen parentCallbackPageIsDirty={this.callbackPageIsDirty}*/}
                        {/*                                    selectedCompany={this.state.selectedCompanyName}/>}></Route>*/}
                        {/*<Route path="/track-and-manage"*/}
                        {/*       element={<TrackAndManageScreen*/}
                        {/*           selectedCompany={this.state.selectedCompanyName}/>}></Route>*/}
                        {/*<Route path="/create-report" element={<CreateReportScreen/>}></Route>*/}

                        {/*<Route path="/new-document" element={<PrepareNewDocumentScreen*/}
                        {/*    selectedCompany={this.state.selectedCompanyName}/>}></Route>*/}
                        {/*<Route path="/existing-document" element={<PrepareExistingDocumentScreen*/}
                        {/*    selectedCompany={this.state.selectedCompanyName}/>}></Route>*/}

                        {/*<Route path="/modify-document" element={<ModifyDocumentScreen/>}>*/}
                        {/*    <Route path=":selectedCompany/:docName" element={<ModifyDocumentScreen/>}></Route>*/}
                        {/*</Route>*/}

                        <Route path="/read-pdf" element={<ReadPdf/>}>
                            <Route path=":uniqueIdentifier/:batchID/:docName" element={<ReadPdf/>}></Route>
                        </Route>

                        <Route path="/client"
                               element={<AdminScreen callbackSelectCompany={this.callbackChooseCompany}/>}></Route>

                        <Route path="*"
                               element={<SelectClientScreen loggedUser={this.state.loggedUser}
                                                            parentCallbackSelectedCompany={this.callbackChooseCompany}
                                                            parentCallbackSelectActivePage={this.updateActivePageIcon}
                               />}></Route>
                    </Routes>

                    <Footer/>
                </BrowserRouter>
            );
        }
        else if(this.state.userAuthenticated && this.state.licenseOk === false) {
            return (
                <div style={{width: "100vw", height: "100vh"}}
                     className="fixed top-0 left-0 p-0 m-0 d-flex flex-column justify-content-center">
                    <div style={{width: "100vh", textAlign: "center"}}>
                        <h1>Your License is no Longer Valid</h1>
                        <p>Please Renew</p>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div style={{width: "100vw", height: "100vh"}}
                     className="fixed top-0 left-0 p-0 m-0 d-flex flex-column justify-content-center">
                    <div style={{width: "100vh", textAlign: "center"}}>
                        <img style={{width: "75px", height: "75px", margin: "20px"}} src="img/loading.gif"/>
                        <h1>Loading Components</h1>
                    </div>
                </div>
            )
        }

    }

}
