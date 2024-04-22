import React, {Component} from "react";
import {Link} from "react-router-dom";

export default class MaintainDocumentsScreen extends Component {

    render() {
        return (
            <section id="content-wrapper" className="dashboard-section maintain-document">
                <div className="row justify-content-center">
                    <div className="col-md-12 col-lg-10 col-xl-9">
                        <h3 className="mt-4">Prepare / Edit Documents</h3>
                        <Link className="btn btn-success px-3 mb-4 mb-md-0" to="/new-document">
                            Prepare New Document for Signing
                        </Link>
                        <span className="mx-3">or</span>
                        <Link className="btn btn-success px-3 mb-4 mb-md-0" to="/existing-document">
                            Edit Existing Document for Signing
                        </Link>
                        <h3 className="mt-5 pt-md-4">Sign Documents</h3>
                        <div className="row">
                            <div className="col-md-12 col-lg-10 col-xl-9">
                                <form>
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="From"/>
                                        <div
                                            className="d-flex flex-wrap justify-content-between align-items-center">
                                            <p className="form-text pl-sm-3">You do not have any documents to
                                                sign</p>
                                            <button type="submit" className="btn btn-outline-secondary">SIGN
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <h3 className="mt-5 pt-md-4">Review Documents</h3>
                        <div className="row">
                            <div className="col-md-12 col-lg-10 col-xl-9">
                                <form>
                                    <div className="form-group">
                                        <input type="text" className="form-control" placeholder="From"/>
                                        <div
                                            className="d-flex flex-wrap justify-content-between align-items-center">
                                            <p className="form-text pl-sm-3">You do not have any documents to
                                                Review</p>
                                            <button type="submit" className="btn btn-outline-secondary">SIGN
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

}
