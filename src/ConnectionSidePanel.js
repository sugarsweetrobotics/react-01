import React from 'react';
import {Icon,  Accordion} from 'semantic-ui-react';

export default class ConnectionSidePanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            process: props.process,
            operation: props.operation,
            connection: props.connection,
            titleIsActive: false
        };
    }


    render() {
        console.log('Connection:', this.state.connection);
        let instanceName = this.state.connection.fullName;
        let titleIsActive = this.state.titleIsActive;
        let connectionType = this.state.connection.type;
        let connectionInput = this.state.connection.inlet.ownerFullName;
        let connectionInputTarget = this.state.connection.inlet.name;
        let connectionOutput = this.state.connection.outlet.ownerFullName;
        return (
            <div className="connection-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: "#b3ffd5"}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                    >
                        <Icon name="dropdown"></Icon> {instanceName}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive} style={{padding: 0, marginTop: 0}}>
                        <div style={{marginLeft: 10, color: "white"}}>
                            <div>type</div>
                            <div style={{marginLeft: 10}}>{connectionType}</div>
                            <div>input</div>
                            <div style={{marginLeft: 10}}>{connectionInput} : {connectionInputTarget} </div>
                            <div>output</div>
                            <div style={{marginLeft: 10}}>{connectionOutput}</div>
                        </div>

                    </Accordion.Content>
                </Accordion>
            </div>
            );
    }
}