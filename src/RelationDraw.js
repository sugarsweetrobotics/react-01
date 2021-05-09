import {drawEllipse, drawLine, drawPolygon, drawText} from "./Drawing";
import {rotate, translate, crossingPointLineAndEllipse, crossingPointLineAndRect} from "./Dimension";


export function drawOperationConnection(drawer, ctx, vm) {
    let color = '#ff0000';
    if (vm.type === 'Operation' || vm.type === 'Topic') {
        drawer.viewModels.forEach((tgt) => {
            if ( (tgt.type === 'Operation' || tgt.type === 'Topic') && vm.model.info.outlet.connections) {
                console.log('Connection draw');
                /// 出力outlet側からたどる
                vm.model.info.outlet.connections.forEach((c)=>{
                    console.log('c:', c);
                    /// 接続しているinletがtgtのモデルと同じなら
                    if ((tgt.type === 'Operation' && c.inlet.ownerFullName === tgt.model.info.fullName) ||
                        (tgt.type === 'Topic' && c.inlet.ownerFullName === tgt.model.info.fullName)) { // Name + ':' + tgt.model.model.instanceName)) {
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

                        let point;
                        if (tgt.type === 'topic') {
                            point = crossingPointLineAndRect(line, {
                                width: tgt.size.width,
                                height: tgt.size.height
                            }, 8);
                        }else {
                            point = crossingPointLineAndEllipse(line, {
                                width: tgt.size.width,
                                height: tgt.size.height
                            }, 8);
                        }


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


                        if (c.type === 'event') {
                            let p = translate(rotate({x:20, y:20}, -theta), point);
                            drawText(ctx, 'e', p, color);
                        }

                        let p = translate(rotate({x:20, y:-20}, -theta), point);
                        drawText(ctx, c.inlet.name, p, color);

                    }
                });
            }
        });
    }
}

export function drawECBindConnection(drawer, ctx, vm) {
    let color = '#fff900';
    let padding = 10;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    if (vm.type === 'ExecutionContext') {
        drawer.viewModels.forEach((tgt) => {
            if (tgt.type === 'container_operation' || tgt.type === 'operation') {
                if (vm.model.model.boundOperations) {

                    vm.model.model.boundOperations.forEach((op) => {
                        let fullName = op.fullName;

                        if ((tgt.type === 'operation' && fullName === tgt.model.model.fullName) ||
                            (tgt.type === 'container_operation' && fullName === tgt.model.model.fullName)) { //} + ':' + tgt.model.model.instanceName)) {

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
            }
        });
    }
}


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

export function drawContainerConnection(drawer, ctx, vm) {
    if (vm.type === 'Container') {
        console.info("RelationDraw.drawContainerConnection ", vm);
        let color = '#00fcf4';
        drawer.viewModels.forEach((tgt) => {
            console.info(tgt);
            if (tgt.type === 'Operation' && tgt.model.info.ownerContainerFullName === vm.model.info.fullName) {
                drawLine(ctx, vm.position, tgt.position, color);
                let point = crossingPointLineAndEllipse({
                    x0: vm.position.x, y0: vm.position.y,
                    x1: tgt.position.x, y1: tgt.position.y
                }, {
                    width: tgt.size.width,
                    height: tgt.size.height
                }, 8);
                drawEllipse(ctx, {x: point.x-2, y: point.y-2}, {width: 12, height:12}, color);
            }
        });
    }
}



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




export function drawFSMBindOperationConnection(drawer, ctx, vm) {
    let color = '#a2ff00';
    let padding = 10;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};

    if (vm.type === 'fsm') {
        drawer.viewModels.forEach((tgt) => {
            if (tgt.type === 'container_operation' || tgt.type === 'operation') {
                vm.model.model.states.forEach((state, i)=> {
                    if (state.boundOperations !== undefined) {
                        state.boundOperations.forEach((op, j) => {
                            let pos = startPos;
                            if (i % 2 != 0) {
                                pos = stopPos;
                            }

                            let fullName = op.fullName;

                            if ((tgt.type === 'operation' && fullName === tgt.model.model.fullName) ||
                                (tgt.type === 'container_operation' && fullName === tgt.model.model.fullName)) { //} + ':' + tgt.model.model.instanceName)) {

                                drawLine(ctx, pos, tgt.position, color);

                                let line = {
                                    x0: pos.x, y0: pos.y,
                                    x1: tgt.position.x, y1: tgt.position.y
                                };

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

                            }
                        });
                    }

                });
            }
        });
    }
}




export function drawFSMBindECConnection(drawer, ctx, vm) {
    let color = '#a2ff00';
    let padding = 10;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};

    if (vm.type === 'fsm') {
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
        });
    }
}
