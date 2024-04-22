import {Component} from "react";
import {Toast, ToastContainer} from "react-bootstrap";

export default class Toasts {

    private parent: Component
    public toasts: JSX.Element[] = [];
    public quickToast?: JSX.Element = undefined;

    constructor(parent: Component) {
        this.parent = parent;
        this.setInterval();
    }


    createToast(header: string, content: string) {
        const toast = (
            <Toast style={{zIndex: -1, position: "relative"}} className="" delay={3000} autohide>
                <Toast.Header closeButton={false} className="bg-dark">
                    <strong className="me-auto text-white">{header}</strong>
                </Toast.Header>
                <Toast.Body className="bg-dark text-white">{content}</Toast.Body>
            </Toast>
        )

        do {
            this.toasts.pop()
        } while (this.toasts.length > 1)

        this.toasts.push(toast);
        this.parent.forceUpdate();
    }

    createQuickToast(header: string, content: string) {
        this.quickToast =
            <Toast className="" delay={3000} autohide>
                <Toast.Header closeButton={false} className="bg-dark">
                    <strong className="me-auto text-white">{header}</strong>
                </Toast.Header>
                <Toast.Body className="bg-dark text-white">{content}</Toast.Body>
            </Toast>

        this.parent.forceUpdate();
    }

    deleteQuickToast() {
        this.quickToast = undefined;
        this.parent.forceUpdate();
    }

    // createToastWithRedirect(header: string, content: string) {
    //     this.toasts.push(
    //         <Toast className="" delay={3000} autohide>
    //             <Toast.Header closeButton={false} className="bg-dark">
    //                 <strong className="me-auto text-white">{header}</strong>
    //             </Toast.Header>
    //             <Toast.Body className="bg-dark text-white">
    //                 {content}
    //                 <Button className="btn btn-light">
    //                     <Link className="text-dark" to="/">Go to Select Clients</Link>
    //                 </Button>
    //             </Toast.Body>
    //         </Toast>
    //     );
    //     this.parent.forceUpdate();
    // }

    // push(...toast: JSX.Element[]): number {
    //     return this.toasts.push(...toast);
    // }
    //
    // shift(): JSX.Element | undefined {
    //    return this.toasts.shift();
    // }

    // render() {
    //     return this.toasts;
    // }


    container() {
        return (
            <ToastContainer position="top-end" style={{
                right: "0",
                zIndex: "1"
            }}>
                {this.toasts}
                {this.quickToast}
            </ToastContainer>
        );
    }

    private createEvent = () => {
        let executed = false;
        return () => {
            if (!executed) {
                executed = true;
                setInterval(async () => {
                    this.toasts.shift();
                    this.parent.forceUpdate();
                }, 10000);
            }
        }
    }
    public setInterval = this.createEvent()

}
