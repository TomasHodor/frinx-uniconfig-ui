import React, {Component} from 'react';
import './Login.css';
import {Button, Col, Container, Form, InputGroup, Row} from 'react-bootstrap';
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faLock, faUser, faTimes} from '@fortawesome/free-solid-svg-icons';
import logoWhite from './logoWhite.png';
import {authenticate} from "./authentication";

class Login extends Component {

    constructor(props){
        super(props);
        library.add(faUser, faLock);
        this.state = {
            activeUsername: false,
            activePassword: false,
            password: '',
            username: '',
            error: ''
        };
        this.setUsername = this.setUsername.bind(this);
        this.setPassword = this.setPassword.bind(this);
        this.register = this.register.bind(this);
        this.logIn = this.logIn.bind(this);
    }

    register = (e) => {
        e.preventDefault();
        window.location.href = "http://"+window.location.hostname+":3000/registration";
    };

    logIn = (e) => {
        e.preventDefault();
        authenticate(this.state.username, this.state.password).then((value) => {
            if (value.username) {
                let user = {
                    username: value.username,
                    useremail: value.useremail
                };
                localStorage.setItem('user', JSON.stringify(user));
                window.location.href = "http://"+window.location.hostname+":3000";
            } else {
                this.setState({
                    error: 'Wrong username or password'
                })
            }
        })
    };

    setUsername(event) {
        this.setState({username: event.target.value});
    }

    setPassword(event) {
        this.setState({password: event.target.value});
    }

    render(){
        return(
            
            <Container>
                <div className="accessPanel">
                <Row>
                    <Col className="whiteBg" xs="7">
                        <div className="loginWindow">
                        <h1>Sign in</h1>
                        <center>
                            <Form onSubmit={this.logIn}>
                                <InputGroup className={!this.state.activeUsername ? "input-user pretty-feild paddedFeild" : "input-user pretty-feild paddedFeild focusedInput"}>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="user-addon"><FontAwesomeIcon icon={faUser} /></InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <input onFocus={() => {this.setState({activeUsername: true})}} onBlur={() => {this.setState({activeUsername: false})}} type="text" placeholder="Username" onChange={this.setUsername}/>
                                </InputGroup>
                                <InputGroup className={!this.state.activePassword ? "input-password pretty-feild paddedFeild" : "input-password pretty-feild paddedFeild focusedInput"}>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="password-addon"><FontAwesomeIcon icon={faLock} /></InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <input onFocus={() => {this.setState({activePassword: true})}} onBlur={() => {this.setState({activePassword: false})}} type="password" placeholder="Password" onChange={this.setPassword}/>
                                </InputGroup>
                            </Form>
                        </center>
                            <div className={ this.state.error === '' ? 'hidden' : 'wrongLogin'}>
                                <FontAwesomeIcon icon={faTimes} /> {this.state.error}
                            </div>
                        <Button variant="primary" onClick={this.logIn} className="paddedButton">
                            Sign in
                        </Button>
                            <a href="https://frinx.io/user-account?a=pwdreset"><div className="smallText">Forgot your password?</div></a>
                        <br /> or<br />
                        <Button variant="primary" onClick={this.props.logIn} className="paddedButton">
                            Sign in using Facebook
                        </Button>
                        </div>
                        <br />
                        <br />
                    </Col>
                    <Col className="gradientBg" xs="5">
                        <div className="registerWindow">
                        <h1>Sign up</h1>
                        Don't have an account yet? You can:<br />
                        <Button className="btn-margin" variant="outline-light" type="submit">
                            Sign up using Facebook
                        </Button><br />
                        or<br />
                        <Button className="btn-margin" variant="outline-light" onClick={this.register}>
                            Register as a new user
                        </Button>
                        <br />
                        <a href="https://frinx.io"><img className="logo" alt="Logo" src={logoWhite}/></a>
                        </div>
                    </Col>
                </Row>
                </div>
            </Container>
            
        )
    }
}


export default (Login);