import {Component} from "react";
import BackendRoutes from "../BackendRoutes";

interface Props {
    selectedCompany: string,
    parentCallbackSelectedDocument: (s: string) => void
}

interface State {
    documents: string[]
}

export default class ContractsTable extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            documents: []
        }
        this.handleViewDocument = this.handleViewDocument.bind(this);
        this.handleSelectDocument = this.handleSelectDocument.bind(this);
    }

    async componentDidMount() {
        const res = await BackendRoutes.ROUTE_GET_DOCUMENTS(this.props.selectedCompany);

        if(res.status !== 200) {
            //todo alerts
            return;
        }

        const documents: string[] = await res.data;
        this.setState({documents: documents});
    }

    public async handleViewDocument(docName: string) {
        const res = await BackendRoutes.ROUTE_GET_DOCUMENT(this.props.selectedCompany, docName);

        if(res.status !== 200) {
            //TODO error handle
            return;
        }

        const file = new Blob([await res.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(file);
        const pdfWindow = window.open();

        pdfWindow!.location.href = fileURL;
    }

    handleSelectDocument(selectedDocument: string) {
        this.props.parentCallbackSelectedDocument(selectedDocument);
    }


    render() {

        const documents = this.state.documents.map(e => {
            return (
                <tr>
                    <td>{e}</td>
                    <td>Date TODO</td>
                    <td><input className="btn btn-success" type="button" value="OK" onClick={() => this.props.parentCallbackSelectedDocument(e)}/></td>
                    <td><input className="btn btn-success" type="button" value="VIEW" onClick={() => this.handleViewDocument(e)}/></td>
                </tr>
            )
        })

        return (
            <div className="row">
                <div className="col-lg-12">
                    <div className="card produce-consent">
                        <div className="card-body py-0 pl-0 ">
                            <div className="table-responsive">
                                <table className="table table-striped scroll mb-0">

                                    <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Date</th>
                                        <th>Select</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {documents}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
