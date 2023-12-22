import React from 'react';
import {Icon, Accordion} from 'semantic-ui-react';
import OperationSidePanel from "./OperationSidePanel";
import {valueIsError} from "../nerikiri";


export default class ContainerSidePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            process: props.process,
            container: props.container,
            titleIsActive: false,
            operationIsActive: false,
            operations: [],
            operationDataSet: []
        };
    }

    operationPanels() {
        console.log('ContainerSidePanel.operationPanels(', this.state.container, ')');
        if (this.state.container.container_processes) {
            return Object.keys(this.state.container.container_processes).map((op_key, i) => {
                let op = this.state.container.container_processes[op_key];
                console.log('op', op);
                return (<OperationSidePanel process={this.state.process} operation={op} ownerContainer={this.props.container} key={i}/>);
            });
        }
    }

    onDragStart(e) {
        e.dataTransfer.setData("application/my-app", JSON.stringify(this.props.container));
        e.dataTransfer.dropEffect = "move";
    }

    render() {
        let instanceName = this.state.container.identifier;
        let titleIsActive = this.state.titleIsActive;
        let operationIsActive = this.state.operationIsActive;
        //let url = this.state.process.url();
        return (

            <div className="container-in-sidemenu">
                <Accordion>
                    <Accordion.Title active={this.state.titleIsActive} draggable={true}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     onDragStart={this.onDragStart.bind(this)} >
                        <Icon name="dropdown"></Icon>
                        {this.props.container.identifier}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive} style={{padding: 0, marginTop: 0}}>

                        {/* Operations */}
                        <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10, color:'#a6fafd'}}>
                            <Accordion.Title index={1}
                                             active={operationIsActive}
                                             onClick={()=>{this.setState({operationIsActive: !this.state.operationIsActive})}}
                                             style={{padding: 0, marginBottom: 0, color: '#a6fafd'}}
                            >
                                <Icon name="dropdown"></Icon>
                                {"Operations"}
                            </Accordion.Title>
                            <Accordion.Content  style={{padding: 0, marginTop: 0}} active={operationIsActive}>
                                {this.operationPanels()}
                            </Accordion.Content>
                        </Accordion>
                    </Accordion.Content>
                </Accordion>
            </div>
        );
    }

}