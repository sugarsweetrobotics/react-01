import React from 'react';
import {Icon, Accordion} from 'semantic-ui-react';
import OperationSidePanel from "./OperationSidePanel";
import ContainerSidePanel from "./ContainerSidePanel";
import ConnectionSidePanel from "../ConnectionSidePanel";
import ECSidePanel from "./ECSidePanel";
import BrokerSidePanel from "../BrokerSidePanel";
import CallbackSidePanel from "../CallbackSidePanel";
import TopicSidePanel from "./ToipicSidePanel";
import FSMSidePanel from "../FSMSidePanel";

export default class ProcessSidePanel extends React.Component {

    constructor(props) {
        super(props);
        console.log('ProcessSidePanel');
        this.state = {
            controller: props.controller,
            processIndex: -1,
            titleIsActive: true,
            operationIsActive: true,
            containerIsActive: true,
            connectionIsActive: false,
            callbackIsActive: false,
            ecIsActive: true,
            fsmIsActive: true,
            topicIsActive: true,
            brokerIsActive: false,
            info: {instanceName: ''},
        };
    }

    operationPanels() {
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return process.operations.map((op, i) => {
            return (<OperationSidePanel process={process} operation={op} ownerContainer={null} key={i}/>);
        });
    }

    containerPanels() {
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return process.containers.map((c, i) => {
            return (<ContainerSidePanel process={process} container={c} key={i}/>);
        });
    }

    connectionPanels() {
        // console.log('ProcessSidePanel.connectionPanels()');
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return process.connections.map((c, i) => {
            // console.log('connection:', c);
            return (<ConnectionSidePanel process={process} connection={c} key={i}/>);
        });
    }

    ecPanels() {
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return process.ecs.map((c, i) => {
            return (<ECSidePanel process={process} ec={c} key={i}/>);
        });
    }

    topicPanels() {
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return process.topics.map((c, i) => {
            return (<TopicSidePanel process={process} topic={c} key={i}/>);
        });
    }

    fsmPanels() {
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return process.fsms.map((c, i) => {
            return (<FSMSidePanel process={process} fsm={c} key={i}/>);
        });
        return null;
    }

    brokerPanels() {
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        // console.log(process.props.brokers);
        return process.brokers.map((c, i) => {
            return (<BrokerSidePanel process={process} broker={c} key={i}/>);
        });
    }

    callbackPanels() {
        /*
        let process = this.state.controller.getProcesses()[this.props.processIndex];
        return (<CallbackSidePanel process={process} />);
        
         */
    }

    render() {

        // console.log('ProcessSidePanel.render()');
        let titleIsActive = this.state.titleIsActive;
        let operationIsActive = this.state.operationIsActive;
        let containerIsActive = this.state.containerIsActive;
        let connectionIsActive = this.state.connectionIsActive;
        let callbackIsActive = this.state.callbackIsActive;
        let ecIsActive = this.state.ecIsActive;
        let fsmIsActive = this.state.fsmIsActive;
        let brokerIsActive = this.state.brokerIsActive;
        let topicIsActive = this.state.topicIsActive;

        let process = this.state.controller.getProcesses()[this.props.processIndex];
        let url = process.url();
        return (
        <div className="process-in-sidemenu" style={{textAlign: "left", color: "#00ffe8"}}>
            <Accordion style={{padding: 0, marginTop: 0}}>
                <Accordion.Title index={0}
                                 active={titleIsActive}
                                 style={{padding: 0, marginBottom: 0, color: "#a8f3e9"}}
                                 onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}} >
                    <Icon name="dropdown"></Icon>
                    {"Process(" + url+ ")"}
                </Accordion.Title>
                <Accordion.Content active={titleIsActive}>
                    {/* Operations */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={1}
                                         active={operationIsActive}
                                         onClick={()=>{this.setState({operationIsActive: !this.state.operationIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: '#ff9174'}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"Operations"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0, color: '#ff9174'}} active={operationIsActive}>
                            {this.operationPanels()}
                        </Accordion.Content>
                    </Accordion>

                    {/* Containers */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={2}
                                         active={containerIsActive}
                                         onClick={()=>{this.setState({containerIsActive: !this.state.containerIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color:  '#a6fafd'}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"Containers"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={containerIsActive}>
                            {this.containerPanels()}
                        </Accordion.Content>
                    </Accordion>

                    {/* Topics */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={4}
                                         active={topicIsActive}
                                         onClick={()=>{this.setState({topicIsActive: !this.state.topicIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: '#fda6fd'}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"Topics"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={topicIsActive}>
                            {this.topicPanels()}
                        </Accordion.Content>
                    </Accordion>

                    {/* FSMs */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={5}
                                         active={fsmIsActive}
                                         onClick={()=>{this.setState({fsmIsActive: !this.state.fsmIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: "#6cf17e"}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"FSMs"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={fsmIsActive}>
                            {this.fsmPanels()}
                        </Accordion.Content>
                    </Accordion>

                    {/* ECs */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={6}
                                         active={ecIsActive}
                                         onClick={()=>{this.setState({ecIsActive: !this.state.ecIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: "#fdff85"}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"ECs"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={ecIsActive}>
                            {this.ecPanels()}
                        </Accordion.Content>
                    </Accordion>

                    {/* Brokers */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={3}
                                         active={brokerIsActive}
                                         onClick={()=>{this.setState({brokerIsActive: !this.state.brokerIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: "white"}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"Brokers"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={brokerIsActive}>
                            {this.brokerPanels()}
                        </Accordion.Content>
                    </Accordion>

                    {/* Connections */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={4}
                                         active={connectionIsActive}
                                         onClick={()=>{this.setState({connectionIsActive: !this.state.connectionIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: "white"}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"Connections"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={connectionIsActive}>
                            {this.connectionPanels()}
                        </Accordion.Content>
                    </Accordion>


                    {/* Callbacks */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={5}
                                         active={callbackIsActive}
                                         onClick={()=>{this.setState({callbackIsActive: !this.state.callbackIsActive})}}
                                         style={{padding: 0, marginBottom: 0, color: "white"}}
                        >
                            <Icon name="dropdown"></Icon>
                            {"Callbacks"}
                        </Accordion.Title>
                        <Accordion.Content  style={{padding: 0, marginTop: 0}} active={callbackIsActive}>
                            {this.callbackPanels()}
                        </Accordion.Content>
                    </Accordion>
                </Accordion.Content>
            </Accordion>
        </div>
        );
    }

};