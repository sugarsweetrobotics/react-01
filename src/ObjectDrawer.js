import {drawEllipse, drawRect, drawText} from "./Drawing";
import {colors} from './VMColors';
//import {includes, distanceToLine, offset, rotate, translate} from "./Dimension";

const drawFunction = {
    'Operation': drawEllipse
}

export function drawVM(drawer, ctx, vm) {
    if (vm.type === 'ec') {
        return drawECStates(drawer, ctx, vm);
    } else if (vm.type === 'fsm') {
        return drawFSMStates(drawer, ctx, vm);
    }
    let color = '#00fcf4';
    if (vm.type === 'container') {
        color = '#00fcf4';
        drawRect(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'container_operation') {
        color = '#00ff29';
        drawEllipse(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'callback') {
        color = '#ffffff';
        drawEllipse(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'topic') {
        color = '#ff0fff';
        drawRect(ctx, vm.position, vm.size, color);
    } else {
        drawFunction[vm.model.info.className](ctx, vm.position, vm.size, colors[vm.model.info.className]);
    }

    let text = vm.model.info.fullName;
    if (vm.type === 'callback') text = vm.model.model.name;
    drawText(ctx, text, {x: vm.position.x, y: vm.position.y + 10}, colors[vm.model.info.className]);
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


export function drawFSM(drawer, ctx, vm) {
    if (vm.type !== 'fsm') {
        return;
    }
    let color = '#a2ff00';
    drawRect(ctx, vm.position, vm.size,color);
    let text = vm.model.model.instanceName;
    drawText(ctx, text, {x: vm.position.x, y: vm.position.y - vm.size.height /4}, color);
}

export function drawFSMStates(drawer, ctx, vm) {
    let color = '#a2ff00';
    let padding = 15;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};
    let stride = size.height + padding;

    vm.model.model.states.forEach((state, i) => {
        let pos = startPos;
        if (i % 2 != 0) {
            pos = stopPos;
        }
        let lineWidth = 4.0;
        if (state.name === vm.model.model.currentState) {
            lineWidth = 8.0;
        }
        drawRect(ctx, pos, size, color, {
            fill: false,
            fillColor: 'black',
            stroke: true,
            strokeWidth: lineWidth,
        });
        drawText(ctx, state.name, pos, color);

        if (i % 2 != 0) {
            startPos.y += stride;
            stopPos.y += stride;
        }
    });
    // console.log('EC:', vm.model.model);
    /*
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
*/

}
