import React from 'react';
import logo from './logo.svg';
import './App.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css';
//<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
import {Menu, Segment, Sidebar} from 'semantic-ui-react';
import ModelController from "./ModelController";

import Menubar from "./Menubar";
import Sidemenu from "./Sidemenu/Sidemenu";
import MainContent from "./MainContent";


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sidebar_visible: false,
            controller: new ModelController()
        };

        let url = window.location.href;//"http://localhost:3000/";

        this.state.controller.loadProcess(url, (_)=>{
            this.setState({controller: this.state.controller});
        })

    }

    onMenuIconClicked(e) {

        this.setState({sidebar_visible: !this.state.sidebar_visible});
    }

    render() {
        return (
            <div className="App">
                <Sidebar.Pushable as={Segment}>
                    <Sidebar as={Menu}
                             style={{"background-color": "#222a"}}
                             animation='overlay'
                             visible={this.state.sidebar_visible}
                             vertical
                             onHide={()=>{this.setState({sidebar_visible: false})}}
                             >
                        <Sidemenu controller={this.state.controller}></Sidemenu>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <Menubar onMenuIconClicked={this.onMenuIconClicked.bind(this)}></Menubar>
                        <MainContent controller={this.state.controller}/>
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
}