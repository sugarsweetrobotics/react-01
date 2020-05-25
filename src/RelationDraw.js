import {drawEllipse, drawLine, drawPolygon, drawText} from "./Drawing";
import {includes, distanceToLine, offset, rotate, translate, crossingPointLineAndEllipse} from "./Dimension";


export function drawOperationConnection(drawer, ctx, vm) {
    let color = '#ff0000';
    if (vm.type === 'operation' || vm.type === 'container_operation') {
        drawer.viewModels.forEach((tgt) => {
            if ( (tgt.type === 'container_operation' || tgt.type === 'operation' ) && vm.model.model.connections) {
                vm.model.model.connections.output.forEach((c)=>{
                    if ((tgt.type === 'operation' && c.input.info.instanceName === tgt.model.model.instanceName) ||
                        (tgt.type === 'container_operation' && c.input.info.instanceName === tgt.model.model.ownerContainerInstanceName + ':' + tgt.model.model.instanceName)) {
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
                        drawText(ctx, c.input.target.name, p, color);

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
    if (vm.type === 'ec') {
        drawer.viewModels.forEach((tgt) => {
            if (tgt.type === 'container_operation' || tgt.type === 'operation') {
                vm.model.operations.forEach((op)=> {
                    let fullInstanceName = op.instanceName;
                    if (op.ownerContainerInstanceName !== undefined) {
                        fullInstanceName = op.ownerContainerInstanceName + ':' + op.instanceName;
                    }
                    if ((tgt.type === 'operation' && fullInstanceName === tgt.model.model.instanceName) ||
                        (tgt.type === 'container_operation' && fullInstanceName === tgt.model.model.ownerContainerInstanceName + ':' + tgt.model.model.instanceName)) {

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
    if (vm.type === 'container') {
        let color = '#00fcf4';
        drawer.viewModels.forEach((tgt) => {
            if (tgt.type === 'container_operation' && tgt.model.ownerContainer.instanceName === vm.model.model.instanceName) {
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


