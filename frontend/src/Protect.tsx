import {Component, ReactNode} from "react";
import Keycloak from 'keycloak-js';

interface Props {
    children?: ReactNode,
    parentCallback: (s: string) => void
}

interface State {
    keycloak: Keycloak,
    loggedIn: boolean,
    username: string
}

export default class Protect extends Component<Props, State> {

    // static kc2: Keycloak = Keycloak("/keycloak.json");
    //
    // static kc2Init() {
    //     Protect.kc2.init({
    //         onLoad: 'login-required',
    //     }).then((authenticated) => {
    //         if (Protect.kc2.authenticated) {
    //
    //             Protect.kc2.loadUserInfo().then(e => {
    //                 // @ts-ignore
    //                 this.setState({username: e.name});
    //                 // @ts-ignore
    //                 this.props.parentCallback(e.name);
    //             });
    //         }
    //     });
    // }

    logout() {
        this.state.keycloak.logout();
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            keycloak: Keycloak("/keycloak.json"),
            loggedIn: false,
            username: "",
        }

        this.state.keycloak.init({
            onLoad: 'login-required',
        }).then((authenticated) => {
            if (this.state.keycloak.authenticated) {

                this.state.keycloak.loadUserInfo().then(e => {
                    // @ts-ignore
                    this.setState({username: e.name});
                    // @ts-ignore
                    this.props.parentCallback(e.name);
                });

                this.setState({loggedIn: true});
            }
        });
    }

    async componentDidMount() {

    }

    render() {

        return (
            this.state.keycloak.authenticated ?
                <div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <div className="text-right">
                        <a className="btn btn-outline-secondary" onClick={() => this.state.keycloak.logout()}>test</a>
                    </div>
                    {this.props.children}
                </div>:
                <h1>You are not logged in</h1>
        );
    }

}
