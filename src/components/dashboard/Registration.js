import React, {Component} from 'react';
import './Registration.css';
import './Login.css';
import {Button, Col, Container, Form, InputGroup, Row} from 'react-bootstrap';
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLock, faUser, faTimes, faEnvelope, faArrowLeft} from '@fortawesome/free-solid-svg-icons';
import {registration} from "./authentication";
import logoWhite from "./logoWhite.png";

class Registration extends Component {

    constructor(props){
        super(props);
        library.add(faUser, faLock);
        this.state = {
            activeUsername: false,
            activeUseremail: false,
            activePassword: false,
            activePassword2: false,
            password: '',
            password2: '',
            useremail: '',
            username: '',
            error: ''
        };
        this.setUsername = this.setUsername.bind(this);
        this.setUseremail = this.setUseremail.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.setPassword2 = this.setPassword2.bind(this);
        this.register = this.register.bind(this);
        this.redirectToLogin = this.redirectToLogin.bind(this);
    }

    validate = () => {

        if(this.state.username === '' || this.state.useremail === '' || this.state.password === ''){
            this.setState({
                error: 'Please, fill in the fields'
            });
            return false;
        }
        let lastAtPos = this.state.useremail.lastIndexOf('@');
        let lastDotPos = this.state.useremail.lastIndexOf('.');

        if (!(lastAtPos < lastDotPos && lastAtPos > 0
            && this.state.useremail.indexOf('@@') === -1
            && lastDotPos > 2
            && (this.state.useremail.length - lastDotPos) > 2)) {
            this.setState({
                error: 'Email is not valid'
            });
            return false;
        }
        if(this.state.password !== this.state.password2) {
            this.setState({
                error: 'Passwords don\'t match'
            });
            return false;
        }
        return true;
    };

    register = (e) => {
        e.preventDefault();

        if(this.validate()) {
            registration(this.state.username, this.state.useremail, this.state.password)
                .then(this.redirectToLogin(e));
        }
    };

    redirectToLogin = (e) => {
        e.preventDefault();
        window.location.href = "http://" + window.location.hostname + ":3000/";
    };

    setUsername(event) {
        this.setState({username: event.target.value});
    }

    setUseremail(event) {
        this.setState({useremail: event.target.value});
    }

    setPassword(event) {
        this.setState({password: event.target.value});
    }

    setPassword2(event) {
        this.setState({password2: event.target.value});
    }

    render(){
        return(

            <Container>
                <div className="accessPanel">
                    <Row>
                        <Col className="logoBg" xs="4">
                            <div className="registerWindow">
                                <a href="https://frinx.io"><img className="logo" alt="Logo" src={logoWhite}/></a>
                            </div>
                        </Col>
                        <Col xs="1">
                            <div className="loginWindow">
                                <FontAwesomeIcon className="pointer" icon={faArrowLeft} onClick={this.redirectToLogin}/>
                            </div>
                        </Col>
                        <Col className="whiteBg" xs="6">
                            <div className="loginWindow">
                                <h1>Registration</h1>
                                <center>
                                    <Form onSubmit={this.register}>
                                        <InputGroup className={!this.state.activeUsername ? "input-user pretty-feild paddedFeild" : "input-user pretty-feild paddedFeild focusedInput"}>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="user-addon"><FontAwesomeIcon icon={faUser} /></InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <input onFocus={() => {this.setState({activeUsername: true})}} onBlur={() => {this.setState({activeUsername: false})}} type="text" placeholder="Username" onChange={this.setUsername} />
                                        </InputGroup>
                                        <InputGroup className={!this.state.activeUseremail ? "input-email pretty-feild paddedFeild" : "input-email pretty-feild paddedFeild focusedInput"}>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="user-addon"><FontAwesomeIcon icon={faEnvelope} /></InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <input onFocus={() => {this.setState({activeUseremail: true})}} onBlur={() => {this.setState({activeUseremail: false})}} type="email" placeholder="Email" onChange={this.setUseremail} />
                                        </InputGroup>
                                        <InputGroup className={!this.state.activePassword ? "input-password pretty-feild paddedFeild" : "input-password pretty-feild paddedFeild focusedInput"}>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="password-addon"><FontAwesomeIcon icon={faLock} /></InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <input onFocus={() => {this.setState({activePassword: true})}} onBlur={() => {this.setState({activePassword: false})}} type="password" placeholder="Password" onChange={this.setPassword} />
                                        </InputGroup>
                                        <InputGroup className={!this.state.activePassword2 ? "input-password pretty-feild paddedFeild" : "input-password pretty-feild paddedFeild focusedInput"}>
                                            <InputGroup.Prepend>
                                                <InputGroup.Text id="password-addon"><FontAwesomeIcon icon={faLock} /></InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <input onFocus={() => {this.setState({activePassword2: true})}} onBlur={() => {this.setState({activePassword2: false})}} type="password" placeholder="Confirm password" onChange={this.setPassword2} />
                                        </InputGroup>
                                    </Form>
                                </center>
                                <div className={ this.state.error === '' ? 'hidden' : 'wrongLogin'}>
                                    <FontAwesomeIcon icon={faTimes} /> {this.state.error}
                                </div>

                                <Button variant="primary" onClick={this.register} className="paddedButton">
                                    Registration
                                </Button>
                            </div>
                            <br />
                            <br />
                        </Col>
                        <Col className="whiteBg" xs="1"/>
                    </Row>
                </div>
            </Container>

        )
    }
}


export default (Registration);