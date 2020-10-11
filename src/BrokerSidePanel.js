import React from 'react';
//import {valueIsError} from "./nerikiri";
import {Icon,  Accordion} from 'semantic-ui-react';
//import OperationSidePanel from "./OperationSidePanel";

export default class BrokerSidePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            process: props.process,
            broker: props.broker,
            titleIsActive: false,
        };
    }


    render() {
        let instanceName = this.state.broker.fullName;
        let titleIsActive = this.state.titleIsActive;
        return (
            <div className="process-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: "white"}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                    >
                        <Icon name="dropdown"></Icon>
                        {instanceName}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive}>
                        {this.props.broker.name}
                    </Accordion.Content>
                </Accordion>
            </div>
        );
    }

}