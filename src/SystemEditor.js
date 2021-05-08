import React from 'react';
import SystemCanvas from "./SystemCanvas";

export default class SystemEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            clientWidth: 800,
            clientHeight: 800
        };
    }

    pack() {
        if (this.frame !== null)
        this.setState({
            clientWidth: this.frame.clientWidth,
            clientHeight: this.frame.clientHeight
        })
    }

    componentDidMount() {
        window.addEventListener('resize', this.pack.bind(this));
        window.addEventListener('load', this.pack.bind(this));
        this.pack();
    }


    render() {
        return (
            <div ref={(e) => { this.frame = e; }}
                 className="system-editor"
                 style={{width: "100%", height: "100vh", textAlign: 'left'}}
            >
                <SystemCanvas controller={this.props.controller}
                    width={this.state.clientWidth}
                              height={this.state.clientHeight}/>
            </div>
        );
    }
}