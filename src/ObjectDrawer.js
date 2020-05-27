import {drawEllipse, drawRect, drawText} from "./Drawing";
//import {includes, distanceToLine, offset, rotate, translate} from "./Dimension";


export function drawVM(drawer, ctx, vm) {
    if (vm.type === 'ec') {
        return drawECStates(drawer, ctx, vm);
    }
    let color = '#00fcf4';
    if (vm.type === 'container') {
        color = '#00fcf4';
        drawRect(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'operation') {
        color = '#fff900';
        color = '#ff0000';
        drawEllipse(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'container_operation') {
        let color = '#00ff29';
        drawEllipse(ctx, vm.position, vm.size, color);
    }

    let text = vm.model.model.instanceName;
    drawText(ctx, text, {x: vm.position.x, y: vm.position.y + 10}, color);
}


export function drawEC(drawer, ctx, vm) {
    if (vm.type !== 'ec') {
        return;
    }
    let color = '#fff900';
    drawRect(ctx, vm.position, vm.size,color);
    let text = vm.model.model.instanceName;
    drawText(ctx, text, {x: vm.position.x, y: vm.position.y - vm.size.height /4}, color);
}

export function drawECStates(drawer, ctx, vm) {
    let color = '#fff900';
    let padding = 15;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};

    // console.log('EC:', vm.model.model);
    if (vm.model.model.state === 'started') {
        drawRect(ctx, startPos, size, color, {
            fill: false,
            fillColor: 'black',
            stroke: true,
            strokeWidth: 8.0,
        });
        drawText(ctx, "started", startPos, color);


        drawRect(ctx, stopPos, size, color, {
            fill: false,
            fillColor: 'black',
            stroke: true,
            strokeWidth: 4.0,
        });
        drawText(ctx, "stopped", stopPos, color);
    } else {
        drawRect(ctx, startPos, size, color, {
            fill: false,
            fillColor: 'black',
            stroke: true,
            strokeWidth: 4.0,
        });
        drawText(ctx, "started", startPos, color);


        drawRect(ctx, stopPos, size, color, {
            fill: false,
            fillColor: 'black',
            stroke: true,
            strokeWidth: 8.0,
        });
        drawText(ctx, "stopped", stopPos, color);
    }


}
