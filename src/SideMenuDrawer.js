import {drawEllipse, drawPi, drawText} from "./Drawing";


export function drawLeftSideMenu(drawer, ctx) {

    // console.log('drawLeftSideMenu()', ctx);

    let rotateAngle = drawer.leftSideMenuRotateAngle;

    let color = '#00ffec';
    let center = {
        x: -drawer.canvasOffset.x,
        y: -drawer.canvasOffset.y + ctx.canvas.clientHeight / 2
    };
    let option = {
        fill: false,
        lineWidth: 3.0
    };

    drawEllipse(ctx, center, {
        width: 100,
        height: 100
    }, color, option)

    drawEllipse(ctx, center, {
        width: 300,
        height: 300
    }, color, option)

    let nMenu = 6;
    let leftSideMenuButtons_ = [];

    let drawIcon = (text, angle) => {
        drawPi(ctx, center, 140, -Math.PI/ nMenu + rotateAngle + angle + 0.05, Math.PI/ nMenu + rotateAngle + angle - 0.05, color, {
            innerRadius: 60,
            fill: false,
            lineWidth: 3.0
        });
        let t = ctx.getTransform();
        let tcenter = {
            x: 0,
            y: ctx.canvas.clientHeight / 2
        }
        ctx.setTransform(1, 0, 0, 1, tcenter.x, tcenter.y);
        ctx.rotate(rotateAngle + angle);
        ctx.fillStyle = '#a7f8ff';
        let width = ctx.measureText(text).width;
        ctx.fillText( text, 100 - width/2, 0);
        ctx.rotate(-rotateAngle);
        ctx.setTransform(t);

        drawer.leftSideMenuButtons.forEach( (btn) => {
            if (btn.name === text) {
                if (btn.clicked) {
                    ///console.log(drawer.controller.processes[0].props);
                    if (btn.name === "ECs") {
                        console.log('ECs');
                       console.log(drawer.controller.processes[0].props.ecs);
                    }
                }
            }
        });

        leftSideMenuButtons_.push({
            angleMin: -Math.PI/ nMenu + rotateAngle + angle + 0.05,
            angleMax: Math.PI/ nMenu + rotateAngle + angle - 0.05,
            innerR: 60,
            outerR: 140,
            name: text
        })
    }

    drawIcon('Processes', -3*Math.PI/nMenu*2);
    drawIcon('Operations', -2*Math.PI/nMenu*2);
    drawIcon('Containers', -Math.PI/nMenu*2);
    drawIcon('Topics', 0);
    drawIcon('ECs', Math.PI/nMenu*2);
    drawIcon('Callbacks', 2*Math.PI/nMenu*2);
    drawer.leftSideMenuButtons = leftSideMenuButtons_;

}