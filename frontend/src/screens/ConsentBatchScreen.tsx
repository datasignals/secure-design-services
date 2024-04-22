import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import User from "../common/User";
import BackendRoutes from "../BackendRoutes";
import ContractsTable from "../components/ContractsTable";
import Toasts from "../components/Toasts";


interface ConsentBatchProps {
    selectedCompany: string,
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
    parentCallbackPageIsDirty: (b: boolean) => void,
}

interface ConsentBatchState {
    showContracts: boolean,
    selectedDocument: string | undefined,
    users: User[];
    consentBatches: string[],
    selectAllUsers: boolean,
    // notification: boolean,
    toasts: Toasts

}

export default class ConsentBatchScreen extends Component<ConsentBatchProps, ConsentBatchState> {

    constructor(props: ConsentBatchProps) {
        super(props);

        this.state = {
            showContracts: false,
            selectedDocument: undefined,
            users: [],
            consentBatches: [],
            selectAllUsers: false,
            // notification: false,
            toasts: new Toasts(this)
        };

        this.handleSendAll = this.handleSendAll.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.handleCheckmark = this.handleCheckmark.bind(this);
        // this.createToast = this.createToast.bind(this);
        this.callbackSelectedDocument = this.callbackSelectedDocument.bind(this);
    }

    async componentDidMount() {
        if (this.props.selectedCompany !== "N/A") {

            //Fetch users and add "selected" property used for
            // checkmarks
            const usersMapped: User[] =
                await BackendRoutes.ROUTE_LIST_USERS(this.props.selectedCompany)
                    .then(e => e.data)
                    .then(a => a.map((user: User) => ({
                        ...user,
                        selected: false
                    })));

            const consentBatches: string[] =
                await BackendRoutes.ROUTE_LIST_BATCHES(this.props.selectedCompany).then(e => e.data)

            this.setState({
                users: usersMapped,
                consentBatches: consentBatches,
            })
        } else {
            this.state.toasts.createToast("Warning", "You need to select a Client first!");
        }
    }

    async handleSendAll() {
        if (this.state.selectedDocument === undefined) {
            this.state.toasts.createToast("ERROR", "You have to select company first");
            return;
        }

        //If new batch, create a new ID that is one higher from the highest number available
        // otherwise, use the existing ID
        const batchID = this.state.consentBatches.length > 0 ?
            (Math.max(...this.state.consentBatches.filter(str => !isNaN(Number(str))).map(str => Number(str))) + 1).toString() :
            "1";


        const createBatchResult = await BackendRoutes.ROUTE_CREATE_BATCH(this.props.selectedCompany, batchID, this.state.selectedDocument, this.state.users.filter(z => z.selected! === true).map(e => e.username))

        if (createBatchResult.status !== 200) {
            this.state.toasts.createToast("Failure!", "failed to create a consent batch");
        } else if (this.state.selectedDocument === undefined) {
            this.state.toasts.createToast("Failure!", "Select a document!");
        } else {
            this.state.toasts.createToast("Success", `Created new Batch\nCompany: ${this.props.selectedCompany}\nBatch ID: ${batchID}\nEmails Sent to: ${this.state.users.filter(z => z.selected! === true).map(e => "\n\t" + e.username)}`);


            const failedToSendUsers: User[] = [];

            // //TODO this is a proper implementation, for production
            const selectedUsers = this.state.users.filter(e => e.selected === true);

            for (const user of selectedUsers) {
                //This version sends emails to my ACC
                const sendEmailResult = await BackendRoutes.ROUTE_SEND_EMAIL(user.username, user.email, batchID, this.state.selectedDocument!);
                //This version if for production once we actually send emails
                // const sendEmailResult = await fetch(BackendRoutes.ROUTE_SEND_EMAIL(user.username, user.email, batchID, this.state.selectedDocument!))
                if (sendEmailResult.status !== 200) {
                    failedToSendUsers.push(user);
                }
            }

            //TODO this is temporary to just send one email instead of 20
            // const user = this.state.users[0];
            // const sendEmailResult = await fetch(BackendRoutes.ROUTE_SEND_EMAIL(user.username, user.email, batchID, this.state.selectedDocument!))
            // if (!sendEmailResult.ok) {
            //     failedToSendUsers.push(user);
            // }

            if (failedToSendUsers.length > 0) {
                this.state.toasts.createToast("INFO", "Some emails have failed to be sent: " + failedToSendUsers.map(e => `\n\t${e.username}`))
            }


            // this.setState({notification: true});
            this.props.parentCallbackPageIsDirty(false);
        }


    }

    handleSelectAll() {
        this.props.parentCallbackPageIsDirty(true);

        const selectAll = !this.state.selectAllUsers;
        const users = this.state.users.map(e => ({...e, selected: selectAll}))
        this.setState({selectAllUsers: selectAll, users: users})
    }

    handleCheckmark(username: string) {
        this.props.parentCallbackPageIsDirty(true);

        const user = this.state.users.find(e => e.username === username);
        if (user) {
            user.selected = !user.selected;
            this.setState({users: this.state.users});
        }
    }

    callbackSelectedDocument(selectedDocument: string) {
        this.setState({selectedDocument: selectedDocument, showContracts: false});
    }


    render() {
        const list = this.state.users.map(e => {
            return (
                <tr>
                    <td>{e.username}</td>
                    <td>{e.role}</td>
                    <td>{e.region}</td>
                    {/*<td className="text-center">*/}
                    {/*    <img width="70" src="img/sign.png" alt="Sign"/>*/}
                    {/*</td>*/}
                    <td>
                        <div className="form-group custom-checkbox mr-2">
                            <input type="checkbox" id={e.username} onChange={() => this.handleCheckmark(e.username)}
                                   checked={
                                       this.state.selectAllUsers ||
                                       this.state.users.find(a => e.username === a.username)!.selected
                                   }
                            />
                            <label htmlFor={e.username}></label>
                        </div>
                    </td>
                </tr>
            )
        });

        const testStyle = {
            top: "10",
            right: "0",
            "z-index": "1"
        }


        return (
            <>
                <section id="content-wrapper" className="dashboard-section">

                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h3 className="mb-0">Produce New Consent Batch</h3>
                            <div className="text-right">
                            </div>
                        </div>


                        <div className="col-md-6">
                            <div className="row justify-content-end align-items-end mb-3">
                                {/*TODO change later, for debug only*/}
                                <div className="col-md-4 text-center btn btn-success"
                                     onClick={() => this.setState({showContracts: !this.state.showContracts})}>
                                    <span className="d-md-block mb-2">Attach Contract</span>
                                    {
                                        this.state.selectedDocument ?
                                            <p>{this.state.selectedDocument}</p> :
                                            <img width="70" src="img/sign.png" alt="Sign"/>
                                    }

                                </div>
                                <div className="col-md-3 text-center">
                                    <span className="d-md-block mb-2">Select All</span>
                                    <div className="form-group custom-checkbox mr-2"
                                         onClick={() => this.handleSelectAll()}>
                                        <input type="checkbox"
                                               checked={this.state.selectAllUsers}/>
                                        <label htmlFor="Select-all"></label>
                                    </div>
                                </div>
                                <div className="col-md-3 text-right">
                                    <a className="btn btn-outline-secondary px-3" onClick={this.handleSendAll}>Send</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {this.state.showContracts ?
                        <ContractsTable parentCallbackSelectedDocument={this.callbackSelectedDocument}
                                        selectedCompany={this.props.selectedCompany}/> : ""}

                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card produce-consent">
                                <div className="card-body py-0 pl-0 ">
                                    <div className="table-responsive">
                                        <table className="table table-striped scroll mb-0">

                                            {this.state.toasts.container()}

                                            <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Role</th>
                                                <th>Division</th>
                                                //TODO in code this is still refered as role
                                                <th className="text-center">Attach Contract</th>
                                                <th>Send Consent Request</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {list}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    }

}
