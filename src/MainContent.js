import React from 'react';
import SystemEditor from "./SystemEditor";

export default class MainContent extends React.Component {


    render() {
        return (<div id={"main_content"} style={{height: "100vh"}}>
                <SystemEditor controller={this.props.controller}/>
            </div>
        );

    }
}

