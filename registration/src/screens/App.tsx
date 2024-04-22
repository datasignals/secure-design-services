import React, {Component, ReactElement, ReactFragment, ReactPortal} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Pages} from "../components/Sidebar";
import LandingScreen from "./LandingScreen";
import RegistrationScreen from "./RegistrationScreen";


interface Props {
    children?: ReactElement | ReactFragment | ReactPortal | boolean | null;
}

interface State {
    activePage: Pages
}

export default class App extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            activePage: "/"
        }

        this.updateActivePageIcon = this.updateActivePageIcon.bind(this);
    }


    updateActivePageIcon(page: Pages) {
        this.setState({activePage: page})
    }

    render() {
        const cssLink = document.getElementById("cn-css") as HTMLLinkElement;
        cssLink.href = "/css/cn-styles.css";

        return (

            <BrowserRouter basename={process.env.PUBLIC_URL}>

                <Routes>
                    <Route path="/"
                           element={<LandingScreen/>}>
                    </Route>

                    <Route path="*"
                           element={<LandingScreen/>}>
                    </Route>
{/* 
                    <Route path="registration"
                           element={<RegistrationScreen/>}>
                    </Route> */}
                </Routes>

            </BrowserRouter>
        );
    }

}
