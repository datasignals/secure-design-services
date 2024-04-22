import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import User from "../common/User";
import BackendRoutes from "../BackendRoutes";
import Toasts from "../components/Toasts";
import LoggedUser from "../common/LoggedUser";
import WarningScreen from "../components/WarningScreen";
import Popup from "../components/Popup";
import ModalPopup from "../components/ModalPopup";

enum Data {
    USERNAME,
    ROLE,
    REGION,
    EMAIL
}

interface MaintainPeopleProps {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
    selectedCompany: string,
    loggedUser: LoggedUser,
    parentCallbackPageIsDirty: (b: boolean) => void,
}

interface MaintainPeopleState {
    existingUsers: User[];
    newUsers: User[];
    editUserOldData: User;

    keycloakUsers: UserRepresentation[];
    toasts: Toasts,
    dropdownOptions: {
        availableDivisions: string[],
        "availableRoles": string[]
    },
    divisionsExist: boolean | undefined,
    isModalOpen: boolean,
}

export default class MaintainPeopleScreen extends Component<MaintainPeopleProps, MaintainPeopleState> {

    //TODO improve to be more dynamic
    // this is hardcoded and doesn't work well on all screens
    private readonly tableHeadStyle = {
        width: "255.483px"
    }

    /**
     * Elements used for Rendering
     * @private
     */
    private TABLE_ELEMENTS = {
        //Head of the table with description
        tableHead: (
            <>
                <th style={this.tableHeadStyle}>
                    Name
                </th>
                <th style={this.tableHeadStyle}>
                    Role
                </th>
                <th style={this.tableHeadStyle}>
                    Division {/*TODO as a data this is still refered as role */}
                </th>
                <th style={this.tableHeadStyle}>
                    Email
                </th>
            </>
        ),
        //Table filling for styling
        contentFillerRows: Array.from({length: 30}).map(e =>
            (
                <tr>
                    <td colSpan={5} className="py-4">
                    </td>
                </tr>
            )
        ),
        existingUsersElements: (existingUsers: User[]) => existingUsers.map((user, i) => {
                if (user.canEdit) {
                    return (
                        <tr key={i} className="form-container">
                            <Popup ipBlocks={user.purchasedIpBlocks!}/>
                            <td>
                                <input type="text" value={user.username}
                                       onInput={(a) => this.handleChangeExistingUser(a, i, Data.USERNAME)}/>
                            </td>
                            <td>
                                <input type="text" value={user.role}
                                       onInput={(a) => this.handleChangeExistingUser(a, i, Data.ROLE)}/>
                                {this.renderWarningTextTooShort(user.role, "Role is too short")}
                            </td>
                            <td>
                                <input type="text" value={user.region}
                                       onInput={(a) => this.handleChangeExistingUser(a, i, Data.REGION)}/>
                                {this.renderWarningTextTooShort(user.region, "Region is too short")}
                            </td>
                            <td>
                                <input type="text" value={user.email}
                                       onInput={(a) => this.handleChangeExistingUser(a, i, Data.EMAIL)}/>
                                {this.renderWarningTextTooShort(user.email, "Email is too short")}
                            </td>
                            <td width="50" className="d-flex justify-content-between">
                                <button disabled={true} className="form-btn btn btn-dark btn-hover"
                                        onClick={() => this.handleEditExistingUser(i)}>
                                    <img className="delete-row" width="14" height="14" src="img/tickActive.svg"
                                         alt="delete"/>
                                </button>
                                <button disabled={true} className="ml-2 form-btn btn btn-dark btn-hover"
                                        onClick={() => this.editRow(i, false)}>
                                    <img className="delete-row" width="14" height="14" src="img/close.png" alt="delete"/>
                                </button>
                            </td>
                        </tr>
                    )
                } else {
                    return (
                        <tr key={i} className={user.toDelete ? "bg-danger form-container view" : "form-container view"}>
                            <Popup ipBlocks={user.purchasedIpBlocks!}>
                                <td>
                                    {user.username}
                                </td>
                            </Popup>
                            <td>
                                {user.role}
                            </td>
                            <td>
                                {user.region}
                            </td>
                            <td>
                                {user.email}
                            </td>
                            <td width="50" className="d-flex justify-content-between">
                                <button disabled={true} className="form-btn btn btn-dark btn-hover"
                                        onClick={() => this.deleteRow(i, "existing")}>
                                    <img className="delete-row" src="img/delete.svg" alt="delete"/>
                                </button>
                                <button disabled={true} className="ml-2 form-btn btn btn-dark btn-hover"
                                        onClick={() => this.editRow(i, true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 27 27.007">
                                        <path id="Icon_ionic-ios-settings" data-name="Icon ionic-ios-settings"
                                              d="M29.271,18A3.474,3.474,0,0,1,31.5,14.759a13.772,13.772,0,0,0-1.666-4.015,3.521,3.521,0,0,1-1.413.3,3.467,3.467,0,0,1-3.171-4.88A13.73,13.73,0,0,0,21.241,4.5a3.471,3.471,0,0,1-6.483,0,13.772,13.772,0,0,0-4.015,1.666,3.467,3.467,0,0,1-3.171,4.88,3.406,3.406,0,0,1-1.413-.3A14.076,14.076,0,0,0,4.5,14.766a3.473,3.473,0,0,1,.007,6.483,13.772,13.772,0,0,0,1.666,4.015,3.468,3.468,0,0,1,4.577,4.577,13.852,13.852,0,0,0,4.015,1.666,3.465,3.465,0,0,1,6.469,0,13.772,13.772,0,0,0,4.015-1.666,3.472,3.472,0,0,1,4.577-4.577,13.852,13.852,0,0,0,1.666-4.015A3.491,3.491,0,0,1,29.271,18ZM18.063,23.618a5.625,5.625,0,1,1,5.625-5.625A5.623,5.623,0,0,1,18.063,23.618Z"
                                              transform="translate(-4.5 -4.5)" fill="#fff"/>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    )
                }

            }
        ),
        newUserElements: (newUsers: User[]) => newUsers.map((user, i) =>
            <tr key={i} className="form-container">
                <td>
                    <input type="text" value={user.username}
                           onInput={(a) => this.handleChange(a, i, Data.USERNAME)}/>
                    {this.renderWarningTextTooShort(user.username, "Username is too short")}
                    {this.renderWarningUserAlreadyExists(user.username, "Username already exists")}
                    {this.renderWarningUsernameHasNumbers(user.username, "Username has numbers")}
                </td>
                <td>
                    {/*<input type="text" value={user.role} onInput={(a) => this.handleChange(a, i, Data.ROLE)}/>*/}
                    <select name="roles" onChange={(a) => this.handleChange(a, i, Data.ROLE)}>
                        {this.state.dropdownOptions.availableRoles.map(option => <option
                            value={option}>{option}</option>)}
                    </select>
                    {/*{this.renderWarningTextTooShort(user.role, "Role is too short")}*/}
                </td>
                <td>
                    {/*<input type="text" value={user.region} onInput={(a) => this.handleChange(a, i, Data.REGION)}/>*/}
                    <select name="regions" onChange={(a) => this.handleChange(a, i, Data.REGION)}>
                        {this.state.dropdownOptions.availableDivisions.map(option => <option
                            value={option}>{option}</option>)}
                    </select>
                    {/*{this.renderWarningTextTooShort(user.region, "Region is too short")}*/}
                </td>
                <td>
                    <input type="text" value={user.email} onInput={(a) => this.handleChange(a, i, Data.EMAIL)}/>
                    {this.renderWarningTextTooShort(user.email, "Email is too short")}
                    {this.renderWarningEmailAlreadyExists(user.email, "Email already exists")}
                    {this.renderWarningEmailIsNotValid(user.email, "Email is not valid")}
                </td>
                <td width="50" className="d-flex justify-content-between">
                    <button className="form-btn btn btn-dark btn-hover" onClick={() => this.deleteRow(i, "new")}>
                        <img className="delete-row" src="img/delete.svg" alt="delete"/>
                    </button>
                    {/*<button className="btn btn-dark btn-outline-success" onClick={() => this.editRow(i, true)}>*/}
                    {/*    <img width="20" src="img/settings.png" alt="delete"/>*/}
                    {/*</button>*/}
                </td>
            </tr>
        ),
        entireTable: (existingUsers: User[], newUsers: User[]) => (
            <>
                <section id="content-wrapper" className="dashboard-section">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card activity-block">
                                <div className="card-body py-0 pl-0 ">
                                    <div className="table-responsive">

                                        <table className="table table-striped scroll mb-0">

                                            {this.state.toasts.container()}


                                            <thead>
                                            <tr>
                                                {this.TABLE_ELEMENTS.tableHead}
                                            </tr>
                                            </thead>
                                            <tbody>

                                            {this.TABLE_ELEMENTS.existingUsersElements(existingUsers)}

                                            {this.TABLE_ELEMENTS.newUserElements(newUsers)}

                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="d-flex justify-content-between">
                                                        <a className="text-success" onClick={() => this.addRow()}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                 height="24"
                                                                 viewBox="0 0 50.921 38">
                                                                <path id="user"
                                                                      d="M14.19,38V31.5s6.849-8.11,18.1-7.87A28.937,28.937,0,0,1,50.921,31.5V38ZM7,26V19H0V14H7V7h5v7h7v5H12v7ZM23,9.5A9.5,9.5,0,1,1,32.5,19,9.5,9.5,0,0,1,23,9.5Z"
                                                                      fill="#fff"/>
                                                            </svg>
                                                            Add people
                                                        </a>
                                                        <a className="btn btn-outline-secondary"
                                                           onClick={this.handleSubmit}>Save</a>
                                                    </div>
                                                </td>
                                            </tr>

                                            {this.TABLE_ELEMENTS.contentFillerRows}
                                            </tbody>
                                        </table>
                                    </div>

                                    <a className="text-success d-block text-right px-4 py-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                             viewBox="0 0 50.921 38">
                                            <path id="user"
                                                  d="M14.19,38V31.5s6.849-8.11,18.1-7.87A28.937,28.937,0,0,1,50.921,31.5V38ZM7,26V19H0V14H7V7h5v7h7v5H12v7ZM23,9.5A9.5,9.5,0,1,1,32.5,19,9.5,9.5,0,0,1,23,9.5Z"
                                                  fill="#fff"/>
                                        </svg>
                                        Import
                                        from
                                        Database
                                    </a>
                                </div>
                            </div>

                            {this.state.isModalOpen && <ModalPopup show={this.state.isModalOpen}
                                                                   onHide={() => this.setState({isModalOpen: false})}/>}

                        </div>
                    </div>
                </section>
            </>
        )
    }


    constructor(props: MaintainPeopleProps) {
        super(props);

        this.state = {
            newUsers: [],
            existingUsers: [],
            keycloakUsers: [],
            editUserOldData: {
                username: "",
                region: "",
                company: "",
                email: "",
                role: ""
            },
            toasts: new Toasts(this),
            dropdownOptions: {
                availableDivisions: [],
                availableRoles: []
            },
            divisionsExist: undefined,
            isModalOpen: false,
        };

        this.addRow = this.addRow.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);


        document.title = `CMS - Maintain Designers`;
    }


    async componentDidMount() {


        const available = "../"
        const availableRoles: string[] = await BackendRoutes.ROUTE_GET_AVAILABLE_ROLES()
            .then(e => e.data)
            .catch(() => []);

        const availableDivisions: string[] = await BackendRoutes.ROUTE_GET_EXISTING_DIVISIONS(this.props.selectedCompany)
            .then(e => e.data)
            .catch(() => []);

        const divisionsExists: boolean = await BackendRoutes.ROUTE_GET_EXISTING_DIVISIONS(this.props.selectedCompany)
            .then(e => e.data.length > 0)
            .catch(() => false)


        this.setState({
            dropdownOptions: {
                availableDivisions: availableDivisions,
                availableRoles: availableRoles,
            },
            divisionsExist: divisionsExists
        });

        const allUsersFetch = await BackendRoutes.ROUTE_LIST_USERS(this.props.selectedCompany);
        if (allUsersFetch.status === 200) {

            const allUsers: User[] = [];

            for await(const user of allUsersFetch.data as User[]) {
                // const purchasedIpBlocks: IpBlock[] = await BackendRoutes.ROUTE_GET_USERS_IPBLOCKS(user.username, this.props.selectedCompany)
                //     .then(e => e.data)
                //     .catch(() => []);

                allUsers.push({
                    ...user,
                    canEdit: false,
                    // purchasedIpBlocks: purchasedIpBlocks
                });
            }


            // const allUsers: User[] = await allUsersFetch.data.map((user: User) => ({
            //     ...user,
            //     canEdit: false,
            //     purchasedIpBlocks: [{
            //         ipblockName: "test",
            //         ipblockVersion: "test version",
            //         blockchainHash: "some hash"
            //     }]
            //     // purchasedIpBlocks: await BackendRoutes.ROUTE_GET_USERS_IPBLOCKS(user.username, this.props.selectedCompany)
            // }));

            this.setState({keycloakUsers: allUsers, existingUsers: allUsers})
        } else {
            this.state.toasts.createToast("DEBUG", "Failed to fetch, code: " + allUsersFetch.statusText);
        }

    }


    handleChangeExistingUser(event: any, index: number, dataType: Data) {
        this.props.parentCallbackPageIsDirty(true);

        const model: User[] = this.state.existingUsers;

        const row = model[index];

        if (dataType === Data.USERNAME) {
            row.username = event.target.value
        } else if (dataType === Data.ROLE) {
            row.role = event.target.value
        } else if (dataType === Data.REGION) {
            row.region = event.target.value
        } else if (dataType === Data.EMAIL) {
            row.email = event.target.value;
        }

        model[index] = row;
        this.setState({existingUsers: model});
    }

    handleChange(event: any, index: number, dataType: Data) {
        this.props.parentCallbackPageIsDirty(true);


        const model: User[] = this.state.newUsers;

        const row = model[index];

        if (dataType === Data.USERNAME) {
            row.username = event.target.value
        } else if (dataType === Data.ROLE) {
            row.role = event.target.value
        } else if (dataType === Data.REGION) {
            row.region = event.target.value
        } else if (dataType === Data.EMAIL) {
            row.email = event.target.value;
        }

        model[index] = row;
        this.setState({newUsers: model});
    }

    async handleEditExistingUser(row: number) {
        this.props.parentCallbackPageIsDirty(true);

        const user = this.state.existingUsers[row];

        const result = await BackendRoutes.ROUTE_EDIT_EXISTING_USER(
            this.state.editUserOldData.username,
            this.state.editUserOldData.email,
            // this.state.editUserOldData.role,
            // this.state.editUserOldData.region,
            user.username.toString(),
            user.email.toString(),
            // user.role.toString(),
            user.region.toString()
        );
        if (result.data === true) {
            this.state.toasts.createToast("Success", "Edited user successfully!")
        } else {
            this.state.toasts.createToast("Failure", "Failed to edit user details")
        }

        const users = this.state.existingUsers;
        users.forEach(user => user.canEdit = false);
        this.setState({existingUsers: users});

        this.cleanTable();
        await this.componentDidMount();
    }

    async handleSubmit(event: any) {
        event.preventDefault();
        console.log("first", this.state.isModalOpen);
        this.setState({isModalOpen: true}, () => {
            console.log("second", this.state.isModalOpen);
        });

        this.state.toasts.createQuickToast("Saving...", "Saving new Designer and cross referencing on the blockchain");

        let allPassed = true;
        for (const e of this.state.newUsers) {
            const res = await this.validateFields(e);

            if (res.emailExists) {
                allPassed = false;
                this.state.toasts.createToast("Failure", "Email already exists for: " + e.email);
            } else if (res.nameExists) {
                allPassed = false;
                this.state.toasts.createToast("Failure", "Name already exists for: " + e.username);
            } else if (!res.emailIsValid) {
                allPassed = false;
                this.state.toasts.createToast("Failure", "Email: " + e.email + " is not valid email!");
            } else if(res.usernameHasNumbers)  {
                allPassed = false;
                this.state.toasts.createToast("Failure", "Username: " + e.username + " must not contain number!");
            }
            else if (!res.emailExists && !res.nameExists && res.allFieldsFilled && !res.usernameHasNumbers) {
                const createUserPassed = await BackendRoutes.ROUTE_CREATE_USER(
                    e.username,
                    e.email,
                    e.region,
                    e.role,
                    e.company,
                    this.UNSAFEGenerateUniqueIdentifier(),
                    this.props.loggedUser.groupManager
                ).then(e => e.status === 200);
                if (!createUserPassed) {
                    allPassed = false;
                    this.state.toasts.createToast("Failure", "Failed to Create User: " + e.username);
                }
            } else {
                allPassed = false;
                this.state.toasts.createToast("Failure", "Something went wrong");
            }
        }

        if (allPassed) {
            this.state.toasts.createToast("Success", "Submitted Users Successfully!");
        } else {
            this.state.toasts.createToast("Failure", "Failed to submit Users!");
        }



        ///Delete User Bit
        for (const userToDelete of this.state.existingUsers.filter(e => e.toDelete === true)) {
            const res = await BackendRoutes.ROUTE_DELETE_USER(userToDelete.username, userToDelete.email);

            if (res.status !== 200) {
                this.state.toasts.createToast("Failure", `Something went wrong when trying to remove user ${userToDelete.username}`);
            }
        }

        this.setState({isModalOpen: false});
        this.cleanTable();
        this.props.parentCallbackPageIsDirty(false);
        this.state.toasts.deleteQuickToast();
        await this.componentDidMount();
    }

    //TODO I consider it unsafe as it should not be visible in the frontend
    // for testing only
    UNSAFEGenerateUniqueIdentifier() {
        // Generate a random UUID
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';

        for (let i = 0; i < 32; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomIndex);
        }
        return randomString

        // return crypto.randomUUID();
    }

    async validateFields(user: User): Promise<{
        nameExists: boolean,
        emailExists: boolean,
        emailIsValid: boolean,
        usernameHasNumbers: boolean,
        allFieldsFilled: boolean
    }> {
        const nameExists = await BackendRoutes.ROUTE_FIND_USERNAME(user.username).then(e => e.status === 200);
        const emailExists = await BackendRoutes.ROUTE_FIND_EMAIL(user.email).then(e => e.status === 200);

        const usernameHasNumbers = /\d/.test(user.username);

        return ({
            nameExists: nameExists,
            emailExists: emailExists,
            emailIsValid: this.emailIsValid(user.email),
            usernameHasNumbers: usernameHasNumbers,
            allFieldsFilled: (
                user.username !== undefined &&
                user.role !== undefined &&
                user.region !== undefined &&
                user.email !== undefined
            )
        });
    }

    addRow() {
        this.props.parentCallbackPageIsDirty(true);

        if (this.props.selectedCompany) {
            const data: User = {
                username: "",
                company: this.props.selectedCompany,
                role: this.state.dropdownOptions.availableRoles[0], //TODO make sure this will not break the code
                region: this.state.dropdownOptions.availableDivisions[0], //todo there are no regions, but divisions now
                email: ""
            };

            this.state.newUsers.push(data)

            this.setState({newUsers: this.state.newUsers});
        } else {
            this.state.toasts.createToast("Failure", "Failed to add row, company is not selected");
        }
    }

    cleanTable() {
        this.setState({newUsers: []});
    }

    deleteRow(index: number, type: "existing" | "new") {
        this.props.parentCallbackPageIsDirty(true);

        if (type === "existing") {
            const update = this.state.existingUsers;
            update[index].toDelete = !update[index].toDelete;
            this.setState({existingUsers: update});
        } else if (type === "new") {
            this.state.newUsers.splice(index, 1);
            this.setState({newUsers: this.state.newUsers});
        }
    }

    editRow(index: number, edit: boolean) {
        this.props.parentCallbackPageIsDirty(true);

        const update = this.state.existingUsers;
        const userOldData: User = {
            username: update[index].username,
            email: update[index].email,
            region: update[index].region,
            company: update[index].company,
            role: update[index].role
        }


        update.forEach(user => user.canEdit = false);
        update[index].canEdit = edit;//!update[index].canEdit;
        this.setState({existingUsers: update, editUserOldData: userOldData});
    }

    renderWarningTextTooShort(data: string, msg: string) {
        if (data.length < 6 && data.length > 0) {
            return (
                <p className="text-white mt-1 mb-0">{msg}</p>
            )
        } else return undefined
    }

    renderWarningUsernameHasNumbers(data: string, msg: string) {
        if (/\d/.test(data)) {
            return (
                <p className="text-white mt-1 mb-0">{msg}</p>
            )
        } else return undefined
    }

    renderWarningUserAlreadyExists(data: string, msg: string) {
        if (data.length < 1) {
            return
        }
        const keycloakUsers = this.state.keycloakUsers;
        if (keycloakUsers === undefined) return (<p>Loading Data...</p>);

        const res = keycloakUsers.find(e => e.username === data);

        if (res === undefined) {
            return (<></>);
        } else {
            return (<p className="text-white mt-1 mb-0">{msg}</p>);
        }
    }

    renderWarningEmailAlreadyExists(data: string, msg: string) {
        if (data.length < 1) {
            return
        }
        const keycloakUsers = this.state.keycloakUsers;
        if (keycloakUsers === undefined) return (<p>Loading Data...</p>);

        const res = keycloakUsers.find(e => e.email === data);

        if (res === undefined) {
            return (<></>);
        } else {
            return (<p className="text-white mt-1 mb-0">{msg}</p>);
        }
    }

    renderWarningEmailIsNotValid(data: string, msg: string) {
        if (data.length < 1) {
            return
        }
        const keycloakUsers = this.state.keycloakUsers;
        if (keycloakUsers === undefined) return (<p>Loading Data...</p>);

        const res = this.emailIsValid(data);

        if (res) {
            return (<></>);
        } else {
            return (<p className="text-white mt-1 mb-0">{msg}</p>);
        }
    }

    emailIsValid(email: string) {
        //Regex from: https://emailregex.com/
        const res = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.exec(email);
        return res !== null;
    }


    render() {
        if (this.state.divisionsExist === undefined) {
            return <WarningScreen title="Loading" message="Please Wait..."/>
        } else if (this.state.divisionsExist === false) {
            return <WarningScreen title="No Divisions" message="You need to add at least one Division first"/>
        } else if (this.state.divisionsExist === true) {
            return this.TABLE_ELEMENTS.entireTable(this.state.existingUsers, this.state.newUsers);
        }
    }
}
