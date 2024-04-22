import WebViewer, {WebViewerInstance} from '@pdftron/webviewer';
import React, {Component} from 'react';
import {useParams} from 'react-router-dom';
import BackendRoutes from "../../BackendRoutes";
import SignatureBox from "../../common/SignatureBox";

interface Props {
    // id: string
    selectedCompany: string
    docName: string
}

interface State {
    signatures: SignatureBox[]
}

class ModifyDocumentClass extends Component<Props, State> {

    //Ref used to create PDF Reader
    private myRef = React.createRef<HTMLDivElement>();
    //Ref used to access PDF Reader in other functions
    private viewerRef: React.RefObject<WebViewerInstance> = React.createRef<WebViewerInstance>();

    constructor(props: Props) {
        super(props);
        this.state = {
            signatures: []
        }

        this.getSignaturesForDocument = this.getSignaturesForDocument.bind(this);
        this.handleSaveSignatures = this.handleSaveSignatures.bind(this);
        this.initWebViewer = this.initWebViewer.bind(this);
        this.handleFindExistingAnnotationas = this.handleFindExistingAnnotationas.bind(this);
    }

    componentDidMount() {
        this.initWebViewer()
            .then(() => this.getSignaturesForDocument()
                .then(() => setTimeout(() => this.handleFindExistingAnnotationas(), 5000))
            );
    }


    private async initWebViewer() {
        const documentRes = await BackendRoutes.ROUTE_GET_DOCUMENT(this.props.selectedCompany, this.props.docName);

        let document: Uint8Array;
        let documentBlob: Blob;
        if (documentRes.status === 200) {
            documentBlob = await documentRes.data;
            document = new Uint8Array(await documentBlob.arrayBuffer());
        }


        WebViewer({
            path: "/lib",
            //Ignore a lot of elements
            disabledElements: [
                // "header",
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
                "toolsOverlay",
                "toolbarGroup-Edit",
                "tool-group-buttons-scroll"
            ],
        }, this.myRef.current as HTMLDivElement).then(instance => {
            const {documentViewer} = instance.Core;

            instance.UI.loadDocument(documentBlob, {filename: this.props.docName});

            instance.UI.disableTools([
                'AnnotationCreateSticky',
                'AnnotationCreateFreeText',
                "ARROW",
                "ARROW2",
                "ARROW3",
                "ARROW4",
                "CALLOUT",
                "CALLOUT2"	,
                "CALLOUT3",
                "CALLOUT4",
                "ELLIPSE",
                "ELLIPSE2",
                "ELLIPSE3",
                "ELLIPSE4",
                "FREEHAND",
                "FREEHAND2",
                "FREEHAND3",
                "FREEHAND4",
                "FREEHAND_HIGHLIGHT",
                "FREEHAND_HIGHLIGHT2",
                "FREEHAND_HIGHLIGHT3",
                "FREEHAND_HIGHLIGHT4",
                "FREETEXT",
                "FREETEXT2",
                "FREETEXT3",
                "FREETEXT4",
                "MARK_INSERT_TEXT",
                "MARK_INSERT_TEXT2",
                "MARK_INSERT_TEXT3",
                "MARK_INSERT_TEXT4",
                "MARK_REPLACE_TEXT",
                "MARK_REPLACE_TEXT2",
                "MARK_REPLACE_TEXT3",
                "MARK_REPLACE_TEXT4",
                "FORM_FILL_CROSS",
                "FORM_FILL_CHECKMARK",
                "FORM_FILL_DOT",
                "LINE",
                "LINE2",
                "LINE3",
                "LINE4",
                "POLYGON",
                "POLYGON2",
                "POLYGON3",
                "POLYGON4",
                "POLYGON_CLOUD",
                "POLYGON_CLOUD2",
                "POLYGON_CLOUD3",
                "POLYGON_CLOUD4",
                "POLYLINE",
                "POLYLINE2",
                "POLYLINE3",
                "POLYLINE4",
                "RECTANGLE",
                "RECTANGLE2",
                "RECTANGLE3",
                "RECTANGLE4",
                "CALIBRATION_MEASUREMENT",
                "DISTANCE_MEASUREMENT",
                "DISTANCE_MEASUREMENT2",
                "DISTANCE_MEASUREMENT3",
                "DISTANCE_MEASUREMENT4",
                "PERIMETER_MEASUREMENT",
                "PERIMETER_MEASUREMENT2",
                "PERIMETER_MEASUREMENT3",
                "PERIMETER_MEASUREMENT4",
                "AREA_MEASUREMENT",
                "AREA_MEASUREMENT2",
                "AREA_MEASUREMENT3",
                "AREA_MEASUREMENT4",
                "CLOUDY_RECTANGULAR_AREA_MEASUREMENT",
                "CLOUDY_RECTANGULAR_AREA_MEASUREMENT2",
                "CLOUDY_RECTANGULAR_AREA_MEASUREMENT3",
                "CLOUDY_RECTANGULAR_AREA_MEASUREMENT4",
                "COUNT_MEASUREMENT",
                "COUNT_MEASUREMENT2",
                "COUNT_MEASUREMENT3",
                "COUNT_MEASUREMENT4",
                "SIGNATURE",
                "STAMP",
                "FILEATTACHMENT",
                "STICKY",
                "STICKY2",
                "STICKY3",
                "STICKY4",
                "HIGHLIGHT",
                "HIGHLIGHT2",
                "HIGHLIGHT3",
                "HIGHLIGHT4",
                "SQUIGGLY",
                "SQUIGGLY2",
                "SQUIGGLY3",
                "SQUIGGLY4",
                "STRIKEOUT",
                "STRIKEOUT2",
                "STRIKEOUT3",
                "STRIKEOUT4",
                "UNDERLINE",
                "UNDERLINE2",
                "UNDERLINE3",
                "UNDERLINE4",
                "REDACTION",
                "REDACTION2",
                "REDACTION3",
                "REDACTION4",
                "TEXT_SELECT",
                "EDIT",
                "PAN",
                "CROP",
                "MARQUEE",
                "ERASER",
                "CONTENT_EDIT",
                "ADD_PARAGRAPH",
                "ADD_IMAGE_CONTENT",
                "TEXT_FORM_FIELD",
                "TEXT_FORM_FIELD2",
                "TEXT_FORM_FIELD3",
                "TEXT_FORM_FIELD4",
                "SIG_FORM_FIELD",
                "SIG_FORM_FIELD2",
                "SIG_FORM_FIELD3",
                "SIG_FORM_FIELD4",
                "CHECK_BOX_FIELD",
                "RADIO_FORM_FIELD",
                "LIST_BOX_FIELD",
                "LIST_BOX_FIELD2",
                "LIST_BOX_FIELD3",
                "LIST_BOX_FIELD4",
                "COMBO_BOX_FIELD",
                "COMBO_BOX_FIELD2",
                "COMBO_BOX_FIELD3",
                "COMBO_BOX_FIELD4",
            ]); // hides DOM element + disables shortcut

            documentViewer.addEventListener('documentLoaded', () => {


                // documentViewer.disableArrowKeyNavigation();
                // documentViewer.disableAutomaticLinking();
                // documentViewer.disableReadOnlyMode();
                // documentViewer.disableGrayscaleAnnotations();
                // documentViewer.disableGrayscaleAnnotationsMode();
                // documentViewer.disableGrayscaleMode();
                // documentViewer.disableStylusMode();
                // documentViewer.disableLoadingAnnotationsFromVisiblePages();
                // documentViewer.disableViewportRenderMode();
                // documentViewer.disableRightToLeftPageRendering();

                // const tools = documentViewer.getToolModeMap();
                // for (const [toolName, tool] of Object.entries(tools)) {
                //     if (toolName !== 'AnnotationCreateSignature') {
                //         // @ts-ignore
                //         tool.disabled = true;
                //     }
                // }

                //TODO forced cast
                // @ts-ignore
                this.viewerRef.current = instance
                return instance;
            });
        });
    }

    //TODO later the idea is to store the annotations somewhere
    // so that they can be automatically submitted to "readPdf" screen
    private async handleFindExistingAnnotationas() {
        if (this.state.signatures) {
            const {Annotations, annotationManager } = this.viewerRef.current!.Core;
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
        const a = await BackendRoutes.ROUTE_GET_SIGNATURE(this.props.selectedCompany!, this.props.docName!.slice(0, this.props.docName!.length - 4));

        if (a.status !== 200) {
            alert("Failed to get singautes?!?!?!?");
            return;
        }

        const signatures: SignatureBox[] = await a.data;

        this.setState({signatures: signatures});
    }


    public async handleSaveSignatures() {
        const a = this.viewerRef.current!.Core.annotationManager.getAnnotationsList();

        if (a.length <= 0) {
            alert("To submit a PDF for signing, the document needs at least one Field");
        }

        const mappedSignatures: SignatureBox[] = a.map(e => ({
            x: e.X,
            y: e.Y,
            width: e.Width,
            height: e.Height,
            pageNumber: e.getPageNumber()
        }))

        //TODO do something with the result?
        const putSignatureResult = await BackendRoutes.ROUTE_POST_PUT_SIGNATURE(this.props.selectedCompany, this.props.docName, JSON.stringify(mappedSignatures));
    }

    render() {
        return (
            <section id="content-wrapper" className="dashboard-section">
                <div>{this.props.selectedCompany}</div>
                <div>{this.props.docName}</div>
                <input className="btn btn-success" type="button" value="Save Signatures" onClick={this.handleSaveSignatures}/>
                <div className="webviewer" ref={this.myRef}></div>
            </section>
        );
    }
}

const ModifyDocumentScreen: React.FC = () => {
    const {selectedCompany, docName} = useParams<{ selectedCompany: string, docName: string }>();
    return <ModifyDocumentClass selectedCompany={selectedCompany!} docName={docName!}/>;
};

export default ModifyDocumentScreen;
