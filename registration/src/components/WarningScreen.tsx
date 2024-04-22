import {Component} from "react";


interface Props {
    title: string,
    message: string
}

export default class WarningScreen extends Component<Props, {}> {

    render() {
        return (
            <section id="content-wrapper" className="dashboard-section">
                <div className="row">

                    <div className="col-lg-12">
                        <h1>{this.props.title}</h1>
                        <p>{this.props.message}</p>
                    </div>

                </div>
            </section>
        );
    }
}
