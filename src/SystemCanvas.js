import React from 'react';

import {CanvasDraw, ViewModel} from "./CanvasDraw";

export default class SystemCanvas extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            backgroundColor: '#000000',
            model: new CanvasDraw(props.controller),
        };
    }

    componentDidMount() {
        this.updateCanvas();
        /// on click
        this.canvas.addEventListener('click', (e) => {
            this.setState({model: this.state.model.onClick(e)});
        });
        // on mouse down
        this.canvas.addEventListener('mousedown', (e) => {
            this.setState({model: this.state.model.onMouseDown(e)});
        });
        this.canvas.addEventListener('mousemove', (e) => {
            //this.setState({model: this.state.model.onMouseMove(e)});
            this.state.model.onMouseMove(e, (model) => {
                this.setState({model: model});
            });
        });
        this.canvas.addEventListener('mouseup', (e) => {
            this.setState({model: this.state.model.onMouseUp(e)});
        });
        this.canvas.addEventListener('mouseleave', (e) => {
            this.setState({model: this.state.model.onMouseLeave(e)});
        });
    }


    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        let ctx = this.canvas.getContext('2d');
        this.state.model.clientSize = {width: this.props.width, height: this.props.height};
        this.state.model.backgroundColor = this.state.backgroundColor;
        this.state.model.drawCanvas(ctx);
    }

    render() {
        return (
            <canvas ref={(e) => { this.canvas = e; }} id="system_canvas" width={this.props.width} height={this.props.height}
                    onDragEnter={(e) => {
                        this.setState({backgroundColor: 'yellow'})
                    }}
                    onDragLeave={(e) => {
                        this.setState({backgroundColor: 'white'})
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onDrop={(e) => {
                        this.setState({model: this.state.model.addModel(JSON.parse(e.dataTransfer.getData("application/my-app")), this.state.model.clientPosition(e))});
                        this.setState({backgroundColor: 'black'})
                    }}/>
        )
    }
}