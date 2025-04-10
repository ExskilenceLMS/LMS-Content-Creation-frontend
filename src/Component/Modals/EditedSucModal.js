
import React from 'react';
import { Modal } from 'react-bootstrap';

const EditedSucModal = ({ show, onHide }) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            dialogClassName="modal-dialog-centered" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} // Center horizontally if needed
        >
            <Modal.Header closeButton>
                <Modal.Title>Successfully Updated!</Modal.Title>
            </Modal.Header>
        </Modal>
    );
};

export default EditedSucModal;
