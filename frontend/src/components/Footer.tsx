import {Component, CSSProperties} from "react";
import BackendRoutes from "../BackendRoutes";
import version from "../version.json";

interface State {
    frontendVersion: string,
    backendVersion: string
}

interface Props {
}

export default class Footer extends Component<Props, State> {

    private footerStyle: CSSProperties = {
        position: "fixed",
        bottom: "0",
        width: "100%",
        height: "50px",
        backgroundColor: "#f5f5f5",
        fontSize: "14px"
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            frontendVersion: version.version || "Not Found",
            backendVersion: ""
        };
    }

    async componentDidMount() {
        try {
            const backendVersion = await BackendRoutes.ROUTE_GET_BACKEND_VERSION();

            this.setState({
                backendVersion: backendVersion.data || "Not Found"
            });
        } catch (e: any)  {
            this.setState({
                backendVersion: "Not Found"
            });
        }
    }


    render() {
        return (
            <footer className="bg-dark" style={this.footerStyle}>
                <div className="row d-flex justify-content-start p-1 m-1 text-justify">
                    <p className="pt-1">Data Provenance by </p>
                    <img className="p-1" height={35} src="img/logo.png" alt="footer-logo"/>
                    <p>Frontend Version: 0.0.76</p>
                    <p>Backend Version: 0.0.72</p>
                    {/* <p>Frontend Version: {this.state.frontendVersion}</p>
                    <p>Backend Version: {this.state.backendVersion}</p> */}
                </div>
            </footer>
        );
    }
}
