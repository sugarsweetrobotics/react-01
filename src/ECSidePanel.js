import React from 'react';
import {valueIsError} from "./nerikiri";
import {Icon,  Accordion} from 'semantic-ui-react';
import OperationSidePanel from "./OperationSidePanel";

export default class ECSidePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            process: props.process,
            ec: props.ec,
            titleIsActive: false,
            operationIsActive: false
        };



    }


    operationPanels() {
        return this.state.ec.boundOperations.map((op, i) => {
            return (<OperationSidePanel process={this.state.process} operation={op} key={i} useFullName={true}/>);
        });
    }

    render() {
        let instanceName = this.state.ec.instanceName;
        let titleIsActive = this.state.titleIsActive;
        let operationIsActive = this.state.operationIsActive;
        return (
            <div className="process-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     draggable={true}
                                     onDragStart={(e) => {

                                         let data = {
                                             type: 'ec',
                                             processUrl: this.state.process.url(),
                                             model: this.state.ec,
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
                        {/* Operations */}
                        <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                            <Accordion.Title index={1}
                                             active={operationIsActive}
                                             onClick={()=>{this.setState({operationIsActive: !this.state.operationIsActive})}}
                                             style={{padding: 0, marginBottom: 0}}
                            >
                                <Icon name="dropdown"></Icon>
                                {"Operations"}
                            </Accordion.Title>
                            <Accordion.Content  style={{padding: 0, marginTop: 0, marginLeft: 0}} active={operationIsActive}>
                                {this.operationPanels()}
                            </Accordion.Content>
                        </Accordion>
                    </Accordion.Content>
                </Accordion>
            </div>
        );
    }

}