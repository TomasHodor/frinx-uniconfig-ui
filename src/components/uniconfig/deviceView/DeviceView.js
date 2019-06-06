import React, {Component} from 'react';
import { ReactGhLikeDiff } from 'react-gh-like-diff';
import Editor from "./editor/Editor";
import './DeviceView.css'
import {Badge, Button, Col, Container, Dropdown, Form, Row, Spinner } from "react-bootstrap";
import DropdownMenu from "./dropdownMenu/DropdownMenu";
import SnapshotModal from "./snapshotModal/SnapshotModal";
import CustomAlerts from "../customAlerts/CustomAlerts";
import ConsoleModal from "./consoleModal/ConsoleModal";
const http = require('../../../server/HttpServerSide').HttpClient;

const defaultOptions = {
    originalFileName: 'Operational',
    updatedFileName: 'Operational',
    inputFormat: 'diff',
    outputFormat: 'line-by-line',
    showFiles: false,
    matching: 'none',
    matchWordsThreshold: 0.25,
    matchingMaxComparisons: 2500
};

class DeviceView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            config: '{}',
            operational: '{}',
            device: null,
            snapshots: ["snapshot1","snapshot2"],
            showDiff: false,
            creatingSnap: false,
            syncing: false,
            initializing: true,
            alertType: null,
            commiting: false,
            showConsole: false,
            deletingSnaps: false,
            console: "",
            operation: "",
            dryRunOutput: "",
            dryRunResult: false
        }
    }

    componentDidMount() {
        this.setState({
            device: window.location.href.split("/").pop()
        }, () => this.fetchData(this.state.device));
    }

    fetchData(device){

        http.get('/api/odl/get/conf/uniconfig/' + device).then(res => {
            this.setState({
                config: JSON.stringify(res),
                initializing: false
            })
        });

        http.get('/api/odl/get/oper/uniconfig/' + device).then(res => {
            this.setState({
                operational: JSON.stringify(res),
                initializing: false
            })
        });
    }

    updateConfig(newData) {
        let data = JSON.parse(JSON.stringify(newData, null, 2));
        http.put('/api/odl/put/conf/uniconfig/' + this.state.device, data).then(res => {
            this.setState({
                alertType: `putConfig${res.body.status}`,
                console: JSON.stringify(res.body, null, 2),
                operation: "Update Config"
            });
            this.animateConsole();
        });

        this.setState({
            config: JSON.stringify(newData, null, 2),
        })
    }

    showDiff(){
        this.setState({
            showDiff: !this.state.showDiff,
        });
    }

    commitToNetwork(){

        this.setState({commiting: true});
        let target = JSON.parse(JSON.stringify({"input": {"target-nodes": {"node": [this.state.device]}}}));
        http.post('/api/odl/post/operations/commit/', target).then(res => {
            this.setState({
                alertType: `commit${res.body.status}`,
                commiting: false,
                console: res.body.text,
                operation: "Commit to Network"
            });
            this.animateConsole();
            this.syncFromNetwork();
        });
    }

    dryRun() {
        let target = JSON.parse(JSON.stringify({"input": {"target-nodes": {"node": [this.state.device]}}}));
        http.post('/api/odl/post/operations/dryrun/', target).then(res => {
            this.setState({
                alertType: `dryrun${res.body.status}`,
                console: res.body.text,
                dryRunOutput: this.parseDryRunOutput(res.body.text),
                operation: "Dry-run"
            });
            this.animateConsole();
        })
    }

    parseDryRunOutput(output) {
        let parsedOutput = "";
        if (JSON.parse(output)["output"]["overall-configuration-status"] === "complete") {
            this.setState({
                dryRunResult: true
            });
            let results = JSON.parse(output)["output"]["node-config-results"];
            if (results !== undefined) {
                results["node-config-result"].forEach(result => {
                    console.log(result["configuration"]);
                    parsedOutput = result["configuration"];
                })
            }
        } else {
            this.setState({
                dryRunResult: false
            });
            let results = JSON.parse(output)["output"]["node-config-results"];
            if (results !== undefined) {
                results["node-config-result"].forEach(result => {
                    console.log(result["configuration"]);
                    parsedOutput = result["error-message"];
                })
            }
        }
        if (parsedOutput !== "") {
            parsedOutput = parsedOutput.split('\n').map(i => {
                return <p>{i}</p>
            });
        }
        return parsedOutput
    }

    animateConsole() {
        document.getElementById("consoleButton").classList.add("button--animate");
        setTimeout( () => {
            this.setState({alertType: null});
            document.getElementById("consoleButton").classList.remove("button--animate")
        }, 2000);
    }

    syncFromNetwork(){
        this.setState({syncing: true});
        let target = JSON.stringify({"input": {"target-nodes": {"node": [this.state.device]}}});

        http.post('/api/odl/post/operations/syncfromnetwork', target).then((res_first) => {
            http.get('/api/odl/get/oper/uniconfig/' + this.state.device).then(res => {
                this.setState({
                    operational: JSON.stringify(res),
                    initializing: false,
                    syncing: false,
                    console: res_first.body.text,
                    operation: "Sync-from-network"
                });
                this.animateConsole()
            });
        })
    }

    refreshConfig(){
        http.get('/api/odl/get/conf/uniconfig/' + this.state.device).then(res => {
            this.setState({
                config: JSON.stringify(res),
            })
        });
    }

    getSnapshots(){
        http.get('/api/odl/get/conf/snapshots/' + this.state.device).then(res => {
            if(res !== 500) {
                this.setState({
                    snapshots: res
                })
            }
        })
    }

    loadSnapshot(snapshotId){
        //deleting snapshot
        let snapshotName = this.state.snapshots[snapshotId]["topology-id"];
        if (this.state.deletingSnaps) {
            let target = JSON.parse(JSON.stringify({"input": {"name": snapshotName } } ) );
            http.post('/api/odl/post/conf/snapshots/delete', target).then(res => {
                console.log(res);
            })
        } else {
            let target = JSON.stringify({
                "input": {
                    "name": snapshotName,
                    "target-nodes": {"node": [this.state.device]}
                }
            });
            http.post('/api/odl/post/operations/replacesnapshot', target).then(res_first => {
                http.get('/api/odl/get/conf/snapshots/' + snapshotName + '/' + this.state.device).then(res => {
                    this.setState({
                        config: JSON.stringify(res, null, 2),
                        console: JSON.stringify(res_first.body),
                        operation: "Replace-Config-With-Snapshot"
                    });
                    this.animateConsole();
                })
            })
        }
    }

    createSnapshot(){
        this.setState({
            creatingSnap: !this.state.creatingSnap,
        })
    }

    consoleHandler() {
        this.setState({
            showConsole: !this.state.showConsole
        })
    }

    clearDryRun(){
        this.setState({
            dryRunOutput: ""
        })
    }

    render() {

        let configJSON = JSON.stringify(JSON.parse(this.state.config), null, 2);
        let operationalJSON = JSON.stringify(JSON.parse(this.state.operational), null, 2);

        const operational = () => (
            <div>
                <div>
                    <h2 style={{display: "inline-block", marginTop: "5px"}}>Actual Configuration</h2>
                    <div style={{float: "right"}}>
                        <Button className="btn btn-primary" style={{marginRight: '5px'}}
                                disabled={this.state.syncing}
                                onClick={this.syncFromNetwork.bind(this)}>
                            <i className={this.state.syncing ? "fas fa-sync fa-spin" : "fas fa-sync"}/>
                            &nbsp;&nbsp;{this.state.syncing ? "Synchronizing..." : "Sync from network"}
                        </Button>
                    </div>
                </div>
                {this.state.showDiff ?
                    <ReactGhLikeDiff
                        options={defaultOptions}
                        past={operationalJSON}
                        current={configJSON}
                    />
                    :
                    <Editor title="" deviceName={this.state.device} editable={false} updateDiff={this.updateConfig.bind(this)}
                            wfs={JSON.parse(operationalJSON)}/>
                }
            </div>
        );

        return (
            <div>
                <header className="options">
                    <Button className="round floating-btn noshadow" onClick={() => {
                        this.props.history.push('/devices')
                    }} variant="outline-light"><i className="fas fa-chevron-left"/></Button>
                    <Container fluid className="container-props">
                        <Row >
                            <Col md={5} className="child">
                                    <Dropdown onClick={this.getSnapshots.bind(this)} className="leftAligned" >
                                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                                            <i className="fas fa-file-download"/>&nbsp;&nbsp;Load Snapshot
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu as={DropdownMenu}>
                                            {this.state.snapshots.map((item, i) => {
                                                return <Dropdown.Item onClick={() => this.loadSnapshot(i)} key={i}>{item["topology-id"]}
                                                        {this.state.deletingSnaps ? <i className="fas fa-minus" style={{float: "right"}}/> : null}
                                                </Dropdown.Item>
                                            })}
                                            <Dropdown.Divider />
                                                <Button onClick={() => this.setState({deletingSnaps: !this.state.deletingSnaps})}
                                                        variant={this.state.deletingSnaps ? "danger" : "outline-danger"} style={{marginLeft: "20px", marginBottom: "-15px"}}>
                                                    <i className="fas fa-trash" style={{marginRight: "10px"}}/>
                                                    Toggle deleting
                                                </Button>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                <Button className="leftAligned" variant="outline-light"
                                        onClick={this.createSnapshot.bind(this)}>
                                    <i className="fas fa-folder-plus"/>&nbsp;&nbsp;Create snapshot</Button>
                            </Col>
                            <Col md={2} className="child">
                                <Badge id="consoleButton" className="button--moema clickable button--size-s" onClick={this.consoleHandler.bind(this)}> {this.state.device}</Badge>
                            </Col>
                            <Col md={5} className="child">
                                <Form.Group className="rightAligned">
                                    <Button variant={this.state.showDiff ? "light" : "outline-light"}
                                            onClick={this.showDiff.bind(this)}>
                                        <i className="fas fa-exchange-alt"/>&nbsp;&nbsp;{this.state.showDiff ? 'Hide Diff' : 'Show Diff'}
                                    </Button>
                                    <Button variant="outline-light" onClick={this.dryRun.bind(this)}>
                                        <i className="fas fa-play"/>&nbsp;&nbsp;Dry run</Button>
                                    <Button variant="outline-light" onClick={this.commitToNetwork.bind(this)}>
                                        {this.state.commiting ? <Spinner size="sm" animation="border"/> : <i className="fas fa-network-wired"/>}
                                        &nbsp;&nbsp;Commit to network</Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Container>
                </header>

                {this.state.creatingSnap ? <SnapshotModal snapHandler={this.createSnapshot.bind(this)} device={this.state.device}/> : null }
                {this.state.alertType ? <CustomAlerts alertType={this.state.alertType}/> : null}
                {this.state.showConsole ? <ConsoleModal consoleHandler={this.consoleHandler.bind(this)}
                                                        content={this.state.console}
                                                        operation={this.state.operation}/> : null }
                {this.state.dryRunOutput ?
                    <Container fluid className="container-props">
                        <div className={this.state.dryRunResult ? "dryRunOutput dryRunSuccess" : "dryRunOutput dryRunFail"}>
                            <h2 style={{marginTop: "5px"}}>Dry run output</h2>
                            {this.state.dryRunOutput}
                            <br/>
                            <Button onClick={this.clearDryRun.bind(this)}>Close</Button>
                        </div>
                    </Container> : null}
                <Container fluid className="container-props">
                    <div className="editor">
                        <div className="uniconfig">
                            <div className="config">
                                {this.state.initializing ?
                                    <i className="fas fa-sync fa-spin fa-8x"
                                       style={{margin: '40%', color: 'lightblue'}}/>
                                    :
                                    <Editor title="Intended Configuration" editable={true} deviceName={this.state.device}
                                            updateConfig={this.updateConfig.bind(this)}
                                            wfs={JSON.parse(configJSON)}
                                            refreshConfig={this.refreshConfig.bind(this)}/>
                                }
                            </div>
                            <div className="operational">
                                {this.state.initializing ?
                                    <i className="fas fa-sync fa-spin fa-8x"
                                       style={{margin: '40%', color: 'lightblue'}}/>
                                    :
                                    operational()
                                }
                            </div>
                        </div>
                    </div>
                </Container>
            </div>




      );
    }
}

export default DeviceView;
