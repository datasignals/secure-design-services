import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import BackendRoutes from "../BackendRoutes";
import {Division, IpBlockDef} from "../common/Contract";
import {IpBlockWithProperties} from "../common/ArtifactoryIpBlock";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import ModalPopup from "../components/ModalPopup";
import Toasts from "../components/Toasts";

//Additional properties for the IpBlockDef to manage its state
interface IpBlockDefIsNew extends IpBlockDef {
    isNew?: boolean
}

//Additional properties for the Division to manage its state
interface DivisionCanEdit extends Division {
    canEdit: boolean,
    markedToDelete: boolean,
    showBlocks?: boolean,
    blocksreleased: IpBlockDefIsNew[]
}

interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
    selectedCompany: string
}

interface State {
    divisions: {
        existingDivisions: DivisionCanEdit[],
        newDivisions: Division[],
    },
    allPossibleIpBlocks: IpBlockWithProperties[],
    availableDivisionNames: string[],
    isModalOpen: boolean,
}

export default class MaintainDivisionsScreen extends Component<Props, State> {
    // private showBlocks = false;
    // private existingDivisions: DivisionCanEdit[] = [];

    private toasts = new Toasts(this);

    constructor(props: Props) {
        super(props);
        this.state = {
            divisions: {
                existingDivisions: [],
                newDivisions: [],
            },
            allPossibleIpBlocks: [],
            availableDivisionNames: [],
            isModalOpen: false,
        }

        this.handleAddDivision = this.handleAddDivision.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        document.title = `CMS - Maintain Divisions`;
    }

    async componentDidMount() {


        //TODO delay is needed to update the database with new elements
        // await new Promise(e => setTimeout(e, 100));

        const divisions: Division[] | undefined = await BackendRoutes.ROUTE_GET_DIVISIONS_BELONGING_TO_COMPANY(this.props.selectedCompany)
            .then(e => e.data)
            .catch((e: any) => {
                console.error("Failed to find any IP blocks: reason: " + e.toString())
                return Promise.resolve(undefined);
            });


        const allPossibleIpBlocks: IpBlockWithProperties[] = await BackendRoutes.ROUTE_GET_ALL_IPBLOCK_PROPERTIES()
            .then(e => e.data.filter(e => e.properties.curated === true)) //TODO i should not filter in the frontend, add route to request all ipblocks but only approved ones
            .catch((e: any) => {
                console.error("Failed to find any IP blocks: reason: " + e.toString())
                return [];
            });

            console.log(" allPossibleIpBlocks",  allPossibleIpBlocks);
        const availableDivisionNames: string[] = await BackendRoutes.ROUTE_GET_AVAILABLE_DIVISIONS()
            .then(e => e.data)
            .catch((e: any) => {
                console.error("Failed to find any available division names: reason: " + e.toString())
                return []
            });


        const existingDivisions: DivisionCanEdit[] = divisions?.map(e => ({
            //this.existingDivisions = mongoContract?.contract.divisions.map(e => ({
            ...e,
            //TODO remove this mock later, it should be inside mongo
            blocksreleased: e.blocksreleased.map(a => ({...a, isNew: false})),
            canEdit: false,
            markedToDelete: false,
            showBlocks: false
        })) || [];

        this.setState(previousState => ({
            divisions: {
                ...previousState.divisions,
                existingDivisions: existingDivisions,
            },
            allPossibleIpBlocks: allPossibleIpBlocks.filter(e => e.properties.curated !== undefined), //TODO this relies on artifactory being correct, not mongo
            availableDivisionNames: availableDivisionNames.filter(e => !existingDivisions.map(a => a.name).includes(e))
        }))

    }

    toggleEditExistingDivision(index: number) {
        const existingDivision = this.state.divisions.existingDivisions;

        //This ensures only one element can be edited at the time and its no longer marked
        // to be removed
        existingDivision.forEach((e, i) => {
                if (i !== index) {
                    e.canEdit = false;
                    e.blocksreleased = e.blocksreleased.filter(p => !p.isNew);
                } else {
                    e.canEdit = !e.canEdit;
                    e.markedToDelete = false;
                }
            }
        );

        const blocksreleased = existingDivision[index].blocksreleased
            .filter(e => !e.isNew);
        existingDivision[index].blocksreleased = blocksreleased;


        this.setState(previousState => ({
            divisions: {
                ...previousState.divisions,
                existingDivisions: existingDivision
            }
        }));
    }

    async handleUpdateExistingDivision(division: string) {
        const divisionToAdd = this.state.divisions.existingDivisions.find(e => e.name === division);

        divisionToAdd?.blocksreleased.forEach(ipBlock =>
            ipBlock.isNew &&
            BackendRoutes.ROUTE_POST_ADD_IPBLOCK_TO_DIVISION(this.props.selectedCompany, division, ipBlock)
        );

        await this.componentDidMount();
    }

    //TODO delete
    handleChangeSelectedDivision(e: any, index: number) {
        const value = e.target.value;

        const newDivisions = this.state.divisions.newDivisions;
        const division = newDivisions[index];

        division.name = value;

        this.setState({
            divisions: {
                ...this.state.divisions,
                newDivisions: newDivisions
            }
        })
    }

    //UPdated
    handleAddIpBlock(divisionName: string) {
        const divisions = this.state.divisions.existingDivisions;

        const newDivision = divisions.find(e => e.name === divisionName);

        if (newDivision) {
            const htmlLabel = document.getElementById(`ipblocks-${divisionName}`) as HTMLSelectElement;
            const selectedArtifact = htmlLabel.value;

            const htmlCheckboxNoExpiryDate = (document.getElementById("no-expiry-checkbox") as HTMLInputElement)
                .checked;


            const ipblock = this.state.allPossibleIpBlocks.find(e => e.name === selectedArtifact);


            let rangeIsValid: boolean = false;
            let fromDate: number = 0;
            let tillDate: number = 0;

            if (!htmlCheckboxNoExpiryDate) {
                const htmlRange = (document.getElementById(`ipblocks-calendar-range-${divisionName}`) as HTMLInputElement)
                    .value.split("-").map(e => e.trim());

                if (htmlRange.length !== 2) {
                    return;
                }

                //TODO I don't like this whole thing, but Date.parse needs specfic format to work
                // that being said I am sure this can be done much better
                const [fromDay, fromMonth, fromYear] = htmlRange[0].split("/");
                const [tillDay, tillMonth, tillYear] = htmlRange[1].split("/");

                fromDate = Date.parse(`${fromYear}/${fromMonth}/${fromDay}`);
                tillDate = Date.parse(`${tillYear}/${tillMonth}/${tillDay}`);
                rangeIsValid = (
                    !isNaN(fromDate) &&
                    !isNaN(tillDate) &&
                    tillDate > fromDate
                ) ? (tillDate - fromDate) > 0 : false;
            }


            if (ipblock) {
                const ipblockAlreadyExists = newDivision.blocksreleased.find(e => e.name === ipblock.properties.id && e.version === ipblock.properties.version);
                if (!ipblockAlreadyExists) {
                    newDivision.blocksreleased.push({
                        name: ipblock.properties.id,
                        version: ipblock.properties.version,
                        startDate: rangeIsValid ? fromDate?.toString() : undefined,
                        endDate: rangeIsValid ? tillDate?.toString() : undefined,
                        isNew: true
                    })
                    this.setState(previousState => ({
                        // ...previousState,
                        divisions: {
                            ...previousState.divisions,
                            existingDivisions: divisions
                            // newDivisions: divisions,
                        }
                    }));
                }
            }
        }

    }

    //
    // handleAddIpBlock(division: string) {
    //     const htmlList = document.getElementById(`ipblocks-${division}`) as HTMLSelectElement;
    //     const selectedArtifact = htmlList.value;
    //
    //     const ipBlock = this.state.allPossibleIpBlocks.find(e => e.name === selectedArtifact);
    //
    //     const existingDivisions = this.state.divisions.existingDivisions;
    //     const divisionExists = existingDivisions.find(e => e.name === division);
    //
    //     if (divisionExists && ipBlock) {
    //         const ipBlockAlreadyExists = divisionExists.blocksreleased.find(e => e.name === ipBlock.properties.id);
    //
    //         const htmlFromDate = document.getElementById(`ipblocks-from-${division}`) as HTMLInputElement;
    //         const htmlTillDate = document.getElementById(`ipblocks-till-${division}`) as HTMLInputElement;
    //
    //         const fromDate = Date.parse(htmlFromDate.value);
    //         const tillDate = Date.parse(htmlTillDate.value);
    //
    //         const rangeIsValid: boolean = (
    //             !isNaN(fromDate) &&
    //             !isNaN(tillDate) &&
    //             tillDate > fromDate
    //         ) ? (tillDate - fromDate) > 0 : false;
    //
    //
    //         if (!ipBlockAlreadyExists) {
    //             divisionExists.blocksreleased.push({
    //                 name: ipBlock.properties.id,
    //                 version: ipBlock.properties.version,
    //                 startDate: rangeIsValid ? fromDate.toString() : undefined,
    //                 endDate: rangeIsValid ? tillDate.toString() : undefined
    //             });
    //
    //             this.setState(previousState => ({
    //                 divisions: {
    //                     ...previousState.divisions,
    //                     existingDivisions: existingDivisions
    //                 }
    //             }))
    //         }
    //
    //     }
    //
    // }

    deleteRow(index: number, existingOrNew: "new" | "existing") {
        if (existingOrNew === "existing") {
            const existingDivisions = this.state.divisions.existingDivisions;
            existingDivisions[index].markedToDelete = !existingDivisions[index].markedToDelete;

            this.setState(previousState => ({
                divisions: {
                    ...previousState.divisions,
                    existingDivisions: existingDivisions
                }
            }))

        } else if (existingOrNew === "new") {
            this.state.divisions.newDivisions.splice(index, 1);
            this.setState({
                divisions: {
                    ...this.state.divisions,
                    newDivisions: this.state.divisions.newDivisions
                }
            });
        }
    }

    handleAddIpBlockToNewDivision(divisionName: string, index: number) {
        const divisions = this.state.divisions.newDivisions;

        const newDivision = divisions.find(e => e.name === divisionName);

        if (newDivision) {
            const htmlLabel = document.getElementById(`ipblocks-${index}`) as HTMLSelectElement;
            const selectedArtifact = htmlLabel.value;

            const htmlCheckboxNoExpiryDate = (document.getElementById("no-expiry-checkbox") as HTMLInputElement)
                .checked;

            const ipblock = this.state.allPossibleIpBlocks.find(e => e.name === selectedArtifact);


            let rangeIsValid: boolean = false;
            let fromDate: number = 0;
            let tillDate: number = 0;

            if (!htmlCheckboxNoExpiryDate) {
                const htmlRange = (document.getElementById(`ipblocks-calendar-range-${index}`) as HTMLInputElement)
                    .value.split("-").map(e => e.trim());

                if (htmlRange.length !== 2) {
                    return;
                }

                //TODO I don't like this whole thing, but Date.parse needs specfic format to work
                // that being said I am sure this can be done much better
                const [fromDay, fromMonth, fromYear] = htmlRange[0].split("/");
                const [tillDay, tillMonth, tillYear] = htmlRange[1].split("/");

                fromDate = Date.parse(`${fromYear}/${fromMonth}/${fromDay}`);
                tillDate = Date.parse(`${tillYear}/${tillMonth}/${tillDay}`);
                rangeIsValid = (
                    !isNaN(fromDate) &&
                    !isNaN(tillDate) &&
                    tillDate > fromDate
                ) ? (tillDate - fromDate) > 0 : false;
            }


            if (ipblock) {
                const ipblockAlreadyExists = newDivision.blocksreleased.find(e => e.name === ipblock.properties.id && e.version === ipblock.properties.version);
                if (!ipblockAlreadyExists) {
                    newDivision.blocksreleased.push({
                        name: ipblock.properties.id,
                        version: ipblock.properties.version,
                        startDate: rangeIsValid ? fromDate?.toString() : undefined,
                        endDate: rangeIsValid ? tillDate?.toString() : undefined
                    })
                    this.setState(previousState => ({
                        // ...previousState,
                        divisions: {
                            ...previousState.divisions,
                            existingDivisions: this.state.divisions.existingDivisions,
                            newDivisions: divisions,
                        }
                    }));
                }
            }
        }
    }

    handleAddDivision() {
        const list = this.state.divisions.newDivisions;
        list.push({name: this.state.availableDivisionNames[0], "division-auid": "", blocksreleased: [], hash: "todo"})

        this.setState(previousState => ({
            ...previousState,
            divisions: {
                ...previousState.divisions,
                existingDivisions: this.state.divisions.existingDivisions,
                newDivisions: list
            }
        }));
    }

    async handleSubmit() {
        const stateIsModified = this.state.divisions.existingDivisions
            .flatMap(e =>
                e.blocksreleased.flatMap(a => a.isNew || false)
            ).reduce((a, b) => a || b, false);
        if (stateIsModified) {
            alert("Please finish Editing existing divisions First")
            return;
        }

        this.setState({isModalOpen: true}, () => {
            console.log("second", this.state.isModalOpen);
        });

        for (const division of this.state.divisions.newDivisions) {
            const data = division.blocksreleased;
            await BackendRoutes.ROUTE_POST_ADD_DIVISION(this.props.selectedCompany, division.name, data);
            this.setState({isModalOpen: false});
        }

        for (const division of this.state.divisions.existingDivisions) {
            if (division.markedToDelete) {
                await BackendRoutes.ROUTE_POST_REMOVE_DIVISION(this.props.selectedCompany, division.name);
            }
        }


        this.setState(previousState => ({
            divisions: {
                ...previousState.divisions,
                newDivisions: []
            }
        }));

        this.toasts.deleteQuickToast();
        await this.componentDidMount();
    }

    /*     public getIpBlocks() : IpBlockDef[]{
            let showDivisions:IpBlockDef[] = [];
            const divisions = this.state.divisions.existingDivisions;
            for(let i = 0; i<2 ; i++){
                showDivisions.push(divisions[i].blocksreleased[i]);
            }
            console.log(showDivisions)
            return showDivisions
        } */

    private toggleShowBlocks(index: number) {
        const existingDivisions = this.state.divisions.existingDivisions;
        existingDivisions[index].showBlocks = !existingDivisions[index].showBlocks;
        this.setState(previousState => ({
            divisions: {
                ...previousState.divisions,
                existingDivisions: existingDivisions,
            }
        }))
    }

    private getFormattedDate(days?: number): string {
        const today = new Date();

        if (days) {
            today.setDate(today.getDate() + days);
        }

        const day = today.getDate().toString().padStart(2, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const year = today.getFullYear();

        return `${day}-${month}-${year}`;
    }


    render() {
        return (
            <section id="content-wrapper" className="dashboard-section">

                <div className="row">
                    <div className="col-lg-12">
                        <div className="card activity-block">
                            <div className="card-body py-0 pl-0 ">
                                <div className="table-responsive">
                                    {this.toasts.container()}
                                    <table className="table table-striped scroll mb-0">


                                        <thead>
                                        <tr className="table-row form-container">
                                            <th>
                                                Division
                                            </th>
                                            <th>
                                                Division UID
                                            </th>
                                            <th>
                                                IP Blocks
                                            </th>
                                            <th>
                                                Add IP Blocks
                                            </th>
                                            <th>
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody style={{height: "22"}}>

                                        {this.state.divisions !== undefined &&
                                            this.renderExistingDivisions(this.state.divisions.existingDivisions)
                                        }

                                        {this.state.divisions !== undefined &&
                                            this.renderNewDivisions(this.state.divisions.newDivisions)
                                        }

                                        <tr>
                                            <td colSpan={5}>
                                                <div className="d-flex justify-content-between">
                                                <a className="text-success"
                                                   onClick={this.handleAddDivision}
                                                >
                                                    <img width="24"
                                                         className="mr-2"
                                                         src="img/user.png"
                                                         alt="user"/>Add Division
                                                </a>
                                                <a className="btn btn-success btn-outline-secondary" onClick={this.handleSubmit}>Save</a>
                                                </div>
                                            </td>
                                        </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {this.state.isModalOpen && <ModalPopup show={this.state.isModalOpen}
                                                               onHide={() => this.setState({isModalOpen: false})}/>}

                    </div>
                </div>

            </section>
        )
    }


    renderDate(fromDate?: string, tillDate?: string) {
        if (!fromDate && !tillDate) {
            return <>No Expiration</>;
        }
        const currentDate = new Date().getTime();

        const fromDateNumb = parseInt(fromDate!)
        const tillDateNumb = parseInt(tillDate!)

        const fromDateCalendar = new Date(fromDateNumb);
        const tillDateCalendar = new Date(tillDateNumb);

        const daysDifference = Math.round(((tillDateNumb - currentDate) / (1000 * 60 * 60 * 24) * 10) / 10);


        return (fromDateCalendar && tillDateCalendar) &&
            <p>
                Valid period
                <br/>
                {fromDateCalendar.toLocaleDateString()}
                <br/>
                {tillDateCalendar.toLocaleDateString()}
                <br/>
                {
                    daysDifference === 0 ?
                        "Expiring today" :
                        daysDifference > 0 ?
                            daysDifference + " days left" :
                            "Expired"
                }
            </p>
    }

    renderExistingDivisions(existingDivisions: DivisionCanEdit[]) {
        return existingDivisions.map((division, index) => (
            division.canEdit ?
                <tr key={index} className="form-container">
                    <td>
                        {division.name}
                    </td>
                    <td>
                        {division["division-auid"]}
                    </td>
                    <td>
                        {division.blocksreleased.slice(0, 2).map(block => (
                            <li className="ipblock-cards">
                                <div>
                                    <div>{block?.name} {block?.version}</div>
                                    <div
                                        style={{fontSize: "10px", opacity: .5}}>{this.renderDate(block?.startDate, block?.endDate)}</div>
                                </div>
                            </li>
                        ))}
                        <div className="dropdown">
                            {division.blocksreleased.length > 2 ?
                                <button className="ipblocks-btn btn btn-dark btn-hover pl-2 pr-2" role="button"
                                        data-toggle="dropdown" aria-expanded="false">
                                    More
                                </button> : null}
                            <div className="dropdown-menu ipblocks-container border-0 text-white"
                                 style={{width: "200px"}}>
                                {division.blocksreleased.map(block => (
                                    <a className="d-block mb-2">
                                        <div>
                                            <div>{block?.name} {block?.version}</div>
                                            <div
                                                style={{fontSize: "10px", opacity: .6}}>{this.renderDate(block?.startDate, block?.endDate)}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </td>
                    <td>
                        <select name="ipblocks" id={`ipblocks-${division.name}`}>
                            {
                                this.state.allPossibleIpBlocks.map(e =>
                                    <option value={e.name}>{e.name}</option>
                                )
                            }
                        </select>
                        <button data-toggle="modal" data-target="#dateRangeModal"
                                className="mt-2 form-btn btn btn-dark btn-hover pl-4 pr-4">Add
                        </button>
                        <div className="modal fade" id="dateRangeModal" role="dialog"
                             aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content"
                                     style={{background: "#4E4E4E", borderRadius: "10px", padding: "30px"}}>
                                    <div className="modal-header border-0">
                                        <h5 style={{fontSize: "16px", letterSpacing: "1px"}} className="modal-title"
                                            id="exampleModalCenterTitle">Select DateRange (Optional)</h5>
                                        {/* <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span className="text-white" aria-hidden="true">&times;</span>
                                    </button> */}
                                    </div>
                                    <div className="modal-body">
                                        <DateRangePicker
                                            initialSettings={{startDate: this.getFormattedDate(), endDate: this.getFormattedDate(7), locale: {format: "DD/MM/YYYY"}}}>
                                            <input id={`ipblocks-calendar-range-${division.name}`} type="text"
                                                   className="form-control"/>
                                        </DateRangePicker>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" onClick={() => this.handleAddIpBlock(division.name)}
                                                data-dismiss="modal"
                                                className="form-btn btn btn-dark btn-hover px-5">Done
                                        </button>
                                        <div>
                                            <input id="no-expiry-checkbox" type="checkbox"/>
                                            <label>No Expiry</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td className="d-flex justify-content-between">
                        <button disabled={false} className="form-btn btn btn-dark btn-hover"
                                onClick={() => this.handleUpdateExistingDivision(division.name)}>
                            <img className="delete-row" width="14" height="14" src="img/tickActive.svg"
                                 alt="delete"/>
                        </button>
                        <button disabled={false} className="ml-2 form-btn btn btn-dark btn-hover"
                                onClick={() => this.toggleEditExistingDivision(index)}>
                            <img className="delete-row" width="14" height="14" src="img/close.png" alt="delete"/>
                        </button>
                    </td>
                </tr> :

                <tr key={index} className={division.markedToDelete ? "bg-danger form-container" : "form-container"}>
                    <td>
                        {division.name}
                    </td>
                    <td>
                        {division["division-auid"]}
                    </td>
                    <td>
                        {division.blocksreleased.slice(0, 2).map(block => (
                            <li className="ipblock-cards">
                                <div>
                                    <div>{block?.name} {block?.version}</div>
                                    <div
                                        style={{fontSize: "10px", opacity: .5}}>{this.renderDate(block?.startDate, block?.endDate)}</div>
                                </div>
                            </li>
                        ))}
                        <div className="dropdown">
                            {division.blocksreleased.length > 2 ?
                                <button className="ipblocks-btn btn btn-dark btn-hover pl-2 pr-2" role="button"
                                        data-toggle="dropdown" aria-expanded="false">
                                    More
                                </button> : null}
                            <div className="dropdown-menu ipblocks-container border-0 text-white"
                                 style={{width: "200px"}}>
                                {division.blocksreleased.map(block => (
                                    <a className="d-block mb-2">
                                        <div>
                                            <div>{block?.name} {block?.version}</div>
                                            <div
                                                style={{fontSize: "10px", opacity: .6}}>{this.renderDate(block?.startDate, block?.endDate)}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </td>
                    <td>
                        <></>
                    </td>
                    <td width="50" className="d-flex justify-content-between">
                        <button disabled={true} onClick={() => this.deleteRow(index, "existing")}
                                className="form-btn btn btn-dark btn-hover">
                            <img className="delete-row" src="img/delete.svg" alt="delete"/>
                        </button>
                        <button disabled={false} className="form-btn ml-2 btn btn-dark btn-hover"
                                onClick={() => this.toggleEditExistingDivision(index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 27 27.007">
                                <path id="Icon_ionic-ios-settings" data-name="Icon ionic-ios-settings"
                                      d="M29.271,18A3.474,3.474,0,0,1,31.5,14.759a13.772,13.772,0,0,0-1.666-4.015,3.521,3.521,0,0,1-1.413.3,3.467,3.467,0,0,1-3.171-4.88A13.73,13.73,0,0,0,21.241,4.5a3.471,3.471,0,0,1-6.483,0,13.772,13.772,0,0,0-4.015,1.666,3.467,3.467,0,0,1-3.171,4.88,3.406,3.406,0,0,1-1.413-.3A14.076,14.076,0,0,0,4.5,14.766a3.473,3.473,0,0,1,.007,6.483,13.772,13.772,0,0,0,1.666,4.015,3.468,3.468,0,0,1,4.577,4.577,13.852,13.852,0,0,0,4.015,1.666,3.465,3.465,0,0,1,6.469,0,13.772,13.772,0,0,0,4.015-1.666,3.472,3.472,0,0,1,4.577-4.577,13.852,13.852,0,0,0,1.666-4.015A3.491,3.491,0,0,1,29.271,18ZM18.063,23.618a5.625,5.625,0,1,1,5.625-5.625A5.623,5.623,0,0,1,18.063,23.618Z"
                                      transform="translate(-4.5 -4.5)" fill="#fff"/>
                            </svg>
                        </button>
                    </td>
                </tr>
        ))
    }

    renderNewDivisions(newDivisions: Division[]) {
        return newDivisions.map((division, index) => (
            <tr key={index} className="form-container">
                <td>
                    {/*<input type="text" name="name" placeholder="name"*/}
                    {/*       onChange={(e) => this.handleNewDivisionInput(e, index)}/>*/}
                    <select onChange={e => this.handleChangeSelectedDivision(e, index)}>
                        {
                            this.state.availableDivisionNames.map(e =>
                                <option value={e}>{e}</option>
                            )
                        }
                    </select>
                </td>
                <td>
                    <input type="text" disabled={true} name="division-auid" placeholder="Automatically Generated"/>
                    {/*<input type="text" name="division-auid" placeholder="auid"*/}
                    {/*       onChange={(e) => this.handleNewDivisionInput(e, index)}/>*/}
                </td>
                <td>
                    {division.blocksreleased.slice(0, 2).map(block => (
                        <li className="ipblock-cards">
                            <div>
                                <div>{block?.name} {block?.version}</div>
                                <div
                                    style={{fontSize: "10px", opacity: .5}}>{this.renderDate(block?.startDate, block?.endDate)}</div>
                            </div>
                        </li>
                    ))}
                    <div className="dropdown">
                        {division.blocksreleased.length > 2 ?
                            <button className="ipblocks-btn btn btn-dark btn-hover pl-2 pr-2" role="button"
                                    data-toggle="dropdown" aria-expanded="false">
                                More
                            </button> : null}
                        <div className="dropdown-menu ipblocks-container border-0 text-white"
                             style={{width: "200px"}}>
                            {division.blocksreleased.map(block => (
                                <a className="d-block mb-2">
                                    <div>
                                        <div>{block?.name} {block?.version}</div>
                                        <div
                                            style={{fontSize: "10px", opacity: .6}}>{this.renderDate(block?.startDate, block?.endDate)}</div>
                                    </div>
                                </a>
                            ))}
                        </div>

                    </div>
                </td>
                <td>
                    <select name="ipblocks" id={`ipblocks-${index}`}>
                        {
                            this.state.allPossibleIpBlocks.map(e =>
                                <option value={e.name}>{e.name}</option>
                            )
                        }
                    </select>
                    <button data-toggle="modal" data-target="#dateRangeModal"
                            className="mt-2 form-btn btn btn-dark btn-hover pl-4 pr-4">Add
                    </button>
                    <div className="modal fade" id="dateRangeModal" role="dialog"
                         aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content"
                                 style={{background: "#4E4E4E", borderRadius: "10px", padding: "30px"}}>
                                <div className="modal-header border-0">
                                    <h5 style={{fontSize: "16px", letterSpacing: "1px"}} className="modal-title"
                                        id="exampleModalCenterTitle">Select DateRange (Optional)</h5>

                                    {/* <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span className="text-white" aria-hidden="true">&times;</span>
                                </button> */}
                                </div>
                                <div className="modal-body">
                                    <DateRangePicker
                                        initialSettings={{startDate: this.getFormattedDate(), endDate: this.getFormattedDate(7), locale: {format: "DD/MM/YYYY"}}}>
                                        <input id={`ipblocks-calendar-range-${index}`} type="text"
                                               className="form-control"/>
                                    </DateRangePicker>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button"
                                            onClick={() => this.handleAddIpBlockToNewDivision(division.name, index)}
                                            data-dismiss="modal" className="form-btn btn btn-dark btn-hover px-5">Done
                                    </button>
                                    <div>
                                        <input id="no-expiry-checkbox" type="checkbox"/>
                                        <label>No Expiry</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td width="50" className="d-flex justify-content-between">
                    <button onClick={() => this.deleteRow(index, "new")} className="form-btn btn btn-dark btn-hover">
                        <img className="delete-row" src="img/delete.svg" alt="delete"/>
                    </button>
                </td>
            </tr>
        ))
    }

}
