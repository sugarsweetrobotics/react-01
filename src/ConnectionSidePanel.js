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
        let instanceName = this.state.connection.name;
        let titleIsActive = this.state.titleIsActive;
        let connectionType = this.state.connection.type;
        let connectionInput = this.state.connection.input.info.instanceName;
        let connectionInputTarget = this.state.connection.input.target.name;
        let connectionOutput = this.state.connection.output.info.instanceName;
        return (
            <div className="connection-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: "#b3ffd5"}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                    >
                        <Icon name="dropdown"></Icon>
                        {instanceName}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive}>
                        <div style={{marginLeft: 10, color: "white"}}>
                            <div>type</div>
                            <div style={{marginLeft: 10}}>{connectionType}</div>
                            <div>input</div>
                            <div style={{marginLeft: 10}}>{connectionInput}</div>
                            <div style={{marginLeft: 10}}>target: {connectionInputTarget}</div>
                            <div>output</div>
                            <div style={{marginLeft: 10}}>{connectionOutput}</div>
                        </div>

                    </Accordion.Content>
                </Accordion>
            </div>
            );
    }
}