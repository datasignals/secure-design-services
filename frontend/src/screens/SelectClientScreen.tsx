import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import CompanyData from "../common/CompanyData";
import OwlCarousel from "react-owl-carousel";
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import {Link} from "react-router-dom";
import LoggedUser from "../common/LoggedUser";
import BackendRoutes from "../BackendRoutes";
import {Pages} from "../components/Sidebar";


interface ClientsTableProps {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
    parentCallbackSelectedCompany: (s: string) => void,
    parentCallbackSelectActivePage: (p: Pages) => void,
    loggedUser: LoggedUser
}

interface ClientsTableState {
    tableContent: {
        company: string,
        accountManager: string,
    }[];
    clients?: {
        username: string,
        accountManager: string,
        select: boolean,
        graphic?: string
    }[],
    availableCompanies: CompanyData[],
    searchText: string //search text is input from the search bar being compared against company names, company managers and their emails (if applicable)
    sortOrderAscending: boolean
}

export default class SelectClientScreen extends Component<ClientsTableProps, ClientsTableState> {


    constructor(props: ClientsTableProps) {
        super(props);
        this.state = {
            tableContent: [],
            clients: [],
            availableCompanies: [],
            searchText: "",
            sortOrderAscending: false
        }
        // this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.handleTextSearch = this.handleTextSearch.bind(this);
        this.sortAvailableClients = this.sortAvailableClients.bind(this);

        document.title = `CMS - Select Client`;
    }


    private readonly tableStyle = {
        width: "25%",
    }

    async componentDidMount() {

        await this.update();
    }


    async update() {
        if (this.props.loggedUser.username !== "") {
            const response = await BackendRoutes.ROUTE_GET_COMPANIES_ASSOCIATED_WITH_CLIENT(this.props.loggedUser.username);
            const allCompanies: string[] = response.status === 200 ? await response.data : [];


            const companyData: CompanyData[] = await Promise.all(allCompanies.map(async e => {
                const data: CompanyData = await BackendRoutes.ROUTE_GET_COMPANY_DATA(e).then(a => a.data);
                return {
                    ...data,
                    graphics: BackendRoutes.ROUTE_GET_COMPANY_ASSET(data.companyName)//BackendRoutes.ROUTE_ASSET_COMPANY(data.graphics)
                };
            }));


            this.setState({availableCompanies: companyData});
        } else {
            //TODO this is a silly hack to make sure everything renders correctly
            setTimeout(() => {
                this.update()
            }, 20);
        }
    }

    handleTextSearch(e: any) {
        const textValue: string = e.target.value;

        this.setState({
            searchText: textValue
        })
    }

    sortAvailableClients(e: any) {
        if (this.state.sortOrderAscending) {
            this.setState({
                    availableCompanies: this.state.availableCompanies
                        .sort((a, b) => a.companyName.localeCompare(b.companyName)),
                    sortOrderAscending: false
                }
            )
        } else {
            this.setState({
                    availableCompanies: this.state.availableCompanies
                        .sort((a, b) => b.companyName.localeCompare(a.companyName)),
                    sortOrderAscending: true
                }
            )
        }


    }

    render() {

        //TODO this would be used in fuzzy searching to filter out based on
        // search bar
        const filteredCompanyData = this.state.availableCompanies.filter(e =>
            e.companyName.toLowerCase().match(this.state.searchText.toLowerCase()) ||
            e.companyManager.toLowerCase().match(this.state.searchText.toLowerCase())
        );


        if (this.props.loggedUser.groupManager !== "") {

            const tableList = filteredCompanyData/*this.state.availableCompanies*/.map(e => {
                return (
                    <tr key={e.companyName}>
                        <td>{e.companyName}</td>
                        <td>{e.companyManager}</td>
                        <td>
                            {/*<div className="form-group custom-checkbox">*/}
                            {/*    <input type="checkbox" id={e.companyName}/>*/}
                            {/*    <label htmlFor={e.companyName}></label>*/}
                            {/*</div>*/}
                            <Link key={e.companyName} className="btn btn-success btn-outline-seconday" to="/divisions"
                                  onClick={() => {
                                      this.props.parentCallbackSelectActivePage("/divisions");
                                      this.props.parentCallbackSelectedCompany(e.companyName);
                                  }}>
                                GO
                            </Link>
                        </td>
                    </tr>
                );
            });

            const owlList = this.state.availableCompanies.map(e => {
                return (
                    <Link key={e.companyName} to="/divisions">
                        <div style={{display: "flex"}} className="item align-items-center justify-content-center mb-5"
                             onClick={() => {
                                 this.props.parentCallbackSelectActivePage("/divisions");
                                 this.props.parentCallbackSelectedCompany(e.companyName);
                             }}>
                            <div className="">
                                {/*<img src={this.companyToImageMapping[e]} alt={e}/>*/}
                                <img className="client-img" src={e.graphics} alt={e.companyName}/>
                            </div>
                            <h5 className="d-none">{e.companyName}</h5>
                        </div>
                    </Link>
                );
            });

            const testList = this.state.availableCompanies.map(e => {
                return (
                    <Link key={e.companyName} to="/divisions">
                        <div className="item" onClick={() => this.props.parentCallbackSelectedCompany(e.companyName)}>
                            <div className="">
                                <img src={e.graphics} alt={e.companyName}/>
                            </div>
                            <h5>{e.companyName}</h5>
                        </div>
                    </Link>
                );
            });

            const filler = (
                <>
                    <tr key="1">
                        <td colSpan={5} className="py-4">
                        </td>
                    </tr>
                    <tr key="2">
                        <td colSpan={5} className="py-4">
                        </td>
                    </tr>
                    <tr key="3">
                        <td colSpan={5} className="py-4">
                        </td>
                    </tr>
                    <tr key="4">
                        <td colSpan={5} className="py-4">
                        </td>
                    </tr>
                    <tr key="5">
                        <td colSpan={5} className="py-4">
                        </td>
                    </tr>
                    <tr key="6">
                        <td colSpan={5} className="py-4">
                        </td>
                    </tr>
                </>
            )

            return (
                <section id="content-wrapper" className="dashboard-section recent-client pt-10">
                    {/*<input type="button" value="refresh" onClick={() => this.update()}/>*/}
                    {/*<ul className="nav nav-tabs mb-30" id="myTab" role="tablist">*/}
                    {/*    <li className="nav-item">*/}
                    {/*        <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Recent Clients</a>*/}
                    {/*    </li>*/}
                    {/*    <li className="nav-item">*/}
                    {/*        <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Approvals</a>*/}
                    {/*    </li>*/}
                    {/*</ul>*/}
                    <div className="tab-content" id="myTabContent">
                        {/* -- Recent Clients -- */}
                        <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div>
                                <div className="row">
                                    <div className="col-lg-12">
                                        {
                                            testList.length > 0 ?
                                                <OwlCarousel items={testList.length > 4 ? 5 : testList.length}
                                                            className="owl-carousel owl-theme wow fadeInUp" autoplaySpeed={2000}
                                                            autoplayTimeout={3000} smartSpeed={300} autoplay={true}
                                                            dots={true} dotsEach={true} freeDrag={true} loop margin={20}>
                                                    {owlList}
                                                </OwlCarousel> :
                                                <></>
                                        }
                                        <form className="mt-4">
                                            <div className="form-group position-relative">
                                                <input type="email" className="form-control" placeholder="Search"
                                                    onChange={this.handleTextSearch}/>
                                                <i className="fa fa-search"></i>
                                            </div>
                                        </form>
                                        <div className="card">
                                            <div className="card-body py-0 pl-0">
                                                <div className="table-responsive">
                                                    <table className="table table-striped scroll mb-0">
                                                        <thead>
                                                        <tr>
                                                            <th>
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    Name
                                                                    <div onClick={this.sortAvailableClients}
                                                                        className="sort-name d-flex align-items-center">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12"
                                                                            height="12" viewBox="0 0 23.556 21.811">
                                                                            <path id="angle-down"
                                                                                d="M5409.753-149.089,5398.28-170.9h23.556Z"
                                                                                transform="translate(-5398.28 170.9)"
                                                                                fill="#fff"/>
                                                                        </svg>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-2"
                                                                            width="12" height="12" viewBox="0 0 23.556 21.811">
                                                                            <path id="angle-up"
                                                                                d="M5409.753-170.9l-11.473,21.811h23.556Z"
                                                                                transform="translate(-5398.28 170.9)"
                                                                                fill="#fff"/>
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </th>
                                                            <th>Company Manager</th>
                                                            <th>Select</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {tableList}
                                                        {filler}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* -- Approvals -- */}
                    {/*    <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">*/}
                    {/*        <div className="row">*/}
                    {/*            <div className="col-lg-12">*/}
                    {/*                <div className="card">*/}
                    {/*                    <div className="card-body py-0 pl-0 ">*/}
                    {/*                        <div className="table-responsive">*/}
                    {/*                            <table className="table table-striped scroll mb-0 approval-table">*/}
                    {/*                                <thead>*/}
                    {/*                                <tr className="table-row">*/}
                    {/*                                    <th>*/}
                    {/*                                        Developer Name*/}
                    {/*                                    </th>*/}
                    {/*                                    <th>*/}
                    {/*                                        Email*/}
                    {/*                                    </th>*/}
                    {/*                                    <th>*/}
                    {/*                                        Ip Blocks*/}
                    {/*                                    </th>*/}
                    {/*                                    <th>*/}
                    {/*                                        Action*/}
                    {/*                                    </th>*/}
                    {/*                                </tr>*/}
                    {/*                                </thead>*/}
                    {/*                                <tbody style={{height: "auto"}}>*/}
                    {/*                                    <tr>*/}
                    {/*                                        <td>Developer Name</td>*/}
                    {/*                                        <td>developer@gmail.com</td>*/}
                    {/*                                        <td>*/}
                    {/*                                            <div className="chip-container">*/}
                    {/*                                                <div className="">IpBlock1</div>*/}
                    {/*                                                <div className="ml-10">1.0</div>*/}
                    {/*                                                <div className="ml-10">12/9/2023 - 13/9/2023</div>*/}
                    {/*                                            </div>*/}
                    {/*                                            <div className="chip-container mt-7">*/}
                    {/*                                                <div className="">IpBlock1</div>*/}
                    {/*                                                <div className="ml-10">1.0</div>*/}
                    {/*                                                <div className="ml-10">12/9/2023 - 13/9/2023</div>*/}
                    {/*                                            </div>*/}
                    {/*                                            <div className="chip-container mt-7">*/}
                    {/*                                                <div className="">IpBlock1</div>*/}
                    {/*                                                <div className="ml-10">1.0</div>*/}
                    {/*                                                <div className="ml-10">12/9/2023 - 13/9/2023</div>*/}
                    {/*                                            </div>*/}
                    {/*                                        </td>*/}
                    {/*                                        <td>*/}
                    {/*                                            <div className="d-flex flex-column justify-content-start text-left">*/}
                    {/*                                                <button className="btn-transparent size-24">*/}
                    {/*                                                    <img className="svg-16" src="img/options.svg" /></button>*/}
                    {/*                                                <button className="btn-transparent mt-7 size-24">*/}
                    {/*                                                    <img className="svg-16" src="img/options.svg" /></button>*/}
                    {/*                                                <button className="btn-transparent mt-7 size-24">*/}
                    {/*                                                    <img className="svg-16" src="img/options.svg" /></button>*/}
                    {/*                                            </div>*/}
                    {/*                                        </td>*/}
                    {/*                                    </tr>*/}

                    {/*                                </tbody>*/}
                    {/*                            </table>*/}
                    {/*                        </div>*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}

                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    </div>

                </section>
            )
        }
    }

}
