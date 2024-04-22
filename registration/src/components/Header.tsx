import {Component} from "react";
import Toasts from "./Toasts";

interface Props {
    displayName: string,
    // logoutFun: () => void
}

interface State {
   opened:  boolean
}

export default class Header extends Component<Props, State> {

    public showSidmenu = false;

    constructor(props: Props) {
        super(props);
        this.state = {
			opened: false,
		};
    }

    public openSidemenu(){
        this.setState({ opened: !this.state.opened })
    }

    render() {
        return (
            <div id="navbar-wrapper" className="fixed-top">
                <nav className="container-fluid">
                    <div className="d-flex align-items-center justify-content-between h-70p w-100">
                       <img className="w-150p h-50p" src="img/logo.svg" />
                       <div className="toggler" onClick={() => this.openSidemenu()}>
                            <img src="img/hamburgermenu.svg" alt="hamburgermenu"/>
                       </div>
                       <ul className="d-flex list-style-none links-des">
                                <li className="text-14"><a href="#" className="text-white">FAQ</a></li>
                                <li className="ml-40 text-14"><a href="#" className="text-white">Terms</a></li>
                                <li className="ml-40 text-14"><a href="#" className="text-white">About</a></li>
                        </ul>
                       {this.state.opened &&
                        <div className="position-relative">
                            <ul className=" d-flex list-style-none links" id="links">
                                <li><a href="#" className="text-white">FAQ</a></li>
                                <li className="ml-40 text-14"><a href="#" className="text-white">Terms</a></li>
                                <li className="ml-40 text-14"><a href="#" className="text-white">About</a></li>
                                <img onClick={() => this.openSidemenu()} className="close-icon" src="img/close.svg" alt="close-icon"/>
                            </ul>
                        </div>
                        }
                    </div>
                </nav>
            </div>
        )
    }

}
