import React from 'react';
import {Icon,  Accordion} from 'semantic-ui-react';

export default class CallbackSidePanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            process: props.process,
            titleIsActive: false
        };
    }

    getOnStarted() {
        let info = [];
        this.props.process.props.callbacks.forEach((callback) => {
           if (callback.name === "on_started") {
               callback.target.forEach((tgt, i) => {
                  info.push((<div className={"callback-in-sidemenu"} key={i} style={{textAlign: "left", marginLeft: 10}} >{tgt.name}</div>))
               });
           }
        });
        return info;
    }

    render() {
        let titleIsActive = this.state.titleIsActive;
        return (
            <div className="connection-in-sidemenu" style={{textAlign: "left"}} >
                <Accordion style={{padding: 0, marginTop: 0, marginLeft: 10}}>
                    <Accordion.Title index={0}
                                     active={titleIsActive}
                                     style={{padding: 0, marginBottom: 0, color: "white"}}
                                     onClick={()=>{this.setState({titleIsActive: !this.state.titleIsActive})}}
                                     draggable={true}
                                     onDragStart={(e) => {
                                        let info = [];
                                        this.props.process.props.callbacks.forEach((cb) => {
                                            if (cb.name === "on_started") {
                                                info = cb;
                                            }
                                        });
                                         let data = {
                                             type: 'callback',
                                             processUrl: this.state.process.url(),
                                             model: info,
                                         };
                                         e.dataTransfer.setData("application/my-app", JSON.stringify(data));
                                         e.dataTransfer.dropEffect = "move";

                                     }}

                    >
                        <Icon name="dropdown"></Icon>
                        {"on_started"}
                    </Accordion.Title>
                    <Accordion.Content active={titleIsActive}>
                        {this.getOnStarted()}
                    </Accordion.Content>
                </Accordion>
            </div>
            );
    }
}