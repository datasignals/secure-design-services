import {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import BackendRoutes from "../BackendRoutes";
import Toasts from "../components/Toasts";

interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null | undefined;
}

interface State {
    formData: {
        fullName: string,
        email: string,
        phoneNumber: string,
        yearsOfExperience: string,
        password: string,
        repeatPassword: string
        companyName: string,
        division: string,
        showModal: boolean,
    },
}

export default class RegistrationScreen extends Component<Props, State> {
    private toasts: Toasts = new Toasts(this);

    constructor(props: Props) {
        super(props);
        this.state = {
            formData: {
                fullName: "",
                email: "",
                phoneNumber: "",
                yearsOfExperience: "",
                password: "",
                repeatPassword: "",
                companyName: "",
                division: "EU",
                showModal: false,
                // image: undefined
            }
        }
        this.handleSubmitForm = this.handleSubmitForm.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    renderWarning(data: string, msg: string, evaluate: (data: string) => boolean) {
        if (data.length !== 0 && evaluate(data)) {
            return (
                <p style={{color: "red"}} className="mt-1 mb-0">{msg}</p>
            )
        } else return undefined
    }

    async handleSubmitForm(event: any) {
        event.preventDefault();

        const userAlreadyExistsPromise = BackendRoutes.ROUTE_FIND_USERNAME(this.state.formData.fullName)
            .then(e => e.status === 200)
            .catch(() => true)

        const emailAlreadyExistsPromise = BackendRoutes.ROUTE_FIND_EMAIL(this.state.formData.email)
            .then(e => e.status === 200)
            .catch(() => true);

        const arePasswordsMatching = this.state.formData.password === this.state.formData.repeatPassword;
        const isPasswordLong = this.state.formData.password.length > 7;
        const doesPasswordContainCapital = /[A-Z]/.test(this.state.formData.password);
        const doesPasswordContainSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(this.state.formData.password);
        const isEmailCorrect = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.state.formData.email);

        if (!arePasswordsMatching) {
            this.toasts.createToast("Warning", "Passwords aren't matching");
            return false;
        }

        if (!isPasswordLong) {
            this.toasts.createToast("Warning", "Password's too short, it needs at least 8 characters");
            return false;
        }

        if (!doesPasswordContainCapital) {
            this.toasts.createToast("Warning", "Password must contain at least one capital letter");
            return false;
        }

        if (!doesPasswordContainSpecialCharacter) {
            this.toasts.createToast("Warning", "Password must contain at least one special character");
            return false;
        }

        if (!isEmailCorrect) {
            this.toasts.createToast("Warning", "Email is incorrect, please revise");
            return false;
        }


        const [userAlreadyExists, emailAlreadyExists] = await Promise.all([userAlreadyExistsPromise, emailAlreadyExistsPromise])

        if (userAlreadyExists) {
            this.toasts.createToast("Warning", "Username already exists, please use another one");
            return false;
        }

        if (emailAlreadyExists) {
            this.toasts.createToast("Warning", "Email already exists, please use another one");
            return false;
        }


        const z = await BackendRoutes.ROUTE_CREATE_INDIE_USER(this.state.formData.fullName, this.state.formData.division, this.state.formData.email, this.state.formData.password);

        if (z.status === 200) {
            //TODO add varaible for the address to connect to
            this.toasts.createToast("Success", "Thank you for registration, the process is complete, please use your full name and password to login at securedesignrservices.com");
        } else {
            this.toasts.createToast("Failure", "Registration has failed, reason: " + z.statusText);
        }
    };

    handleInputChange(e: any) {
        const {name, value, type} = e.target;

        const newValue = type === 'file' ? e.target.files[0] : value;

        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: newValue,
            },
        }))

    };

    public toggleForm(form: string) {
        console.log("form", form);
        const register = document.getElementById('register-form');
        const login = document.getElementById('login-form');
        if (form === 'register') {
            console.log("register");
            register?.classList.add('hide');
            register?.classList.remove('d-flex');
            login?.classList.remove('hide');
            login?.classList.add('d-flex');
        } else {
            console.log("login");
            register?.classList.add('d-flex');
            register?.classList.remove('hide');
            login?.classList.remove('d-flex');
            login?.classList.add('hide');
        }
    }

    render() {

        return (
            <div>
                <div id="registration" className="vh-100">
                    <div className="row vh-100">
                        <div className="register-content col-md-7 p-0 h-100">
                            <div
                                className="primaryBg h-100 p-50 d-flex align-items-center flex-column justify-content-center">
                                <img className="w-100" src="img/login_image.png" alt="login-bg"/>
                                <div className="w-100 text-left text-32 text-white uppercase mt-50">BUILD, CREATE,
                                    SELL
                                </div>
                                <div className="w-100 text-left text-32 text-white uppercase mt-10">YOUR COMPLETE CHIP
                                    DESIGN ECOSYSTEM
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-5 h-100 p-0">
                            <div id="register-form"
                                 className="h-100 p-50 d-flex align-items-center justify-content-center flex-column">
                                <div className="text-center w-100 mb-4">Register</div>
                                {this.toasts.container()}
                                <form className="w-100" onSubmit={this.handleSubmitForm}>
                                    <div className="row">
                                        <div className="col-12 mb-3">
                                            <label className="w-100 text-12" htmlFor="fullName">Full Name</label>
                                            <input className="w-100"
                                                   type="text"
                                                   id="fullName"
                                                   name="fullName"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required/>
                                            {this.renderWarning(
                                                this.state.formData.fullName,
                                                "Full Name needs to be at least 6 characters",
                                                (s: string) => s.length < 6
                                            )}
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="w-100 text-12" htmlFor="email">Email</label>
                                            <input className="w-100 rounded"
                                                   type="email"
                                                   id="email"
                                                   name="email"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required/>
                                            {this.renderWarning(
                                                this.state.formData.email,
                                                "Email is not valid",
                                                (s: string) => !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(s)
                                            )}
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="w-100 text-12" htmlFor="yearsOfExperience">Years of
                                                Experience</label>
                                            <input className="w-100 rounded"
                                                   type="number"
                                                   id="yearsOfExperience"
                                                   name="yearsOfExperience"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required
                                            />
                                            {this.renderWarning(
                                                this.state.formData.yearsOfExperience,
                                                "Please put a number of years between 0-99",
                                                (s: string) => s.length > 2 || s.length === 0
                                            )}
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="w-100 text-12" htmlFor="phoneNumber">Phone Number</label>
                                            <input className="w-100 rounded"
                                                   type="number"
                                                   id="phoneNumber"
                                                   name="phoneNumber"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required
                                            />
                                            {this.renderWarning(
                                                this.state.formData.phoneNumber,
                                                "Please put a valid telephone number",
                                                (s: string) => s.length < 8 || s.length > 12
                                            )}
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="w-100 text-12" htmlFor="division">Division</label>
                                            <select className="w-100"
                                                    value={this.state.formData.division}
                                                    defaultValue={"EU"}
                                                    name="division"
                                                    style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                    onChange={this.handleInputChange}>
                                                <option>EU</option>
                                                <option>NA</option>
                                                <option>APAC</option>
                                                <option>LATAM</option>
                                                <option>INTL</option>
                                                <option>EM</option>
                                                <option>MEA</option>
                                            </select>
                                            {this.renderWarning(
                                                this.state.formData.division,
                                                "Please select a valid division",
                                                (s: string) => s.length === 0
                                            )}
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="w-100 text-12" htmlFor="password">Password</label>
                                            <input className="w-100 rounded"
                                                   type="password"
                                                   id="password"
                                                   name="password"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required/>
                                            {this.renderWarning(
                                                this.state.formData.division,
                                                "Passwords must be matching",
                                                () => this.state.formData.password !== this.state.formData.repeatPassword
                                            )}
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="w-100 text-12" htmlFor="password">Repeat Password</label>
                                            <input className="w-100 rounded"
                                                   type="password"
                                                   id="repeatPassword"
                                                   name="repeatPassword"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required
                                            />
                                        </div>
                                        <div className="col-12">
                                            <button style={{height: "36px"}}
                                                    className="w-100 align-items-center justify-content-center primaryBg border-0 rounded text-white"
                                                    type="submit">Register
                                            </button>
                                            <div className="modal fade z-9999" id="dateRangeModal" role="dialog"
                                                 aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                                <div className="modal-dialog modal-dialog-centered" role="document">
                                                    <div className="modal-content"
                                                         style={{background: "#ffffff", borderRadius: "10px", padding: "30px"}}>
                                                        <div className="modal-body">
                                                            <div className="text-24 text-center">Your account has been
                                                                registred successfully!
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="d-flex align-items-center justify-content-center w-100 mt-10">
                                                            <button type="button"
                                                                    className="text-white px-4 py-2 primaryBg rounded-7 border-0"
                                                                    data-dismiss="modal" aria-label="Close">
                                                                <span className="text-white"
                                                                      aria-hidden="true">Continue</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div
                                    className="w-100 d-flex align-items-center mt-30 justify-content-center flex-column">
                                    <div className="text-12 mb-1">Already have an account?</div>
                                    <div onClick={() => this.toggleForm('register')}
                                         className="primaryText cursor-pointer uppercase">Login
                                    </div>
                                </div>
                            </div>
                            <div id="login-form"
                                 className="hide h-100 p-50 align-items-center justify-content-center flex-column">
                                <div className="text-center w-100 mb-4">Login</div>
                                {this.toasts.container()}
                                <form className="w-100" onSubmit={this.handleSubmitForm}>
                                    <div className="row">
                                        <div className="col-12 mb-4">
                                            <label className="w-100 text-12" htmlFor="l-email">Email</label>
                                            <input className="w-100"
                                                   type="emaill"
                                                   id="l-email"
                                                   name="email"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required/>
                                        </div>
                                        <div className="col-12 mb-4">
                                            <label className="w-100 text-12" htmlFor="l-password">Password</label>
                                            <input className="w-100 rounded"
                                                   type="passwprd"
                                                   id="l-password"
                                                   name="password"
                                                   style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                   onChange={this.handleInputChange}
                                                   required/>
                                        </div>
                                        <div className="col-12">
                                            <button style={{height: "36px"}}
                                                    className="w-100 align-items-center justify-content-center primaryBg border-0 rounded text-white"
                                                    type="submit">Login
                                            </button>
                                        </div>
                                    </div>
                                </form>
                                <div
                                    className="w-100 d-flex align-items-center mt-30 justify-content-center flex-column">
                                    <div className="text-12 mb-1">Don't have an account?</div>
                                    <div onClick={() => this.toggleForm('login')}
                                         className="primaryText cursor-pointer uppercase">Register
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }

}
