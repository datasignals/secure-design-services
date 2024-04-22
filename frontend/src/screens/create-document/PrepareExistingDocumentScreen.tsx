import React, {Component} from "react";
import BackendRoutes from "../../BackendRoutes";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/esm/ToastContainer";
import {Link} from "react-router-dom";
import Toasts from "../../components/Toasts";

interface Props {
    selectedCompany: string
}

interface State {
    companyDocuments: {
        name: string,
        dateCreated: string
    }[],
    toasts: Toasts
}

export default class PrepareExistingDocumentScreen extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            companyDocuments: [],
            toasts: new Toasts(this)
        }
    }

    async componentDidMount() {
        const res = await BackendRoutes.ROUTE_GET_DOCUMENTS(this.props.selectedCompany);
        if (res.status === 200) {
            const docs: string[] = await res.data;
            this.setState({companyDocuments: docs.map(e => ({name: e, dateCreated: "date"}))})
        }

    }

    render() {

        const filler = (
            <>
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
            </>
        )

        const tableContent = this.state.companyDocuments.map(e => {
            const a = `/modify-document/${this.props.selectedCompany}/${e.name}`;
                return (
                    <tr>
                        <td>{e.name}</td>
                        <td>{e.dateCreated}</td>
                        <td><Link className="btn btn-success" to={a} >Select Document</Link></td>
                    </tr>
                )
            }
        )

        return (
            <section id="content-wrapper" className="dashboard-section recent-client">

                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body py-0 pl-0">
                                <div className="table-responsive">
                                    <table className="table table-striped scroll mb-0">
                                        {/*<ToastContainer position="top-end" style={{*/}
                                        {/*    right: "0",*/}
                                        {/*    zIndex: "1"*/}
                                        {/*}}>*/}
                                        {/*    {this.state.toasts.render()}*/}
                                        {/*</ToastContainer>*/}

                                        {this.state.toasts.container()}
                                        <thead>
                                        <tr>
                                            <th>Document Name</th>
                                            <th>Date Created</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {tableContent}
                                        {filler}
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
