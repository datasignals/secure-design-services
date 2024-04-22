import React, {Component} from "react";


interface Props {
    parentCallbackSignDocument: () => void,
    parentCallbackRevokeDocument: () => void,
    isSigned: boolean,
    isRevoked: boolean,
}

export default class Sidebar extends Component<Props> {


    render() {

        return (
            <aside className="scrollbar" id="sidebar-wrapper">
                <ul className="sidebar-nav">
                    <li className="pt-1">
                    </li>
                    {this.props.isSigned ?
                        <h2>Signed!</h2>:
                        <div className="btn btn-success">
                            <img src="img/confirm.svg"/>
                            <input type="button" value="Confirm" onClick={this.props.parentCallbackSignDocument}/>
                        </div>
                    }
                    {this.props.isRevoked ?
                        <h2>Revoked!</h2>:
                        <div className="btn btn-warning">
                            <img src="img/close.png"/>
                            <input type="button" value="Revoke" onClick={this.props.parentCallbackRevokeDocument}/>
                        </div>
                    }
                    <li>

                    </li>


                    <li>

                    </li>


                    <li>
                    </li>


                    <li>

                    </li>

                    <li>

                    </li>

                    <li>

                    </li>

                    <li>

                    </li>
                </ul>
            </aside>
        )
    }
}
