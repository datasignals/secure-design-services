import React, {Component} from "react";
import { Toast } from "react-bootstrap";
import ToastContainer from "react-bootstrap/esm/ToastContainer";
import BackendRoutes from "../../BackendRoutes";
import Toasts from "../../components/Toasts";

interface PrepareNewDocumentScreenProps {
    selectedCompany: string
}

interface PrepareNewDocumentScreenState {
    file: File | undefined,
    companyFiles: string[],
    toasts: Toasts
}

export default class PrepareNewDocumentScreen extends Component<PrepareNewDocumentScreenProps, PrepareNewDocumentScreenState> {

    constructor(props: any) {
        super(props);
        this.state = {
            file: undefined,
            companyFiles: [],
            toasts: new Toasts(this)
        }
    }

    // async componentDidMount() {
    //     const res = await fetch(BackendRoutes.ROUTE_GET_DOCUMENTS(this.props.selectedCompany))
    //     if(res.ok) {
    //         const docs: string[] = JSON.parse(await res.text())
    //     }
    // }

    private handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files && event.target.files[0];
        if(selectedFile) {
            this.setState({file: selectedFile})
        }
    };

    private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (this.state.file) {
            const formData = new FormData();
            //TODO check the second parameter
            formData.set('file', this.state.file, this.state.file.name);
            BackendRoutes.ROUTE_UPLOAD_DOC(this.props.selectedCompany, this.state.file.name, formData)
                .then(response => {
                    if(response.data){
                        this.state.toasts.createToast("Success", "Uploaded a doc: " + this.state.file!.name);
                    } else {
                        this.state.toasts.createToast("Failure", "Failed to upload a doc: " + this.state.file!.name);
                    }
                })
                .catch(error => {
                    this.state.toasts.createToast("Failure", "Failed to upload a doc: " + this.state.file!.name);
                });
        }
    };

    render() {
        const list = this.state.companyFiles.map(e => {
            return (
                <p>{e}</p>
            )
        });
        return (
            <section id="content-wrapper" className="dashboard-section">

                {this.state.toasts.container()}

                {/*<ToastContainer position="top-end" style={{*/}
                {/*    right: "0",*/}
                {/*    zIndex: "1"*/}
                {/*}}>*/}
                {/*    {this.state.toasts.render()}*/}
                {/*</ToastContainer>*/}

                <form onSubmit={this.handleSubmit}>
                    <input type="file" onChange={this.handleFileChange}/>
                    <button type="submit">Upload</button>
                </form>
                {list}
            </section>
        )
    }

}
