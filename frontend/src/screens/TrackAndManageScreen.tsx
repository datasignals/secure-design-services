import React, {Component} from "react";
import User from "../common/User";
import BackendRoutes from "../BackendRoutes";
import ConsentBatch from "../common/ConsentBatch"
import ToastContainer from "react-bootstrap/esm/ToastContainer";
import Toast from "react-bootstrap/Toast";
import Toasts from "../components/Toasts";

interface Props {
    selectedCompany: string
}

interface State {
    tableContents: User[],
    consentBatches: string[],
    selectedBatch: string,
    toasts: Toasts
}

export default class TrackAndManageScreen extends Component<Props, State> {

    private readonly bodyStyle = {
        height: "calc(100vh - 280px)"
    }


    constructor(props: Props) {
        super(props);

        this.state = {
            tableContents: [],
            consentBatches: [],
            selectedBatch: "",
            toasts: new Toasts(this)
        }
    }

    //TODO improve attribute
    public handleSelectBatch(e: any) {
        this.setState({selectedBatch: e.target.value})
        this.update(e.target.value);
    };

    async componentDidMount() {
        await this.update();
        setInterval(async () => {
            await this.update(this.state.selectedBatch)
        }, 5000);
    }

    async update(selected?: string) {

        const usersMapped: User[] =
            await BackendRoutes.ROUTE_LIST_USERS(this.props.selectedCompany)
                .then(e => e.data)

        const batches: string[] =
            await (BackendRoutes.ROUTE_LIST_BATCHES(this.props.selectedCompany))
                .then(e => e.data)

        const firstBatch = selected ? selected : batches[0];


        const consentBatch: ConsentBatch =
            await BackendRoutes.ROUTE_GET_BATCH(this.props.selectedCompany, firstBatch)
                .then(e => e.data);

        const usersInBatch = usersMapped.filter(e => consentBatch.users.find((a: {name: string, sent: boolean, signed: boolean}) => a.name === e.username));


        const usersSigned: User[] = [];
        for (const user of usersInBatch) {
            const signed = await BackendRoutes.ROUTE_DOCUMENT_SIGNED(user.username.toString(), user.email.toString(), firstBatch);
            const userSignedStatus: { signed: boolean, sent: boolean, revoked: boolean } = signed.data;

            usersSigned.push({
                username: user.username!,
                role: user.role,
                region: user.region,
                company: user.company,
                email: user.email,
                sent: userSignedStatus.sent,
                signed: userSignedStatus.signed,
                revoked: userSignedStatus.revoked
            });
        }

        this.setState({tableContents: usersSigned, consentBatches: batches, selectedBatch: firstBatch})
    }

    // async handleRevoke(username: string, company: string, batchID: string) {
    //     const res = await fetch(BackendRoutes.ROUTE_REVOKE_USER_CONSENT(username, company, batchID));
    //     if (res.ok) {
    //         this.state.toasts.createToast("Success", `User ${username} revoked`);
    //     } else {
    //         this.state.toasts.createToast("Failure", `Failed to revoke User's ${username} consent`);
    //     }
    // }

    async handleResend(username: string, email: string, batchID: string) {
        const signedAlready: { name: string, sent: boolean, signed: boolean } =
            await BackendRoutes.ROUTE_DOCUMENT_SIGNED(username, email, batchID).then(e => e.data);

        if (signedAlready.signed) {
            this.state.toasts.createToast("INFO", "No need to resend, signed already")
        } else {
            //TODO fix resend

            // const sendSucessful = await fetch(BackendRoutes.ROUTE_SEND_EMAIL(username, email, batchID))
            //     .then(e => e.ok);
            // if (sendSucessful) {
            //     this.createToast("Success", `Email resend to user: ${username}\n${email}`)
            // } else {
            //     this.createToast("Failure", `Failed to resend an email to: ${username}`);
            // }
            this.state.toasts.createToast("INFO", "Disabled temporally");
        }
    }


    render() {
        const check = (
            <img className="float-right" width="18" src="img/check.png" alt="check"/>
        )

        const close = (
            <img className="float-right" width="18" src="img/close.png" alt="close"/>
        )

        const list = this.state.tableContents.map(e => {
            return (
                <tr>
                    <td>{e.username}</td>
                    <td>{e.role}</td>
                    <td>{e.region}</td>
                    <td>Sent
                        <a href="#">
                            {e.sent ? check : close}
                        </a>
                    </td>
                    <td>Signed
                        <a href="#">
                            {e.signed ? check : close}
                        </a>
                    </td>
                    <td>Revoked
                        <a href="#">
                            {e.revoked ? check : close}
                        </a>
                    </td>
                    <td>Resend
                        <a onClick={() => this.handleResend(e.username, e.email, this.state.selectedBatch)}>
                            <img className="float-right" width="18" src="img/refresh.png" alt="refresh"/>
                        </a>
                    </td>
                    {/*<td>Revoke*/}
                    {/*    <a onClick={() => this.handleRevoke(e.username, e.company, this.state.selectedBatch)}>*/}
                    {/*        <img className="float-right" width="14" src="img/delete.svg" alt="delete"/>*/}
                    {/*    </a>*/}
                    {/*</td>*/}
                </tr>
            )
        });


        const availableBatches = this.state.consentBatches.map(e => {
            return (
                <option value={e}>{e}</option>
            )
        });

        return (
            <section id="content-wrapper" className="dashboard-section">
                <div className="row">
                    <div className="col-md-12">
                        <h3>Track Consent Requests</h3>
                        <form>
                            <label htmlFor="batch">Choose a Batch:</label>
                            <select name="batch" id="batch" onChange={(e) => this.handleSelectBatch(e)}>
                                {availableBatches}
                            </select>
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card activity-block track-manage">
                            <div className="card-body py-0 pl-0 ">
                                <div className="table-responsive">
                                    <table className="table table-striped scroll mb-0">

                                        {this.state.toasts.container()}
                                        {/*<ToastContainer position="top-end" style={{*/}
                                        {/*    right: "0",*/}
                                        {/*    //@ts-ignore*/}
                                        {/*    "z-index": "1"*/}
                                        {/*}}>*/}
                                        {/*    {this.state.toasts.render()}*/}
                                        {/*</ToastContainer>*/}
                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Region</th>
                                            <th>Status</th>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                        <tbody style={this.bodyStyle}>

                                        {list}

                                        {/*TODO this is filler*/}
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={7} className="py-4">
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

}
