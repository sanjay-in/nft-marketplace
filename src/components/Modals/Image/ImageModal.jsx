import React from "react";
import { Modal } from "react-bootstrap";
import "./ImageModal.css";

const ImageModal = ({ image, show, handleClose }) => {
  return (
    <div>
      <Modal id="image-modal" show={show} onHide={() => handleClose(false)}>
        <img className="modal-image" src={image} />
      </Modal>
    </div>
  );
};

export default ImageModal;
