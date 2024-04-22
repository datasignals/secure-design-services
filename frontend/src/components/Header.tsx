import {Component} from "react";

interface Props {
    displayName: string,
    logoutFun: () => void
}

interface State {

}

export default class Header extends Component<Props, State> {


    constructor(props: Props) {
        super(props);
    }


    // async testFun() {
    //     const a = await fetch(BackendRoutes.ROUTE_GET_COMPANIES_ASSOCIATED_WITH_CLIENT("tom"));
    //     alert(await a.text());
    // }
    //

    public switchTheme(theme: string) {
        if (theme === 'main') {
            document.documentElement.className = 'main';
            localStorage.setItem("theme", "main");
        } else if (theme === 'red') {
            document.documentElement.className = 'red';
            localStorage.setItem("theme", "red");
        } else if (theme === 'green') {
            document.documentElement.className = 'green';
            localStorage.setItem("theme", "green");
        }
    }

    render() {
        return (
            <div id="navbar-wrapper">
                <nav className="navbar navbar-expand-lg navbar-light">

                    <a className="mr-md-4"><img width="45" src="img/logo.svg"
                                                alt="logo"/></a>
                    <p className="text-white d-none d-md-block mb-0">CONTRACT MANAGEMENT</p>
                    <ul className="navbar-nav ml-auto d-flex align-items-center">
                        <li className="nav-item dropdown">
                            <a className="nav-link user-name" role="button" data-toggle="dropdown"
                               aria-expanded="false">
                                {this.props.displayName}
                                <div className="d-flex align-items-center ml-3 justify-content-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                         viewBox="0 0 36.731 38">
                                        <path id="account"
                                              d="M0,38V31.5s6.849-8.11,18.1-7.87A28.937,28.937,0,0,1,36.731,31.5V38ZM8.809,9.5a9.5,9.5,0,1,1,9.5,9.5A9.5,9.5,0,0,1,8.809,9.5Z"
                                              fill="#fff"/>
                                    </svg>
                                </div>
                            </a>
                            <div className="dropdown-menu">
                                <a className="dropdown-item">Profile</a>
                                <a className="dropdown-item">Setting</a>
                                <a className="dropdown-item" onClick={this.props.logoutFun}>Logout</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link user-name" role="button" data-toggle="dropdown"
                               aria-expanded="false">
                                <div className="d-flex align-items-center ml-2 justify-content-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                         viewBox="0 0 38.108 35.986">
                                        <path id="theme"
                                              d="M36.872,24.344s-4.234,4.594-4.234,7.409a4.234,4.234,0,0,0,8.467,0c0-2.815-4.234-7.409-4.234-7.409M7.681,21.168l10.14-10.14,10.14,10.14m3.747-2.244L12.783,0,9.8,2.985l5.038,5.038-10.9,10.9a3.156,3.156,0,0,0,0,4.488L15.577,35.055a3.169,3.169,0,0,0,4.488,0L31.707,23.412A3.156,3.156,0,0,0,31.707,18.924Z"
                                              transform="translate(-2.998)" fill="#fff"/>
                                    </svg>
                                </div>
                            </a>
                            <div className="dropdown-menu theme-colors">
                                <a onClick={() => this.switchTheme('main')} className="colors dropdown-item">
                                    <div className="d-flex align-items-center ">
                                        <div className="th-main"></div>
                                        <div className="ml-2">Main</div>
                                    </div>
                                </a>
                                <a onClick={() => this.switchTheme('red')} className="colors dropdown-item">
                                    <div className="d-flex align-items-center ">
                                        <div className="th-red"></div>
                                        <div className="ml-2">Red</div>
                                    </div>
                                </a>
                                <a onClick={() => this.switchTheme('green')} className="dropdown-item">
                                    <div className="d-flex align-items-center ">
                                        <div className="th-green"></div>
                                        <div className="ml-2">Green</div>
                                    </div>
                                </a>
                            </div>
                        </li>
                        <li><a className="text-white d-lg-none ml-3 toggled" id="sidebar-toggle" onClick={() => {
                            const wrapper = document.getElementById("wrapper");
                            if(wrapper?.getAttribute("class") !== "toggled") {
                                wrapper!.setAttribute("class", "toggled");
                            } else {
                                wrapper!.setAttribute("class", "");
                            }
                        }}><i
                            className="fa fa-bars"></i></a></li>
                    </ul>
                </nav>
            </div>
        )
    }

}
