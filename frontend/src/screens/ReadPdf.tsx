import WebViewer, {WebViewerInstance} from "@pdftron/webviewer";
import React, {Component} from "react";
import {useParams} from "react-router-dom";
import BackendRoutes from "../BackendRoutes";
import User from "../common/User";
import SignatureBox from "../common/SignatureBox";
import Toasts from "../components/Toasts";
import DummySidebar from "../components/DummySidebar";

interface Props {
    uniqueIdentifier: string,
    batchID: string,
    docName: string,
}

interface State {
    user: User | undefined,
    runOnce: boolean,
    isRevoked: boolean,
    toasts: Toasts
    signatures: SignatureBox[]

}

class ReadPdf2Class extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            toasts: new Toasts(this),
            user: undefined,
            runOnce: false,
            isRevoked: false,
            signatures: []
        };

        this.find = this.find.bind(this);
        this.userSigned = this.userSigned.bind(this);
        this.sendDocument = this.sendDocument.bind(this);
        this.initWebViewer = this.initWebViewer.bind(this);
        this.revokeDocument = this.revokeDocument.bind(this);
    }

    //Ref used to create PDF Reader
    private myRef = React.createRef<HTMLDivElement>();
    //Ref used to access PDF Reader in other functions
    private viewerRef: React.RefObject<WebViewerInstance> = React.createRef<WebViewerInstance>();


    async componentDidMount() {
        this.find(this.props.uniqueIdentifier).then(() => {
            this.userSigned().then(() => {
                this.userRevoked().then(() => {
                    this.initWebViewer()
                        .then(() => this.getSignaturesForDocument()
                            .then(() => setTimeout(() => this.handleFindExistingAnnotationas(), 5000))
                        );
                })
            })
        });
    }


    /////////////////////////////////////////////////////////
    async initWebViewer() {
        //TODO fix forced cast!!!!!!
        const documentRes = await BackendRoutes.ROUTE_GET_DOCUMENT(this.state.user!.company.toString(), this.props.docName)

        let document: Uint8Array;
        let documentBlob: Blob;
        if (documentRes.status === 200) {
            documentBlob = await documentRes.data;
            document = new Uint8Array(await documentBlob.arrayBuffer());
        }


        WebViewer({
            path: "/lib",
            fullAPI: true,
            //Ignore a lot of elements
            disabledElements: [
                "header",
                "leftPanel",
                "searchButton",
                "searchPanel",
                "thumbnails",
                "outlines",
                "viewControlsButton",
                "zoomOutButton",
                "zoomInButton",
                "rubberStampToolGroupButton",
                "stampToolGroupButton",
                "fileAttachmentToolGroupButton",
                "calloutToolGroupButton",
                "eraserToolButton",
                "signatureToolGroupButton",
                "toolsOverlay"
            ],
        }, this.myRef.current as HTMLDivElement).then(instance => {
            //Load doc
            instance.UI.loadDocument(documentBlob, {filename: this.props.docName});

            const {documentViewer, annotationManager, Annotations} = instance.Core;
            const {WidgetFlags} = Annotations;

            documentViewer.addEventListener('documentLoaded', () => {
                const pageCount = documentViewer.getPageCount();
                const pageWidth = documentViewer.getPageWidth(pageCount);
                const pageHeight = documentViewer.getPageHeight(pageCount)

                documentViewer.disableArrowKeyNavigation();
                documentViewer.disableAutomaticLinking();
                documentViewer.disableReadOnlyMode();
                documentViewer.disableGrayscaleAnnotations();
                documentViewer.disableGrayscaleAnnotationsMode();
                documentViewer.disableGrayscaleMode();
                documentViewer.disableStylusMode();
                documentViewer.disableLoadingAnnotationsFromVisiblePages();
                documentViewer.disableViewportRenderMode();
                documentViewer.disableRightToLeftPageRendering();

                const tools = documentViewer.getToolModeMap();
                for (const [toolName, tool] of Object.entries(tools)) {
                    if (toolName !== 'AnnotationCreateSignature') {
                        // @ts-ignore
                        tool.disabled = true;
                    }
                }

                //TODO forced cast
                // @ts-ignore
                this.viewerRef.current = instance
            });
        });

    }


    //TODO later the idea is to store the annotations somewhere
    // so that they can be automatically submitted to "readPdf" screen
    private async handleFindExistingAnnotationas() {
        if (this.state.signatures) {
            //TODO force undefined
            const {Annotations, annotationManager} = this.viewerRef.current!.Core;

            const {WidgetFlags} = Annotations;


            this.state.signatures.forEach(signature => {

                // set flags for required
                const flags = new WidgetFlags({});
                flags.set('Required', true);

                // create a form field
                const field = new Annotations.Forms.Field("some signature field name", {
                    type: 'Sig',
                    flags,
                })

                const widgetAnnot = new Annotations.SignatureWidgetAnnotation(field, {
                    appearance: '_DEFAULT',
                    appearances: {
                        _DEFAULT: {
                            Normal: {
                                offset: {
                                    x: 100,
                                    y: 100,
                                },
                            },
                        },
                    },
                });
                widgetAnnot.PageNumber = signature.pageNumber;
                widgetAnnot.X = signature.x;
                widgetAnnot.Y = signature.y;
                widgetAnnot.Width = signature.width;
                widgetAnnot.Height = signature.height;

                annotationManager.getFieldManager().addField(field);
                annotationManager.addAnnotation(widgetAnnot);
                annotationManager.drawAnnotationsFromList([widgetAnnot]);
            });
        }
    }

    //Meant to pull signatures first
    private async getSignaturesForDocument() {
        //TODO force casting
        const a = await BackendRoutes.ROUTE_GET_SIGNATURE(this.state.user!.company, this.props.docName!.slice(0, this.props.docName!.length - 4));

        if (a.status !== 200) {
            this.state.toasts.createToast("WARNING", "Failed to get signatures");
            return;
        }

        const signatures: SignatureBox[] = await a.data;

        this.setState({signatures: signatures});
    }


    async find(uniqueIdentifier: string): Promise<User> {
        const users: User[] = await BackendRoutes.ROUTE_LIST_USERS().then(e => e.data);
        const user = users.find(e => e.uniqueIdentifier!.toString() === uniqueIdentifier);

        this.setState({user: user!});
        this.state = {
            user: user!,
            runOnce: this.state.runOnce,
            isRevoked: this.state.isRevoked,
            toasts: this.state.toasts,
            signatures: this.state.signatures
        }
        return user!;
    }

    async userSigned() {
        if (!this.props.batchID) {
            this.setState({runOnce: true});
            this.state.toasts.createToast("Failure", "Address misses batchID");
            return;
        }

        if (this.state.user) {
            const userSignedStatus: { signed: boolean, sent: boolean } =
                    await BackendRoutes.ROUTE_DOCUMENT_SIGNED(this.state.user.username, this.state.user.email, this.props.batchID!)
                        .then(e => e.data);

            if (userSignedStatus.signed) {
                this.setState({runOnce: true});
            } else {
                this.setState({runOnce: false});
            }
        } else {
            this.setState({runOnce: false});
        }
    }

    async userRevoked() {
        if (!this.props.batchID) {
            this.setState({isRevoked: true});
            this.state.toasts.createToast("Failure", "Address misses batchID");
            return;
        }

        if (this.state.user) {
            const userSignedStatus: { signed: boolean, sent: boolean, revoked: boolean } =
                    await BackendRoutes.ROUTE_DOCUMENT_SIGNED(this.state.user.username, this.state.user.email, this.props.batchID!)
                        .then(e => e.data);

            if (userSignedStatus.revoked) {
                this.setState({isRevoked: true});
            } else {
                this.setState({isRevoked: false});
            }
        } else {
            this.setState({isRevoked: false});
        }
    }

    /////////////////////////////////////////////////////////

    async sendDocument() {
        const docViewer = this.viewerRef.current!.Core.documentViewer;
        const xfdfString = await docViewer.getAnnotationManager().exportAnnotations();
        const data = await docViewer.getDocument().getFileData({xfdfString});
        const arr = new Uint8Array(data);
        const blob = new Blob([arr], {type: 'application/pdf'});

        const formData = new FormData()
        formData.append("pdf", blob);

        if (this.state.user && this.props.batchID) {
            await BackendRoutes.ROUTE_SEND_PDF(this.state.user.username, this.state.user.email, this.props.batchID, formData);
            this.setState({runOnce: true});
            // setRunOnce(true);
            this.state.toasts.createToast("Success", "Form Submitted");
        } else {
            this.state.toasts.createToast("Failure", "Something went wrong, user doesn't exists or link is missing batch number");
        }
    };

    async revokeDocument() {
        // this.state.toasts.createToast("TEST", "This is an attempt to revoke consent");
        // this.state
        if (this.state.user && this.props.batchID) {
            const revokeResult = await BackendRoutes.ROUTE_REVOKE_USER_CONSENT(this.state.user.username, this.state.user.company, this.props.batchID)
            if(revokeResult.data) {
                this.state.toasts.createToast("Success", "Consent Revoked!");
                this.setState({isRevoked: true});
            } else {
                this.state.toasts.createToast("Failure", "Failed to revoke your consent!");
            }
        } else {
            this.state.toasts.createToast("Failure", "Failed to revoke your consent!");
        }
    }

    render() {
        return (
            <>
                {/*TODO fix `isRevoked`*/}
                <DummySidebar isSigned={this.state.runOnce} isRevoked={this.state.isRevoked}
                              parentCallbackSignDocument={this.sendDocument}
                              parentCallbackRevokeDocument={this.revokeDocument}/>
                <section id="content-wrapper" className="dashboard-section">
                    <h1>{this.state.user?.username}</h1>
                    {/*{this.state.runOnce ?*/}
                    {/*    <h1>SIGNED!</h1> :*/}
                    {/*    <input type="button" className="btn btn-primary" value="Send Document" onClick={this.sendDocument}/>*/}
                    {/*}*/}
                    {this.state.toasts.container()}
                    <div className="webviewer" ref={this.myRef}></div>
                    <hr/>
                </section>
            </>
        );
    }
}

interface FProps {
    // documentSigned: boolean,
    // signFunction: () => void
}

const ReadPdf: React.FC<FProps> = (props: FProps) => {
    const {
        uniqueIdentifier,
        batchID,
        docName
    } = useParams<{ uniqueIdentifier: string, batchID: string, docName: string }>();


    return <ReadPdf2Class uniqueIdentifier={uniqueIdentifier!} batchID={batchID!} docName={docName!}/>;
};

export default ReadPdf;
