import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import Highlight from "react-highlight.js";

class ConsoleModal extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: true,
            content: this.props.content,
            operation: this.props.operation
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            operation: nextProps.operation,
            content: nextProps.content
        })
    }

    handleClose() {
        this.setState({ show: false });
        this.props.consoleHandler()
    }

    render() {

        let content = this.state.content || "{}";

        return (

            <Modal size="lg" show={this.state.show} onHide={this.handleClose} >
                <Modal.Header>
                    <Modal.Title>Console output of {this.state.operation}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <code>
                        <Highlight language={"json"}>
                            {JSON.stringify(JSON.parse(content), null, 2)}
                        </Highlight>
                    </code>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default ConsoleModal;