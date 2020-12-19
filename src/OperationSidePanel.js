import React from 'react';
import {valueIsError} from "./nerikiri";
import {Icon,  Accordion} from 'semantic-ui-react';
import ConnectionSidePanel from "./ConnectionSidePanel";

export default class OperationSidePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            process: props.process,
            operation: props.operation,
            ownerContainer: props.ownerContainer,
            titleIsActive: false,
            iconize: false,
            useFullName: props.useFullName
        };

    }

    renderIcon() {
        return (
            <Icon name="copy outline"></Icon>
        );
    }

    inputConnectionPanels(key, i) {
        if (this.props.operation.inlets === undefined) return null;
        if (this.props.operation.inlets[i].connections.length === 0) return (<div style={{marginLeft: 10}}>[]</div>)
        return this.props.operation.inlets[i].connections.map((c, j) => {
            return (
                <ConnectionSidePanel process={this.state.process} connection={c} operation={this.props.operation}
                                     key={j}/>);
        });
    }

    inputConnectionPanelsAll() {
        if (this.props.operation.inlets === undefined) return null;

        if (this.props.operation.inlets.length === 0) return (<div style={{marginLeft: 10}}>[]</div>)

        let cons = [];
        let i = 0;
        this.props.operation.inlets.forEach((k, i) => {
//        for(let key in this.props.operation.inlets) {
            let key = k.name;
            cons.push(
                (<div style={{marginLeft: 10}} key={i}>
                    <div>{key}</div>
                    <div>{this.inputConnectionPanels(key, i)}</div>
                </div>)
            );
            i++;
        });
        return cons;
    }

    outputConnectionPanelsAll() {
        if (this.props.operation.outlet=== undefined) return null;
        if (this.props.operation.outlet.connections === undefined) return null;

        if (this.props.operation.outlet.connections.length === 0) return (<div style={{marginLeft: 10}}>[]</div>)
        return this.props.operation.outlet.connections.map((c, i) => {
            return (<ConnectionSidePanel process={this.state.process} connection={c} operation={this.props.operation} key={i}/>);
        });
    }

    render() {
        let instanceName = this.props.operation.fullName;

        if (this.props.useFullName) {

            if (this.props.operation.ownerContainerInstanceName !== undefined) {
                instanceName = this.props.operation.ownerContainerInstanceName + ':' + instanceName;
            }
        }

        let titleIsActive = this.state.titleIsActive;
        let connectionIsActive = this.state.connectionIsActive;
        if (this.state.iconize) {
            return this.renderIcon();
        }

        return (
            <div className="process-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: '#ff9174'}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     draggable={true}
                                     onDragStart={(e) => {
                                         let data = {
                                             type: 'operation',
                                             processUrl: this.state.process.url(),
                                             model: this.props.operation,
                                             //connections: this.props.operation.connections
                                         };
                                         if (this.state.operation.ownerContainerInstanceName !== undefined) {
                                             data.type = 'container_operation';
                                             data.ownerContainer = this.props.ownerContainer;
                                         }
                                         e.dataTransfer.setData("application/my-app", JSON.stringify(data));
                                         e.dataTransfer.dropEffect = "move";
                                     }}
                    >
                        <Icon name="dropdown"></Icon>
                        {instanceName}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive} style={{padding: 0, marginTop: 0}}>
                        {/* Connections */}
                        <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                            <Accordion.Title index={1}
                                             active={connectionIsActive}
                                             onClick={()=>{this.setState({connectionIsActive: !this.state.connectionIsActive})}}
                                             style={{padding: 0, marginBottom: 0, color: '#ff9174'}}
                            >
                                <Icon name="dropdown"></Icon>
                                {"Connections"}
                            </Accordion.Title>
                            <Accordion.Content  style={{padding: 0, marginTop: 0, marginLeft: 10, color: "white"}} active={connectionIsActive}>
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


OperationSidePanel.defaultProps = {
    useFullName: false, // デフォルトはチェックボックスにチェックを入れない
};