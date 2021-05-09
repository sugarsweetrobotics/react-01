import React from 'react';
import {valueIsError} from "../nerikiri";
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
        //return this.state.ec.boundOperations.map((op, i) => {
        //    return (<OperationSidePanel process={this.state.process} operation={op} key={i} useFullName={true}/>);
        //});
    }

    onDragStart(e) {
        e.dataTransfer.setData("application/my-app", JSON.stringify(this.props.ec));
        e.dataTransfer.dropEffect = "move";
    }


    render() {
        return (
            <div className="ec-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10, color: "white"}}>
                    <Accordion.Title active={this.state.titleIsActive} draggable={true}
                                     style={{padding: 0, marginBottom: 0, color: "#fdff85"}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     onDragStart={this.onDragStart.bind(this)} >
                        <Icon name="dropdown"></Icon>
                        {this.props.ec.info.fullName}
                    </Accordion.Title>
                    <Accordion.Content active={this.state.titleIsActive}>
                        {/* Operations */}
                        <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                            <Accordion.Title active={this.state.operationIsActive}
                                             onClick={()=>{this.setState({operationIsActive: !this.state.operationIsActive})}}
                                             style={{padding: 0, marginBottom: 0, color: "#fdff85"}}
                            >
                                <Icon name="dropdown"></Icon>
                                {"Operations"}
                            </Accordion.Title>
                            <Accordion.Content  style={{padding: 0, marginTop: 0, marginLeft: 0}} active={this.state.operationIsActive}>
                                {this.operationPanels()}
                            </Accordion.Content>
                        </Accordion>
                    </Accordion.Content>
                </Accordion>
            </div>
        );
    }

}