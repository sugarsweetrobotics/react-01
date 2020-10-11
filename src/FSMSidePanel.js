import React from 'react';
import {valueIsError} from "./nerikiri";
import {Icon,  Accordion} from 'semantic-ui-react';
import OperationSidePanel from "./OperationSidePanel";
import ConnectionSidePanel from "./ConnectionSidePanel";

class FSMStatePanel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {this.props.state.name}
            </div>
        )
    }
}

export default class FSMSidePanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            process: props.process,
            fsm: props.fsm,
            titleIsActive: false,
            contentIsActive: false
        };
    }

    statePanels() {
        return this.state.fsm.states.map((stat, i ) => {
            //console.log(stat);
            return <FSMStatePanel key={i} state={stat} fsm={this.state.fsm} />
        });
    }

    render() {
        let instanceName = this.state.fsm.fullName;
        let titleIsActive = this.state.titleIsActive;
        let contentIsActive = this.state.contentIsActive;
        return (
            <div className="process-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10, color: "white"}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: "#6cf17e"}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     draggable={true}
                                     onDragStart={(e) => {

                                         let data = {
                                             type: 'fsm',
                                             processUrl: this.state.process.url(),
                                             model: this.state.fsm
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
                                             active={contentIsActive}
                                             onClick={()=>{this.setState({contentIsActive: !this.state.contentIsActive})}}
                                             style={{padding: 0, marginBottom: 0, color: "#6cf17e"}}
                            >
                                <Icon name="dropdown"></Icon>
                                {"States"}
                            </Accordion.Title>
                            <Accordion.Content  style={{padding: 0, marginTop: 0, marginLeft: 10}} active={contentIsActive}>
                                <div style={{marginLeft: 10}}>
                                    {this.statePanels()}
                                </div>
                            </Accordion.Content>
                        </Accordion>
                    </Accordion.Content>
                </Accordion>
            </div>
        );
    }

}