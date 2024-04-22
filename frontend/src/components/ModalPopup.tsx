import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

interface ModalPopupProps {
  show: boolean;
  onHide: () => void;
}
class ModalPopup extends Component <ModalPopupProps>{
  
  render() {
    return ( <Modal
      {...this.props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter"  style={{color : "black"}}>
          <Spinner animation="border" role="status">
          </Spinner> Finalizing......
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p  style={{color : "black"}}>Recording transaction on the blockchain</p>
      </Modal.Body>
    </Modal>
    );
  }
}

export default ModalPopup;
