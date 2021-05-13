import {drawEllipse, drawRect, drawText} from "./Drawing";
import {colors} from './VMColors';
//import {includes, distanceToLine, offset, rotate, translate} from "./Dimension";

const drawFunction = {
    'Operation': (drawer, ctx, vm, color) => drawEllipse(ctx, vm.position, vm.size, color),
    'Container': (drawer, ctx, vm, color) => drawRect(ctx, vm.position, vm.size, color),
    'Topic': (drawer, ctx, vm, color) => drawEllipse(ctx, vm.position, vm.size, color),
    'ExecutionContext': (drawer, ctx, vm, color) => {
        //drawRect(ctx, vm.position, vm.size, color);
        drawECStates(drawer, ctx, vm);
    },
    'FSM': (drawer, ctx, vm, color) => {
        //drawRect(ctx, vm.position, vm.size, color);
        drawFSMStates(drawer, ctx, vm);
    }
}

export function drawVM(drawer, ctx, vm) {
    if (vm.type === 'ec') {
        return drawECStates(drawer, ctx, vm);
    } else if (vm.type === 'fsm') {
        return drawFSMStates(drawer, ctx, vm);
    }
    let color = '#00fcf4';
    if (vm.model.info.typeName === '_FSMContainerStruct') {
        drawFunction[vm.model.info.typeName](ctx, vm.position, vm.size, colors[vm.model.info.typeName]);
    } else
    if (vm.model.info.typeName === '_ECContainerStruct') {
        drawFunction[vm.model.info.typeName](ctx, vm.position, vm.size, colors[vm.model.info.typeName]);
    } else if (vm.type === 'callback') {
        color = '#ffffff';
        drawEllipse(ctx, vm.position, vm.size, color);
    } else {
        drawFunction[vm.model.info.className](drawer, ctx, vm, colors[vm.model.info.className]);
    }

    let text = vm.model.info.fullName;
    if (vm.type === 'callback') text = vm.model.model.name;
    drawText(ctx, text, {x: vm.position.x, y: vm.position.y - vm.size.height/2 + 40}, colors[vm.model.info.className]);
}


export function drawEC(drawer, ctx, vm) {
    if (vm.type !== 'ExecutionContext') {
        return;
    }
    let color = '#fff900';
    drawRect(ctx, vm.position, vm.size,color);
    //let text = vm.modelName;
    //drawText(ctx, text, {x: vm.position.x, y: vm.position.y - vm.size.height /4}, color);
}




export function drawECStates(drawer, ctx, vm) {
    let color = '#fff900';
    let padding = 15;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};
    drawRect(ctx, startPos, size, color, {
        fill: false,
        fillColor: 'black',
        stroke: true,
        strokeWidth: vm.model.ec_state === 'started' ? 8.0 : 4.0,
    });
    drawText(ctx, "started", startPos, color);


    drawRect(ctx, stopPos, size, color, {
        fill: false,
        fillColor: 'black',
        stroke: true,
        strokeWidth: vm.model.ec_state === 'stopped' ? 8.0 : 4.0,
    });
    drawText(ctx, "stopped", stopPos, color);

}


export function drawFSM(drawer, ctx, vm) {
    if (vm.type !== 'FSM') {
        return;
    }
    let color = '#a2ff00';
    drawRect(ctx, vm.position, vm.size,color);
    //let text = vm.model.model.instanceName;
    //drawText(ctx, text, {x: vm.position.x, y: vm.position.y - vm.size.height /4}, color);
}

export function drawFSMStates(drawer, ctx, vm) {
    console.info('ObjectDrawer.drawFSMState ', vm);
    let color = '#a2ff00';
    let padding = 15;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};
    let stride = size.height + padding;

    vm.model.states.forEach((state, i) => {
        let pos = startPos;
        if (i % 2 != 0) {
            pos = stopPos;
        }
        let lineWidth = 4.0;
        if (state === vm.model.fsm_state) {
            lineWidth = 8.0;
        }
        drawRect(ctx, pos, size, color, {
            fill: false,
            fillColor: 'black',
            stroke: true,
            strokeWidth: lineWidth,
        });
        drawText(ctx, state, pos, color);

        if (i % 2 != 0) {
            startPos.y += stride;
            stopPos.y += stride;
        }
    });
}
