import {Component, CSSProperties} from "react";

export default class Footer extends Component {

    private footerStyle: CSSProperties = {
        position: "fixed",
        bottom: "0",
        width: "100%",
        height: "50px",
        backgroundColor: "transparent",
        fontSize: "14px"
    }

    render() {
        return (
            <footer className="z-99" style={this.footerStyle}>
                <div className="container-fluid">
                    <div className="row d-flex justify-content-between p-1 m-1 text-justify">
                        <div className="d-flex align-items-center">
                            <img className="mr-4" src="img/ic_instagram.svg" alt="instagram" />
                            <img className="mr-4" src="img/ic_linkedin.svg" alt="linkedin" />
                            <img className="mr-4" src="img/ic_x.svg" alt="x" />
                        </div>
                        <div className="d-flex items-center">
                            <img className="p-1 mr-2" height={35} src="img/lockular_logo_white.svg" alt="footer-logo"/>
                            <p className="footer-copyright pt-1 text-white">© Lockular Limited 2023. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}
