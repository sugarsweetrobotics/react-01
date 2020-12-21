import React from 'react';

import {CanvasDraw} from "./CanvasDraw";

export default class SystemCanvas extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            startup: 0,
            backgroundColor: '#000000',
            model: new CanvasDraw(props.controller, this.updateCanvas.bind(this)),
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
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.setState({model: this.state.model.onMouseDown(e)});
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.setState({model: this.state.model.onMouseUp(e)});
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.setState({model: this.state.model.onMouseMove(e, (model) => {
                this.setState({model: model});
            })});
        });


        let cb = ()=> {
            this.setState({startup: this.state.startup+5})
            this.updateCanvas();
            // console.log(this.state.startup);
            if (this.state.startup <= 100) {
                setTimeout(cb, 30);
            }
        }
        setTimeout(cb, 30);
    }


    componentDidUpdate() {
        this.updateCanvas();
    }

    updateCanvas() {
        let ctx = this.canvas.getContext('2d');

        this.state.model.startup = this.state.startup;
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
                    }}

            />
        )
    }
}