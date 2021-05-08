import React from 'react';
import {valueIsError} from "./nerikiri";
import {Icon,  Accordion} from 'semantic-ui-react';
import OperationSidePanel from "./Sidemenu/OperationSidePanel";
import ConnectionSidePanel from "./ConnectionSidePanel";

export default class TopicSidePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            process: props.process,
            topic: props.topic,
            titleIsActive: false,
            connectionIsActive: false
        };
    }

    inputConnectionPanels(key) {
        if (this.props.topic.connections === undefined) return null;
        if (this.props.topic.connections.input[key].length === 0) return (<div style={{marginLeft: 10}}>[]</div>)
        return this.props.topic.connections.input[key].map((c, i) => {
            return (
                <ConnectionSidePanel process={this.state.process} connection={c} operation={this.props.topic}
                                     key={i}/>);
        });
    }

    inputConnectionPanelsAll() {
        if (this.props.topic.connections === undefined) return null;

        if (this.props.topic.connections.input.length === 0) return (<div style={{marginLeft: 10}}>[]</div>)

        let cons = [];
        let i = 0;
        //console.log(this.props.topic);
        for(let key in this.props.topic.connections.input) {
            if (key === '__ERROR__') return;
            cons.push(
                (<div style={{marginLeft: 10}} key={i}>
                    <div>{key}</div>
                    <div>{this.inputConnectionPanels(key)}</div>
                </div>)
            );
            i++;
        }
        return cons;
    }

    outputConnectionPanelsAll() {
        if (this.props.topic.connections === undefined) return null;

        if (this.props.topic.connections.output.length === 0) return (<div style={{marginLeft: 10}}>[]</div>)
        return this.props.topic.connections.output.map((c, i) => {
            return (<ConnectionSidePanel process={this.state.process} connection={c} operation={this.props.topic} key={i}/>);
        });
    }

    render() {
        let instanceName = this.state.topic.fullName;
        let titleIsActive = this.state.titleIsActive;
        let connectionIsActive = this.state.connectionIsActive;
        return (
            <div className="process-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: '#fda6fd'}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     draggable={true}
                                     onDragStart={(e) => {

                                         let data = {
                                             type: 'topic',
                                             processUrl: this.state.process.url(),
                                             model: this.state.topic,
                                             ///operations: this.state.ec.boundOperations
                                         };
                                         e.dataTransfer.setData("application/my-app", JSON.stringify(data));
                                         e.dataTransfer.dropEffect = "move";

                                     }}
                    >
                        <Icon name="dropdown"></Icon>
                        {instanceName}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive}>
                        {/* Connections */}
                        <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                            <Accordion.Title index={1}
                                             active={connectionIsActive}
                                             onClick={()=>{this.setState({connectionIsActive: !this.state.connectionIsActive})}}
                                             style={{padding: 0, marginBottom: 0, color: '#ff0fff'}}
                            >
                                <Icon name="dropdown"></Icon>
                                {"Connections"}
                            </Accordion.Title>
                            <Accordion.Content  style={{padding: 0, marginTop: 0, marginLeft: 10}} active={connectionIsActive}>
                                <div>Input</div>
                                <div>
                                    {this.inputConnectionPanelsAll()}
                                </div>
                                <div>Output</div>
                                <div style={{marginLeft: 10}}>
                                    {this.outputConnectionPanelsAll()}
                                </div>
                            </Accordion.Content>
                        </Accordion>
                    </Accordion.Content>
                </Accordion>
            </div>
        );
    }

}