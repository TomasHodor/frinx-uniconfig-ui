import React, { Component } from 'react';
import './App.css';
import Dashboard from "./components/dashboard/Dashboard";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import List from "./components/uniconfig/deviceTable/List";
import DeviceView from "./components/uniconfig/deviceView/DeviceView";
import Header from "./components/header/Header";
import Registration from "./components/dashboard/Registration";
import Login from "./components/dashboard/Login";

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={ props => (
        localStorage.getItem('user')
            ? <Component {...props} />
            : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>
    )} />
);
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: localStorage.getItem('user'),
        }
    }

    componentWillMount() {
        this.setState({
            user: localStorage.getItem('user'),
        });
    }

    render() {
        const loggedIn = this.state.user;
        const routing = (
            <Router>
                <Switch>
                    <PrivateRoute exact path="/" component={Dashboard} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/registration" component={Registration} />
                    <Route exact path="/devices" component={List} />
                    <Route path="/devices/edit/:id" component={DeviceView} />
                </Switch>
            </Router>
        );

        return (
            <div className="App">
                {loggedIn ? (
                    <Header username={JSON.parse(this.state.user).username} email={JSON.parse(this.state.user).useremail}/>
                    ) : " "
                }
                {routing}
            </div>
        )
    }
}

export default App;
