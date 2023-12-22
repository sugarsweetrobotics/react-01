import React from 'react';
import {Icon, Accordion} from 'semantic-ui-react';
import OperationSidePanel from "./OperationSidePanel";
import ContainerSidePanel from "./ContainerSidePanel";
import ConnectionSidePanel from "../ConnectionSidePanel";
import ECSidePanel from "./ECSidePanel";
import BrokerSidePanel from "../BrokerSidePanel";
import CallbackSidePanel from "../CallbackSidePanel";
import TopicSidePanel from "./ToipicSidePanel";
import FSMSidePanel from "./FSMSidePanel";

export default class SystemSidePanel extends React.Component {

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
            //callbackIsActive: false,
            ecIsActive: true,
            //fsmIsActive: true,
            //topicIsActive: true,
            brokerIsActive: false,
            info: {instanceName: ''},
        };
    }

    processPanels() {
        let process = this.state.controller.getSystems()[this.props.processIndex];
        console.log('processPanels called (process=', process.operations);
        return Object.keys(process.operations).map((op_id, i) => {
            let op = process.operations[op_id];
            return (<OperationSidePanel process={process} operation={op} ownerContainer={null} key={i}/>);
        });
    }

    containerPanels() {
        let s = this.state.controller.getSystems()[this.props.processIndex];
        console.log('containerPanels(', s, ')');
        if (s.containers) {
            return Object.keys(s.containers).map((c_id, i) => {
                let c = s.containers[c_id];
                return (<ContainerSidePanel process={s} container={c} key={i}/>);
            });
        }
    }

    connectionPanels() {
        // console.log('ProcessSidePanel.connectionPanels()');
        let process = this.state.controller.getSystems()[this.props.processIndex];
        return process.connections.map((c, i) => {
            // console.log('connection:', c);
            return (<ConnectionSidePanel process={process} connection={c} key={i}/>);
        });
    }

    ecPanels() {
        let s = this.state.controller.getSystems()[this.props.processIndex];
        console.log('SystemSidePanel.ecPanels(s=', s, ')');
        if (s.ecs) {
            return Object.keys(s.ecs).map((ec_key, i) => {
                let c = s.ecs[ec_key];
                console.log('ECSidePanel for ', c);
                return (<ECSidePanel process={s} ec={c} key={i}/>);
            });
        }
    }

    topicPanels() {
        let process = this.state.controller.getSystems()[this.props.processIndex];
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

        console.log('SystemSidePanel.render()');
        let titleIsActive = this.state.titleIsActive;
        let operationIsActive = this.state.operationIsActive;
        let containerIsActive = this.state.containerIsActive;
        let connectionIsActive = this.state.connectionIsActive;
        let callbackIsActive = this.state.callbackIsActive;
        let ecIsActive = this.state.ecIsActive;
        let fsmIsActive = this.state.fsmIsActive;
        let brokerIsActive = this.state.brokerIsActive;
        let topicIsActive = this.state.topicIsActive;

        let process = this.state.controller.getSystems()[this.props.processIndex];
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
                            {this.processPanels()}
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

                    {/* ECs */}
                    <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                        <Accordion.Title index={3}
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

                </Accordion.Content>
            </Accordion>
        </div>
        );
    }

};