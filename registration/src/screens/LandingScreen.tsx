import {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import BackendRoutes from "../BackendRoutes";
import config from "../config.json";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Toasts from "../components/Toasts";
import Spinner from 'react-bootstrap/Spinner';

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
    },
    spin: boolean
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
                division: "",
                // image: undefined
            },
            spin: false
        }
        this.handleSubmitForm = this.handleSubmitForm.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }


    toastMessage (type : string, msg : string) {
        this.setState({ spin : false});
        this.toasts.createToast(type, msg);
    }

    async handleSubmitForm(event: any) {
        event.preventDefault();
        this.setState({ spin : true});

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
        const usernameContainsNumbers = /\d/.test(this.state.formData.fullName);

        if (usernameContainsNumbers) {
            this.toastMessage("Warning", "Your name cannot contain numbers");
            return;
        }

        if (!arePasswordsMatching) {
            this.toastMessage("Warning", "Passwords aren't matching");
            return;
        }

        if (!isPasswordLong) {
            this.toastMessage("Warning", "Password's too short, it needs at least 8 characters");
            return;
        }

        if (!doesPasswordContainCapital) {
            this.toastMessage("Warning", "Password must contain at least one capital letter");
            return;
        }

        if (!doesPasswordContainSpecialCharacter) {
            this.toastMessage("Warning", "Password must contain at least one special character");
            return;
        }

        if (!isEmailCorrect) {
            this.toastMessage("Warning", "Email is incorrect, please revise");
            return;
        }


        const [userAlreadyExists, emailAlreadyExists] = await Promise.all([userAlreadyExistsPromise, emailAlreadyExistsPromise])

        if (userAlreadyExists) {
            this.toastMessage("Warning", "Username already exists, please use another one");
            return;
        }

        if (emailAlreadyExists) {
            this.toastMessage("Warning", "Email already exists, please use another one");
            return;
        }

        console.log("div", this.state.formData.division);
        if(this.state.formData.division === ""){
            this.toastMessage("Warning", "Please select the division for you.");
            return;
        }
        const z = await BackendRoutes.ROUTE_CREATE_INDIE_USER(this.state.formData.fullName.trimEnd().trimStart(), this.state.formData.division, this.state.formData.email, this.state.formData.password);

        if (z.status === 200) {
            //TODO add varaible for the address to connect to
          //  this.toastMessage("Success", "Thank you for registration, the process is complete, please use your full name and password to login at securedesignrservices.com");
            // Open login form after successful registration
            this.toggleForm('message');
        } else {
            this.toastMessage("Failure", "Registration has failed, reason: " + z.statusText);
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
        const register = document.getElementById('register-form');
        const login = document.getElementById('login-form');
        const msg = document.getElementById('message');
        if (form === 'register') {
            register?.classList.add('hide');
            register?.classList.remove('d-flex');
            login?.classList.remove('hide');
            login?.classList.add('d-flex');
        } if (form === 'login') {
            register?.classList.add('d-flex');
            register?.classList.remove('hide');
            login?.classList.remove('d-flex');
            login?.classList.add('hide');
        }
        if(form === "message")
        {
            register?.classList.add('hide');
            register?.classList.remove('d-flex');
            msg?.classList.remove('hide');
            msg?.classList.add('d-flex');
        }

    }

    render() {

        return (
            <div>
                <div className="position-relative w-100 vh-100 primaryBg">
                    <Header displayName=""/>
                    <Footer/>
                    <div className="container vh-100">
                        <div
                            className="landing-conent vh-100 d-flex flex-column align-items-center justify-content-center">
                            <img className="landing-image w-100" src="img/landing_page_graphic.svg"
                                 alt="landing-page-graphic"/>
                            <div className="landing-text text-center text-32 text-white uppercase">BUILD, CREATE, SELL
                            </div>
                            <div className="landing-text text-center text-32 text-white uppercase">YOUR COMPLETE CHIP
                                DESIGN ECOSYSTEM
                            </div>
                            <a href="#registration">
                                <button
                                    className="rounded-7 bg-white primaryText font-bold h-44 border-0 uppercase px-15 mt-20">Continue
                                </button>
                            </a>
                        </div>
                    </div>
                    {/*  <a href="#registration" className="z-99 position-absolute w-90p bottom-0 left-0 right-0 m-auto">
                        <img src="img/scroll_down.svg" alt="scroll-down" />
                    </a> */}
                </div>
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
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label className="w-100 text-12" htmlFor="division">Division</label>
                                            <select className="w-100"
                                                    value={this.state.formData.division}
                                                    name="division"
                                                    style={{height: "36px", border: "1px solid #D5D5D5"}}
                                                    onChange={this.handleInputChange}>
                                                <option>NA</option>
                                                <option>EU</option>
                                                <option>APAC</option>
                                                <option>LATAM</option>
                                                <option>INTL</option>
                                                <option>EM</option>

                                            </select>
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
                                            <button style={{height: "45px"}}
                                                    className="w-100 align-items-center justify-content-center primaryBg border-0 rounded text-white"
                                                    type="submit">{this.state.spin && <Spinner animation="border" role="status">
                                                    </Spinner>} Register
                                            </button>
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
                                        <button style={{height: "45px"}}
                                                    className="w-100 align-items-center justify-content-center primaryBg border-0 rounded text-white"
                                                    type="submit">{this.state.spin && <Spinner animation="border" role="status">
                                                    </Spinner>}Login
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
                            <div id="message"
                                 className="hide h-100 p-50 align-items-center justify-content-center flex-column">
                                <div className="text-center w-100 mb-4" style={{fontSize: "18px", color: "#DC7740"}}>Registration successful</div>
                                {this.toasts.container()}
                                <form className="w-100">
                                    <div className="row">
                                        <p style={{textAlign: "center"}}>Thank you for registration. please use your full name and password to login at <a href={config.redirectUrl}>{config.redirectName}</a></p>
                                    </div>
                                </form>
                                <div className="w-100 d-flex align-items-center mt-30 justify-content-center flex-column">
                                    <div onClick={() => this.toggleForm('register')}
                                         className="primaryText cursor-pointer uppercase">Login
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

