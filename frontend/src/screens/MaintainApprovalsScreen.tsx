import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import BackendRoutes from "../BackendRoutes";
import {Division} from "../common/Contract";
import {IpBlockWithProperties} from "../common/ArtifactoryIpBlock";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';



interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
}

interface State {
   
}

export default class MaintainDivisionsScreen extends Component<Props, State> {
    // private showBlocks = false;
    // private existingDivisions: DivisionCanEdit[] = [];

    constructor(props: Props) {
        super(props);
        this.state = {
      
        }

        document.title = `CMS - Maintain Divisions`;
    }

    async componentDidMount() {

        this.setState(previousState => ({
        
        }))

    }


    render() {
        return (
            <section id="content-wrapper" className="dashboard-section">
                <div className="mb-30 text-24">Approvals</div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body py-0 pl-0 ">
                                <div className="table-responsive">
                                    <table className="table table-striped scroll mb-0 approval-table">
                                        <thead>
                                        <tr className="table-row">
                                            <th>
                                                IP Block Name
                                            </th>
                                            <th>
                                                Version
                                            </th>
                                            <th>
                                                Start Date - End Date
                                            </th>
                                            <th>
                                                Semantic Version
                                            </th>
                                            <th>
                                                Developer
                                            </th>
                                            <th>
                                                Downloads
                                            </th>
                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody style={{height: "auto"}}>
                                            <tr>
                                                <td>Ipblock 1</td>
                                                <td>1.0</td>
                                                <td>22/03/2023 - 23/03/2023</td>
                                                <td>0.0.1</td>
                                                <td>Micahel</td>
                                                <td style={{textAlign: 'center'}}>
                                                    <button data-toggle="modal" data-target="#dateRangeModal" className="btn-transparent"><img className="svg-16" src="img/download.svg" /></button>
                                                    <div className="modal fade" id="dateRangeModal" role="dialog"
                                                        aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                                            <div className="modal-content"
                                                                style={{background: "#4E4E4E", borderRadius: "10px", padding: "50px"}}>
                                                                <div>
                                                                    <div className="text-24" >Download Successful</div>
                                                                    <p style={{ marginTop: '15px'}}>Please review the design internally with the Committee/Board before approving or rejecting.</p>
                                                                </div>
                                                                <div className="modal-footer border-0 justify-content-center">
                                                                    <button type="button" data-dismiss="modal" className="form-btn btn btn-dark btn-hover px-5">Done
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <div className="dropdown">
                                                        <button data-toggle="dropdown" aria-expanded="false" className="btn-transparent">
                                                            <img className="svg-16" src="img/options.svg" /></button>
                                                        <div className="dropdown-menu ipblocks-container border-0 text-white"
                                                                style={{width: "150px"}}>
                                                            <a className="d-block mb-2"><div>Approve</div></a>
                                                            <a className="d-block mb-2"><div>Reject</div></a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Ipblock 1</td>
                                                <td>1.0</td>
                                                <td>22/03/2023 - 23/03/2023</td>
                                                <td>0.0.1</td>
                                                <td>Micahel</td>
                                                <td style={{textAlign: 'center'}}>
                                                    <button data-toggle="modal" data-target="#dateRangeModal" className="btn-transparent"><img className="svg-16" src="img/download.svg" /></button>
                                                    <div className="modal fade" id="dateRangeModal" role="dialog"
                                                        aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                                            <div className="modal-content"
                                                                style={{background: "#4E4E4E", borderRadius: "10px", padding: "50px"}}>
                                                                <div>
                                                                    <div className="text-24" >Download Successful</div>
                                                                    <p style={{ marginTop: '15px'}}>Please review the design internally with the Committee/Board before approving or rejecting.</p>
                                                                </div>
                                                                <div className="modal-footer border-0 justify-content-center">
                                                                    <button type="button" data-dismiss="modal" className="form-btn btn btn-dark btn-hover px-5">Done
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{textAlign: 'center'}}>
                                                    <div className="dropdown">
                                                        <button data-toggle="dropdown" aria-expanded="false" className="btn-transparent">
                                                            <img className="svg-16" src="img/options.svg" /></button>
                                                        <div className="dropdown-menu ipblocks-container border-0 text-white"
                                                                style={{width: "150px"}}>
                                                            <a className="d-block mb-2"><div>Approve</div></a>
                                                            <a className="d-block mb-2"><div>Reject</div></a>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

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
