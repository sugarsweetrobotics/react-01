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

        /*
        this.state.process.containerOperationInfos(props.container).then((infos)=>{
            infos.forEach((operation) => {
                this.state.process.connectionInfos(operation).then((infos)=> {
                    if (!valueIsError(infos)) {

                        let data = {
                            type: 'container_operation',
                            processUrl: this.state.process.url(),
                            model: operation,
                            connections: infos,
                            ownerContainer: this.props.container
                        };
                        this.state.operationDataSet.push(data);
                        this.setState({operationDataSet: this.state.operationDataSet});
                    }
                });
            })
            this.setState({operations: infos})
        });
        */
    }

    operationPanels() {
        return this.state.container.operations.map((op, i) => {
            return (<OperationSidePanel process={this.state.process} operation={op} ownerContainer={this.props.container} key={i}/>);
        });
    }

    render() {
        let instanceName = this.state.container.info.fullName;
        let titleIsActive = this.state.titleIsActive;
        let operationIsActive = this.state.operationIsActive;
        //let url = this.state.process.url();
        return (
            <div className="process-in-sidemenu" style={{textAlign: "left", marginTop: 0, padding: 0}}

            >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: '#a6fafd'}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     draggable={true}
                                     onDragStart={(e) => {
                                         let data = {
                                             type: 'container',
                                             processUrl: this.state.process.url(),
                                             model: this.state.container,
                                             //operations: this.state.operationDataSet
                                         };
                                         e.dataTransfer.setData("application/my-app", JSON.stringify(data));
                                         e.dataTransfer.dropEffect = "move";
                                     }}
                    >
                        <Icon name="dropdown"></Icon>
                        {instanceName}
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