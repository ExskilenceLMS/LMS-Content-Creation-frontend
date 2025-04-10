// src/SuccessModal.js
import React from 'react';
import { Modal } from 'react-bootstrap';

const SuccessModal = ({ show, onHide }) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            dialogClassName="modal-dialog-centered" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} // Center horizontally if needed
        >
            <Modal.Header closeButton>
                <Modal.Title>Successfully Saved!</Modal.Title>
            </Modal.Header>
        </Modal>
    );
};

export default SuccessModal;
