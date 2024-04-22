import React, {Component} from "react";
import {Link} from "react-router-dom";

export type Pages =
    "/maintain-people"
    | "/maintain-documents"
    | "/consent-batch"
    | "/track-and-manage"
    | "/create-report"
    | "/create-report-msa"
    | "/client"
    | "/divisions"
    | "/test"
    | "/"

interface SidebarState {
    activePage: Pages,
}

interface Props {
    selectedCompany: string,
    pageIsDirty: boolean,
    parentCallbackPageIsDirty: (b: boolean) => void,
    activePage: {
        activePageRoute: Pages,
        callbackChangeActivePage: (p: Pages) => void
    }
}


export default class Sidebar extends Component<Props, SidebarState> {

    public constructor(props: Props) {
        super(props);

        this.state = {
            //TODO fix casting?
            // @ts-ignore
            activePage: window.location.pathname,
            divisionExists: false
        }
    }

    private changeActivePageIcon(page: Pages) {
        this.props.activePage.callbackChangeActivePage(page);
        // this.setState({activePage: page});
    }

    //TODO it might change structure later
    private companyExists() {
        return this.props.selectedCompany !== "N/A";
    }

    private confirmExitFromDirtyPage(event: React.MouseEvent<HTMLAnchorElement>): boolean {

        if (this.props.pageIsDirty) {
            const res = window.confirm("There are unsaved changes, are you sure you want to leave?");
            if (!res) {
                event.preventDefault();
                window.addEventListener("beforeunload", this.refreshHandler);
                return true;
            } else {
                this.props.parentCallbackPageIsDirty(false);
            }
        }

        window.removeEventListener("beforeunload", this.refreshHandler);
        return false;
    }

    //TODO
    private refreshHandler = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        event.returnValue = "";
    }

    render() {


        return (
            <aside className="scrollbar" id="sidebar-wrapper">
                <ul className="sidebar-nav">
                    <li className="pt-1">
                        <div className="text-center logo">
                            <div className="d-flex justify-content-between">
                                <small>Current Client</small>
                                <Link to="/" onClick={(event) => {
                                    this.changeActivePageIcon("/")
                                    // this.confirmExitFromDirtyPage(event)
                                }}>
                                    <small className="text-success"><em>Change </em></small>
                                </Link>
                            </div>
                            <h4 className="mb-1 mt-3 p-1">{this.props.selectedCompany}</h4>
                            <svg xmlns="http://www.w3.org/2000/svg" className="sidebar-logo" viewBox="0 0 370 2">
                                <path id="line-break" d="M0,0H370V2H0Z" fill="#fff"/>
                            </svg>
                            <button className="d-lg-none" id="sidebar-toggle2" onClick={() => {
                                const wrapper = document.getElementById("wrapper");
                                if (wrapper?.getAttribute("class") !== "toggled") {
                                    wrapper!.setAttribute("class", "toggled");
                                } else {
                                    wrapper!.setAttribute("class", "");
                                }
                            }}><i className="fa fa-close"></i></button>
                        </div>
                    </li>


                </ul>
            </aside>
        )
    }
}
