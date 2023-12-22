import {drawArrowToEllipse, drawArrowToRect, drawCircleArrowToEllipse, drawEllipse, drawLine, drawPolygon, drawText} from "./Drawing";
import {rotate, translate, crossingPointLineAndEllipse, crossingPointLineAndRect} from "./Dimension";
import {selectConnectingOperation, selectECBoundedOperations, selectFSMStateBoundedOperations, selectFSMStateBoundedECs} from "../nerikiri";
import {colors} from "./VMColors";

export function drawOperationConnection(drawer, ctx, vm) {
    console.log('drawOperationConnection(', vm, ')');
    if (vm.type !== 'Process' && vm.type !== 'Topic' && vm.type !== "ContainerProcess") { return; }
    let connectedOperations = selectConnectingOperation(vm.model, drawer.viewModels.filter(vm => vm.type === 'Process' || vm.type === 'Topic' || vm.type === 'ContainerProcess').map(vm => vm.model));
    let connectedVMs = drawer.viewModels.filter(vm => connectedOperations.some((op) => vm.model.identifier === op.identifier) );
    console.log(' - connectedOperations: ', connectedOperations);

    connectedVMs.forEach(tgtVm => drawArrowToEllipse(ctx, vm.position, tgtVm, colors[vm.type]));
    Object.keys(vm.model.destination_connections).forEach((con_id)=>{
        let c = vm.model.destination_connections[con_id];
        connectedVMs.forEach(tgtVm => {
            if (c.source_process_identifier === tgtVm.model.identifier) {
                drawer.operationConnections.push({
                        type: "operation_connection",
                        line: {x0: vm.position.x, y0: vm.position.y,
                            x1: tgtVm.position.x, y1: tgtVm.position.y},
                        connection: c
                });
            }
        });
    });
}

export function drawECBindConnection(drawer, ctx, vm) {
    console.info('RelationDraw.drawECBindConnection ', vm);
    if (vm.type !== 'ExecutionContext') { return; }
    const padding = 10;
    const startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let connectedOperations = selectECBoundedOperations(vm.model, drawer.viewModels.filter(vm_ => {
        console.log(' --- vm:', vm_);
        return vm_.type === 'Process' || vm_.type === "ContainerProcess"
    }).map(vm_ => vm_.model));
    console.info(' --- connectedOperations:', connectedOperations);
    connectedOperations.forEach((op) => {
        drawer.viewModels.filter(vm => vm.model.identifier === op.identifier).forEach((tgtVm) => {
            drawArrowToEllipse(ctx, startPos, tgtVm, colors['ExecutionContext']);
        });
    });
}


export function drawContainerConnection(drawer, ctx, vm) {
    if (vm.type !== 'Container') { return; }
    console.info("RelationDraw.drawContainerConnection ", vm);
    drawer.viewModels.filter((tgt) => tgt.type === 'ContainerProcess' && tgt.model.container_identifier === vm.model.identifier)
        .forEach(tgt => drawCircleArrowToEllipse(ctx, vm, tgt, colors['Container']));
}

export function drawFSMBindOperationConnection(drawer, ctx, vm) {
    if (vm.type !== 'FSM') return;
    console.info('RelationDraw.drawFSMBindOperationConnection ', vm);
    const padding = 10;
    const stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    const startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    vm.model.states.forEach((state, i) => {
        let connectedOperations = selectFSMStateBoundedOperations(vm.model, state, drawer.viewModels.filter(tgtVm => tgtVm.type === 'Operation').map(v=>v.model));
        let connectedVMs = drawer.viewModels.filter(vm => connectedOperations.some((op) => vm.model.info.fullName === op.info.fullName) );
        connectedVMs.forEach((tgtVm) => {
            const pos = (i % 2 == 0) ? startPos : stopPos;
            drawArrowToEllipse(ctx, pos, tgtVm, colors['FSM']);
        });
    });
}


export function drawFSMBindECConnection(drawer, ctx, vm) {
    if (vm.type !== 'FSM') return;

    let color = '#a2ff00';
    let padding = 10;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};
    vm.model.states.forEach((state, i) => {
        let pos = startPos;
        if (i % 2 != 0) {
            pos = stopPos;
        }
        ["started", "stopped"].forEach((ec_state,j) => {
            let connectedECs = selectFSMStateBoundedECs(vm.model, state, drawer.viewModels.filter(tgtVm => tgtVm.type === 'ExecutionContext').map(v=>v.model), ec_state);
            let connectedVMs = drawer.viewModels.filter(vm => connectedECs.some((ec) => vm.model.info.fullName === ec.info.fullName) );
            connectedVMs.forEach((tgtVm) => {
                let tgtStopPos = {x:tgtVm.position.x - (tgtVm.size.width-padding*3)/4 - padding/2, y: tgtVm.position.y + tgtVm.size.height/3 - padding};
                let tgtStartPos = {x:tgtVm.position.x + (tgtVm.size.width-padding*3)/4 + padding/2, y: tgtVm.position.y + tgtVm.size.height/3 - padding};
                let tgtSize = {width: (tgtVm.size.width-padding*3)/2, height:tgtVm.size.height/2-padding*3};
                let tgtPos = tgtStartPos;
                if (j % 2 != 0) {
                    tgtPos = tgtStopPos;
                }

                drawArrowToRect(ctx, pos, {position: tgtPos, size: tgtSize}, colors['FSM']);
            });

        });
        /*
        drawer.viewModels.forEach((tgt) => {
            if (tgt.type === 'ec') {
                vm.model.model.states.forEach((state, i)=> {
                    // console.log('state:', state);
                    if (state.boundECStart !== undefined) {
                        state.boundECStart.forEach((ec, j) => {
                            let pos = startPos;
                            if (i % 2 != 0) {
                                pos = stopPos;
                            }


                            let fullName = ec.fullName;

                            if ((tgt.type === 'ec' && fullName === tgt.model.model.fullName)) { //} + ':' + tgt.model.model.instanceName)) {


                                let tgtStopPos = {x:tgt.position.x - (tgt.size.width-padding*3)/4 - padding/2, y: tgt.position.y + tgt.size.height/3 - padding};
                                let tgtStartPos = {x:tgt.position.x + (tgt.size.width-padding*3)/4 + padding/2, y: tgt.position.y + tgt.size.height/3 - padding};
                                let tgtSize = {width: (tgt.size.width-padding*3)/2, height:tgt.size.height/2-padding*3};

                                drawLine(ctx, pos, {
                                    x: tgtStartPos.x,
                                    y: tgtStartPos.y
                                }, color);

                                let line = {
                                    x0: pos.x, y0: pos.y,
                                    x1: tgtStartPos.x, y1: tgtStartPos.y
                                };

                                let point = crossingPointLineAndRect(line, {
                                    x: tgtStartPos.x ,
                                    y: tgtStartPos.y,
                                    width: tgtSize.width,
                                    height: tgtSize.height
                                }, 8);

                                let dx = line.x0 - line.x1;
                                let dy = -(line.y0 - line.y1);
                                let theta = Math.atan2(dy, dx);

                                let points = [
                                    {x: -10, y: 0},
                                    {x: 7, y: 6},
                                    {x: 7, y: -6}
                                ];

                                let newPoints = points.map(
                                    (p) => {
                                        return translate(rotate(p, -theta), point);
                                    }
                                )
                                drawPolygon(ctx, newPoints, color);

                            }
                        });
                    }

                    if (state.boundECStop !== undefined) {
                        state.boundECStop.forEach((ec, j) => {
                            let pos = startPos;
                            if (i % 2 != 0) {
                                pos = stopPos;
                            }
                            let fullName = ec.fullName;

                            if ((tgt.type === 'ec' && fullName === tgt.model.model.fullName)) { //} + ':' + tgt.model.model.instanceName)) {


                                let tgtStopPos = {x:tgt.position.x - (tgt.size.width-padding*3)/4 - padding/2, y: tgt.position.y + tgt.size.height/3 - padding};
                                let tgtStartPos = {x:tgt.position.x + (tgt.size.width-padding*3)/4 + padding/2, y: tgt.position.y + tgt.size.height/3 - padding};
                                let tgtSize = {width: (tgt.size.width-padding*3)/2, height:tgt.size.height/2-padding*3};

                                drawLine(ctx, pos, {
                                    x: tgtStopPos.x,
                                    y: tgtStopPos.y
                                }, color);

                                let line = {
                                    x0: pos.x, y0: pos.y,
                                    x1: tgtStopPos.x, y1: tgtStopPos.y
                                };

                                let point = crossingPointLineAndRect(line, {
                                    x: tgtStopPos.x ,
                                    y: tgtStopPos.y,
                                    width: tgtSize.width,
                                    height: tgtSize.height
                                }, 8);

                                let dx = line.x0 - line.x1;
                                let dy = -(line.y0 - line.y1);
                                let theta = Math.atan2(dy, dx);

                                let points = [
                                    {x: -10, y: 0},
                                    {x: 7, y: 6},
                                    {x: 7, y: -6}
                                ];

                                let newPoints = points.map(
                                    (p) => {
                                        return translate(rotate(p, -theta), point);
                                    }
                                )
                                drawPolygon(ctx, newPoints, color);

                            }
                        });
                    }



                });
            }

         */
        });

}

/*
export function drawTopicConnection(drawer, ctx, vm) {
    let color = '#ff0fff';
    if (vm.type === 'topic') {
        drawer.viewModels.forEach((tgt) => {
            if ( (tgt.type === 'container_operation' || tgt.type === 'operation' ) && vm.model.model.connections) {
                // Topicの出力からOperationに対して線を引く
                if (vm.model.model.connections.output) {
                vm.model.model.connections.output.forEach((c) => {
                    if ((tgt.type === 'operation' && c.input.info.fullName === tgt.model.model.fullName) ||
                        (tgt.type === 'container_operation' && c.input.info.fullName === tgt.model.model.fullName)) { // + ':' + tgt.model.model.instanceName)) {
                        drawLine(ctx, vm.position, tgt.position, color);
                        let line = {
                            x0: vm.position.x, y0: vm.position.y,
                            x1: tgt.position.x, y1: tgt.position.y
                        };
                        /// 描画したConnectionを保存しておく．
                        drawer.operationConnections.push(
                            {
                                type: "operation_connection",
                                line: line,
                                connection: c
                            }
                        );

                        let point = crossingPointLineAndEllipse(line, {
                            width: tgt.size.width,
                            height: tgt.size.height
                        }, 8);


                        let dx = line.x0 - line.x1;
                        let dy = -(line.y0 - line.y1);
                        let theta = Math.atan2(dy, dx);

                        let points = [
                            {x: -10, y: 0},
                            {x: 7, y: 6},
                            {x: 7, y: -6}
                        ];

                        let newPoints = points.map(
                            (p) => {
                                return translate(rotate(p, -theta), point);
                            }
                        )
                        drawPolygon(ctx, newPoints, color);


                        let p = translate(rotate({x: 20, y: -20}, -theta), point);
                        drawText(ctx, c.input.target.name, p, color);

                        //if (c.type === 'event') {
                        //    let p = translate(rotate({x:20, y:20}, -theta), point);
                        //    drawText(ctx, 'e', p, color);
                        //}

                        //let p = translate(rotate({x:20, y:-20}, -theta), point);
                        //drawText(ctx, c.input.target.name, p, color);

                    }
                });
                }
            }
        });
    }
}
*/






export function drawCallbackBindConnection(drawer, ctx, vm) {
    let color = '#ffffff';
    let padding = 10;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x, y: vm.position.y};
    if (vm.type === 'callback') {
        drawer.viewModels.forEach((tgt) => {
            if (tgt.type === 'container_operation' || tgt.type === 'operation') {
                let fullInstanceName = tgt.model.model.instanceName;
                if (tgt.model.model.ownerContainerInstanceName !== undefined) {
                    fullInstanceName = tgt.model.model.ownerContainerInstanceName + ':' + fullInstanceName;
                }
                vm.model.model.target.forEach((op)=> {
                    if ((tgt.type === 'operation' && fullInstanceName === op.name) ||
                        (tgt.type === 'container_operation' && fullInstanceName === op.name)) {

                        drawLine(ctx, startPos, tgt.position, color);

                        let line = {
                            x0: startPos.x, y0: startPos.y,
                            x1: tgt.position.x, y1: tgt.position.y
                        };

                        let point = crossingPointLineAndEllipse(line, {
                            width: tgt.size.width,
                            height: tgt.size.height
                        }, 8);

                        let dx = line.x0 - line.x1;
                        let dy = -(line.y0 - line.y1) ;
                        let theta = Math.atan2(dy, dx);

                        let points = [
                            {x: -10, y: 0},
                            {x: 7, y: 6},
                            {x: 7, y: -6}
                        ];

                        let newPoints = points.map(
                            (p) => {
                                return translate(rotate(p, -theta), point);
                            }
                        )
                        drawPolygon(ctx, newPoints, color);

                    }
                });
            }
        });
    }
}
