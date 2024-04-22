import {Component} from "react";
import {IpBlockProperties, IpBlockWithProperties} from "../common/ArtifactoryIpBlock";
import BackendRoutes from "../BackendRoutes";
import Toasts from "../components/Toasts";
import {IpBlock} from "../common/Contract";

interface IpBlockWithPropertiesAndState extends IpBlockWithProperties {
    showDropdown: boolean,
    belongsTo: string
}

interface State {
    ipblocks: { designerName: string, publishedIpBlocks: (IpBlock & { properties: IpBlockProperties, blockFullName: string })[] }[]
}

interface Props {

}

export default class CurationScreen extends Component<Props, State> {

    private toasts = new Toasts(this);

    constructor(props: Props) {
        super(props);

        this.state = {
            ipblocks: []
        }
    }

    async componentDidMount() {
        const a: IpBlockWithProperties[] = await BackendRoutes.ROUTE_GET_ALL_IPBLOCK_PROPERTIES()
            .then(e => e.data)
            .catch(() => []);

        const b: { designerName: string, publishedIpBlocks: IpBlock[] }[] = await BackendRoutes.ROUTE_GET_ALL_IPBLOCKS_FOR_CURATION()
            .then(e => e.data)
            .catch(() => []);

        // console.log("b", b);
        //Both IP blocks with enough property information to display it
        const bb: { designerName: string; publishedIpBlocks: (IpBlock & { properties: IpBlockProperties, blockFullName: string })[] }[] = b.map(blockWithUsername => {
            // console.log("a", a);
            const published = blockWithUsername.publishedIpBlocks.map(block => {
                const properties = a.find(e =>
                    e.properties.id === block.ipblockName &&
                    e.properties.version === block.ipblockVersion
                );

                return {
                    ...block,
                    properties: (properties ? properties.properties : undefined) as IpBlockProperties,
                    blockFullName: properties ? properties.name : ""//todo build assumed zip <name>_<version>.zip
                };
            });

            return {
                designerName: blockWithUsername.designerName,
                publishedIpBlocks: published
            };
        });
        console.log("bb", bb);

        const loadedIpBlocks = bb.filter(e =>
            e.publishedIpBlocks.find(a => a.curationStatus === "Loaded")
        );

        this.setState({
            ipblocks: loadedIpBlocks
        });
    }

    private async handleApproveIpBlock(designerName: string, index: number) {
        const designer = this.state.ipblocks.find(e => e.designerName === designerName);

        if (designer) {
            const designerBlock = designer!.publishedIpBlocks[index];

            BackendRoutes.ROUTE_POST_APPROVE_IPBLOCK_FOR_CURATION(designerBlock.blockFullName, designerBlock.ipblockName, designerBlock.ipblockVersion, designerName)
                .then(() => {
                    this.componentDidMount()
                    this.toasts.createToast("Success", `IPBlock: ${designerBlock.ipblockName} approved!`);
                })
                .catch(() =>
                    this.toasts.createToast("Failure", `IPBlock: ${designerBlock.ipblockName} failed to be approved!`)
                )
        }
    }

    private async handleRejectIpBlock(designerName: string, index: number) {
        const designer = this.state.ipblocks.find(e => e.designerName === designerName);

        if (designer) {
            const designerBlock = designer!.publishedIpBlocks[index];

            BackendRoutes.ROUTE_POST_REJECT_IPBLOCK_FOR_CURATION(designerBlock.blockFullName, designerBlock.ipblockName, designerBlock.ipblockVersion, designerName)
                .then(() => {
                    this.componentDidMount()
                    this.toasts.createToast("Success", `IPBlock: ${designerBlock.ipblockName} rejected!`);
                })
                .catch(() =>
                    this.toasts.createToast("Failure", `IPBlock: ${designerBlock.ipblockName} failed to be rejected!`)
                )
        }
    }

    render() {
        return (
            <section id="content-wrapper" className="dashboard-section">
                {this.toasts.container()}
                <div className="mb-30 text-24">Approvals</div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body py-0 pl-0 " style={{height: '100vh', display: 'flex',flexDirection: 'column',}}>
                                <div className="table-responsive" style={{  flex: 1 }}>
                                    <table className="table table-striped scroll mb-0 approval-table">
                                        <thead>
                                        <tr className="table-row">
                                            <th>
                                                IP Block Name
                                            </th>
                                            <th>
                                                Semantic Version
                                            </th>
                                            <th>
                                                Start Date - End Date
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
                                        {
                                            this.renderIpBlocks()
                                        }
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

    renderIpBlocks() {
        return this.state.ipblocks.map(block =>
            block.publishedIpBlocks.map((ipBlock, index) =>
                <tr>
                    <td>{ipBlock.ipblockName}</td>
                    <td>{ipBlock.ipblockVersion}</td>
                    <td>22/09/2023 - 23/09/2023 (mock)</td>
                    <td>{block.designerName}</td>
                    <td style={{textAlign: 'center'}}>
                        <button data-toggle="modal" data-target="#dateRangeModal"
                                className="btn-transparent"><img className="svg-16"
                                                                 src="img/download.svg"/>
                        </button>
                        <div className="modal fade" id="dateRangeModal" role="dialog"
                             aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content"
                                     style={{
                                         background: "#4E4E4E",
                                         borderRadius: "10px",
                                         padding: "50px"
                                     }}>
                                    <div>
                                        <div className="text-24">Download Successful</div>
                                        <p style={{marginTop: '15px'}}>Please review the design
                                            internally with the Committee/Board before approving
                                            or rejecting.</p>
                                    </div>
                                    <div
                                        className="modal-footer border-0 justify-content-center">
                                        <button
                                            onClick={() => this.handleDownloadIpBlock(ipBlock.properties.id, ipBlock.properties.version)}
                                            type="button" data-dismiss="modal"
                                            className="form-btn btn btn-dark btn-hover px-5">Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td style={{textAlign: 'center'}}>
                        <div className="dropdown">
                            <button data-toggle="dropdown" aria-expanded="false"
                                    className="btn-transparent">
                                <img className="svg-16" src="img/options.svg"/></button>
                            <div
                                className="dropdown-menu ipblocks-container border-0 text-white"
                                style={{width: "150px"}}>
                                <a className="d-block mb-2"
                                   onClick={() => this.handleApproveIpBlock(block.designerName, index)}>
                                    <div>Approve</div>
                                </a>
                                <a className="d-block mb-2"
                                   onClick={() => this.handleRejectIpBlock(block.designerName, index)}>
                                    <div>Reject</div>
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            )
        )
    }


    private async handleDownloadIpBlock(ipblockName: string, ipblockVersion: string) {
        //TODO I don't like this solution but it works
        const res = await BackendRoutes.ROUTE_GET_DOWNLOAD_IPBLOCK(ipblockName, ipblockVersion);
        const blob = new Blob([res.data], {type: res.headers['content-type']});

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${ipblockName}_${ipblockVersion}.zip`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

}
