import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import Toasts from "./Toasts";

interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
    table: {
        head: string[]
    }

}

interface State {
    data: {
        existingData: string[],
        newData: string[] //todo change to object or generic
    }
}

export default class TableWIP extends Component<Props, State> {

    private readonly toast: Toasts = new Toasts(this);

    //TODO improve to be more dynamic
    // this is hardcoded and doesn't work well on all screens
    private readonly tableHeadStyle = {
        width: "255.483px"
    }

    private readonly tableHead = (
        <>
            {
                this.props.table.head.map(e =>
                    <th style={this.tableHeadStyle}>
                        {e}
                    </th>
                )
            }
        </>
    )

    private readonly tableFiller = Array(30).fill(
        <tr>
            <td colSpan={5} className="py-4">
            </td>
        </tr>
    )

    constructor(props: Props) {
        super(props);
    }


    render() {
        return (
            <section id="content-wrapper" className="dashboard-section">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card activity-block">
                            <div className="card-body py-0 pl-0 ">
                                <div className="table-responsive">

                                    <table className="table table-striped scroll mb-0">

                                        {this.toast.toasts}


                                        <thead>
                                        <tr>
                                            {this.tableHead}
                                        </tr>
                                        </thead>
                                        <tbody>

                                        {/*{this.TABLE_ELEMENTS.existingUsersElements(existingUsers)}*/}
                                        {/*{this.TABLE_ELEMENTS.newUserElements(newUsers)}*/}

                                        <tr>
                                            <td colSpan={5}>
                                                <a className="text-success">
                                                    <img width="24"
                                                         className="mr-2"
                                                         src="img/user.png"
                                                         alt="user"/>Add something...
                                                </a>
                                            </td>
                                        </tr>

                                        {this.tableFiller}
                                        </tbody>
                                    </table>
                                </div>

                                <a className="text-success d-block text-right px-4 py-3">
                                    <img width="24" className="mr-2" src="img/user.png" alt="user"/>Import
                                    from
                                    Database
                                </a>
                            </div>
                        </div>

                        <div className="text-right">
                            <a className="btn btn-outline-secondary">Save</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
