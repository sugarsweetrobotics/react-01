import React from 'react';
import {Menu, Button, Icon} from 'semantic-ui-react';
// import process from './nerikiri';
import SystemSidePanel from './SystemSidePanel';
// import ModelController from "./ModelController";

export default class Sidemenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            controller: props.controller,
        };

       this.updateModel();
    }

    updateModel() {
        this.state.controller.setOnUpdateModel(() => {
            this.setState({controller: this.state.controller});
        })
    }

    onAddButtonClicked(e) {
        /*
        let url = window.location.href;//"http://localhost:3000/";
        this.setState({controller: this.state.controller.loadProcess(url)});

         */
    }

    systemPanel() {
        let ps = this.state.controller.getSystems();
        return ps.map((p, i)=> {
            return (<SystemSidePanel key={i} controller={this.props.controller} processIndex={i}></SystemSidePanel>
            );
        })
    }

    onSyncButtonClicked(e) {

    }

    render() {
        return (
            <div className="sidemenu">
                <Menu secondary>
                    <Menu.Item >
                        <span style={{"fontFamily": "hm_tb"}}>System</span>
                    </Menu.Item>

                    <Menu.Menu position={'right'}>
                        <Button icon compact onClick={this.onAddButtonClicked.bind(this)}>
                            <Icon name={'add'}/>
                        </Button>
                        <Button icon compact onClick={this.onSyncButtonClicked.bind(this)}>
                            <Icon name={'sync'}/>
                        </Button>
                    </Menu.Menu>
                </Menu>
                {this.systemPanel()}
            </div>
        );
    }
}