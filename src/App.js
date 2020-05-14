import React from 'react';
import logo from './logo.svg';
import './App.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
import 'semantic-ui-css/semantic.min.css';
//<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
import { Header, Icon, Image, Menu, Segment, Sidebar} from 'semantic-ui-react';

import Menubar from "./Menubar";
import Sidemenu from "./Sidemenu";
import MainContent from "./MainContent";


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {sidebar_visible: false};
    }

    onMenuIconClicked(e) {

        this.setState({sidebar_visible: !this.state.sidebar_visible});
    }

    render() {
        return (
            <div className="App">
                <Sidebar.Pushable as={Segment}>
                    <Sidebar as={Menu}
                             inverted
                             animation='overlay'
                             visible={this.state.sidebar_visible}
                             vertical
                             onHide={()=>{this.setState({sidebar_visible: false})}}
                             >
                        <Sidemenu></Sidemenu>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <Menubar onMenuIconClicked={this.onMenuIconClicked.bind(this)}></Menubar>
                        <MainContent />
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </div>
        );
    }
}