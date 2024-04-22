import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import BackendRoutes from "../BackendRoutes";
import Toasts from "../components/Toasts";
import ModalPopup from "../components/ModalPopup";

interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
    callbackSelectCompany: (s: string) => void,
}

interface State {
    //TODO change to object with two fields
    // availableCompanies: {
    //     companyName: string,
    //     companyGraphicUrl: string,
    //     contractExists: boolean
    // }[],
    companyExists: boolean,
    groupExists: boolean,
    validationData: {
        allCompanies: string[],
        allGroups: string[],
    },
    formData: {
        companyName: string,
        companyManager: string,
        group: string,
        graphics: string,
        image: File | undefined,
    },
    isModalOpen: boolean,
}

export default class AdminScreen extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            // availableCompanies: [],
            groupExists: true, //should be true when we hardcode a group
            companyExists: false,
            validationData: {
                allCompanies: [],
                allGroups: [],
            },
            formData: {
                companyName: '',
                companyManager: '',
                group: "Codasip", //currently hardcoded value, will be changed in further versions
                graphics: "",
                image: undefined,
            },
            isModalOpen: false,
        }

        this.handleSubmitForm = this.handleSubmitForm.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

        document.title = `CMS - Create Company`;
    }

    async componentDidMount() {
        const allCompanies: string[] = await BackendRoutes.ROUTE_GET_COMPANIES()
            .then(e => e.data || []);

        const allGroups: string[] = await BackendRoutes.ROUTE_GET_GROUPS()
            .then(e => e.data || []);


        // const availableCompanies: {
        //     companyName: string,
        //     companyGraphicUrl: string,
        //     contractExists: boolean
        // }[] = await Promise.all(allCompanies.map(async company => {
        //     // const imageSrc = await BackendRoutes.ROUTE_GET_COMPANY_IMAGE(company).then(a => a.data);
        //
        //     const contractExists = await BackendRoutes.ROUTE_GET_CONTRACT_EXISTS(company);
        //
        //
        //     return {
        //         companyName: company,
        //         companyGraphicUrl: BackendRoutes.ROUTE_GET_COMPANY_ASSET(company),//BackendRoutes.ROUTE_ASSET_COMPANY(imageSrc),
        //         contractExists: contractExists.data
        //     }
        // }));


        this.setState({
            // availableCompanies: availableCompanies,
            companyExists: false,
            groupExists: true, //should be true when we hardcode a group
            validationData: {
                allCompanies: allCompanies,
                allGroups: allGroups,
            },
        })
    }

    async handleSubmitForm(event: any) {
        event.preventDefault();
        console.log("first", this.state.isModalOpen);
        this.setState({ isModalOpen: true }, () => {
            console.log("second", this.state.isModalOpen);
        });

        console.log("first", this.state.isModalOpen);

        this.toasts.createQuickToast("Saving...", "Saving new Client and cross referencing on the blockchain");

        const selectedImage: File = this.state.formData.image!;

        if (selectedImage.type.toLowerCase() !== "image/svg+xml") {
            alert("Image must be of type SVG");
            this.toasts.deleteQuickToast();
            return;
        }


        const formData = new FormData()

        //TODO make sure that this will always return correct file type (png, jpg etc)
        formData.append(selectedImage.type.split("/")[1], selectedImage);

        const result = await
            BackendRoutes.ROUTE_CREATE_COMPANY(
                this.state.formData.companyName,
                this.capitalizeWords(this.state.formData.companyManager),
                this.capitalizeWords(this.state.formData.group),
                formData
            );

        if (result.status === 200) {
            this.setState({ isModalOpen: false});
            this.toasts.createToast("Submit Successful", "You will be redirect shortyl");
            this.props.callbackSelectCompany(this.state.formData.companyName);

            await new Promise((e) => setInterval(e, 5000));
            window.location.href = '/';
        }

        this.toasts.deleteQuickToast();
    };

    handleInputChange(e: any) {
        const {name, value, type} = e.target;
        const newValue = type === 'file' ? e.target.files[0] : value;

        let groupExists = false;
        let companyExists = false;
        if (name === "group") {
            groupExists = !!this.state.validationData.allGroups.find(e => e.toLowerCase() === value.toLowerCase());
        } else if (name === "companyName") {
            companyExists = !!this.state.validationData.allCompanies.find(e => e.toLowerCase() === value.toLowerCase());
        }

        this.setState((prevState) => ({
            companyExists: companyExists,
            groupExists: groupExists,
            formData: {
                ...prevState.formData,
                [name]: newValue,
            },
        }));
    };

    // handleAddContract(company: string) {
    //     BackendRoutes.ROUTE_POST_ADD_CONTRACT(company)
    //         .then(() => this.componentDidMount())
    // }

    private toasts: Toasts = new Toasts(this);

    render() {
        const {formData} = this.state;
        return (
            <section id="content-wrapper" className="dashboard-section">
                <div>
                    <h2 style={{fontSize:"24px"}} className="mb-5">Add Companies</h2>
                    <form onSubmit={this.handleSubmitForm}>
                        <div className="row mb-4">
                            <label className="col-sm-3" htmlFor="companyName">Company Name:</label>
                            <input className="col-sm-6 rounded border-0"
                                type="text"
                                id="companyName"
                                name="companyName"
                                style={{height:"36px"}}
                                value={formData.companyName}
                                onChange={this.handleInputChange}
                                required
                            />
                            {
                                this.state.companyExists ?
                                    <label style={{color: "red"}} htmlFor="companyManager">Company Already Exists! You
                                        cannot add it</label> :
                                    <></>
                            }
                        </div>
                        <div className="row mb-4">
                            <label className="col-sm-3" htmlFor="companyManager">Company Manager:</label>
                            <input className="col-sm-6 rounded border-0"
                                type="text"
                                style={{height:"36px"}}
                                id="companyManager"
                                name="companyManager"
                                value={formData.companyManager}
                                onChange={this.handleInputChange}
                                required
                            />

                        </div>
                        <div className="row mb-4">
                            <label className="col-sm-3" htmlFor="group">Group:</label>
                            <div className="col-sm-6 p-0">
                                <input className="w-100 rounded border-0"
                                    disabled={true}
                                    type="text"
                                    id="group"
                                    style={{height:"36px"}}
                                    name="group"
                                    value={formData.group}
                                    onChange={this.handleInputChange}
                                    required
                                />
                                {
                                    this.state.groupExists ?
                                        <label style={{color: "green"}} htmlFor="grop">Group already exists, will append to
                                            it</label> :
                                        <label style={{color: "green"}} htmlFor="grop">Group doesn't exists, will create
                                            new</label>
                                }
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-sm-3" htmlFor="image">Company Logo:</label>
                            <input className="col-sm-6 rounded border-0 p-0"
                                type="file"
                                id="image"
                                style={{height:"36px"}}
                                name="image"
                                accept="image/*"
                                onChange={this.handleInputChange}
                                required
                            />
                        </div>
                        <button style={{height:"36px"}} className="form-btn btn btn-dark btn-hover mt-2" type="submit">Add</button>
                    </form>
                    {this.toasts.container()}
                    {this.state.isModalOpen && <ModalPopup show={this.state.isModalOpen}
                                                onHide={() => this.setState({ isModalOpen: false})}/>}
                    <br/>

                    {/*<h2>Available Companies</h2>*/}
                    {/*<ul>*/}
                    {/*    {this.state.availableCompanies.map(e =>*/}
                    {/*        <li>*/}
                    {/*            <span>{e.companyName}</span>*/}
                    {/*            <img width="50px" height="50px" src={e.companyGraphicUrl} alt=""/>*/}
                    {/*            {!e.contractExists &&*/}
                    {/*                <button onClick={() => this.handleAddContract(e.companyName)}>Add Contract</button>*/}
                    {/*            }*/}
                    {/*        </li>*/}
                    {/*    )}*/}
                    {/*</ul>*/}
                    <br/>
                    <br/>
                    <br/>
                </div>
            </section>
        );
    }

    private capitalizeWords(input: string): string {
        const words = input.split(' ');

        const capitalizedWords = words.map(word => {
            if (word.length === 0) {
                return '';
            } else {
                const firstLetter = word[0].toUpperCase();
                const restOfWord = word.slice(1).toLowerCase();
                return firstLetter + restOfWord;
            }
        });
        return capitalizedWords.join(' ');
    }
}
