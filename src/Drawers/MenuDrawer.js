import {drawEllipse, drawArc, drawRect, drawEllipseShadow, drawLine, drawPi, drawRectShadow, drawText, Nsin, Ncos} from "./Drawing";
import {colors} from './VMColors';
//import {drawVM, drawEC, drawECStates} from "./ObjectDrawer";
//import {drawContainerConnection, drawECBindConnection, drawOperationConnection} from "./RelationDraw";
import {offset} from "./Dimension";
import {menuParameter} from "./MenuParameter";
import {drawOperationControlMenu, drawOperationSpecialMenu} from "./OperationControlMenu";


function menuInterval(cb, interval) {
    let startTime = Date.now();
    let timer = setInterval( ()=> {
        let durationMS = Date.now() - startTime;
        cb(timer, durationMS);
    }, interval);
}

function menuFuncProgress(cb, interval, duration) {
    menuInterval((timer, durationMS) => {
        let progress = 100 * durationMS / duration;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
        }
        cb(progress);
    }, interval);
}

export function drawSelectedVMMenu(drawer, ctx, vm) {
    if (vm == null) {
        drawer.menuProgressed = -1;
        return;
    }
    drawSelectedVMMenuWorker(drawer, ctx, vm, drawer.menuProgressed, drawer.menuAnimationProgressed);
    if (drawer.menuProgressed < 0) {
        menuFuncProgress( progress => {
            drawer.menuProgressed = progress;
            drawer.drawCanvas(ctx);
        }, 50, 300);
    } else if (drawer.menuAnimationProgressed < 0) {
        menuFuncProgress(progress => {
            drawer.menuAnimationProgressed = progress;
            drawer.drawCanvas(ctx);
        }, 50, 300);
    }
}



export function drawSelectedVMBackground(ctx, vm) {
    if (vm == null) return;

    let color = '#00fcf4';
    if (vm.type === 'ec') {
        color = '#fff900';
        drawRectShadow(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'container') {
        color = '#00fcf4';
        drawRectShadow(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'operation') {
        color = '#ff0000';
        drawEllipseShadow(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'container_operation') {
        color = '#00ff29';
        drawEllipseShadow(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'callback') {
        color = '#ffffff';
        drawEllipseShadow(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'topic') {
        color = '#ff0fff';
        drawRectShadow(ctx, vm.position, vm.size, color);
    } else if (vm.type === 'fsm') {
        color = '#a2ff00';
        drawRectShadow(ctx, vm.position, vm.size, color);
    }
}


export function drawSelectedRelationMenuBackground(ctx, connection) {
    if (connection == null) return;
    let color = '#fff';
    if (connection.connection) {
    }
    drawLine(ctx, {x: connection.line.x0, y: connection.line.y0}, {x: connection.line.x1, y: connection.line.y1}, color, {lineWidth: 5, blur: 20});
}

export function drawSelectedRelationMenu(drawer, ctx, connection) {
    if (connection == null) return;

    let color = '#00ffff';
    let center = {
        x: (connection.line.x0 + connection.line.x1) / 2,
        y: (connection.line.y0 + connection.line.y1) / 2
    };

    let dispSize = {
        width: ctx.canvas.clientWidth,
        height: ctx.canvasclientHeight,
        ctx: ctx
    };

    let title = "Operation Connection";
    let nameText = 'name: ' + connection.connection.name;
    let textSize = ctx.measureText(nameText);
    textSize.height = 20;
    let titleSize = ctx.measureText(title);
    titleSize.height = 20;
    let menuOrigin = {x: 0, y: 0};
    let lineOrigin = {x: 0, y: 0};
    let lineConOrigin = {x: 0, y: 0};
    let titleOrigin = {y: titleSize.height + 10};
    let baseLineLength = 200;
    let dy = connection.line.y1-connection.line.y0;
    let dx = connection.line.x1-connection.line.x0;


    if (dx * dy < 0) {
        lineOrigin.x = center.x - 100;
        lineOrigin.y = center.y - 100;
        lineConOrigin = {x:  lineOrigin.x - baseLineLength, y: lineOrigin.y};

        titleOrigin.x = lineConOrigin.x + titleSize.width/2 + 10;
        titleOrigin.y = lineConOrigin.y - 5 ;

        menuOrigin.x = lineConOrigin.x + textSize.width/2 + 20;
        menuOrigin.y = lineConOrigin.y + textSize.height;

    } else {
        lineOrigin.x = center.x + 100;
        lineOrigin.y = center.y - 100;
        lineConOrigin = {x:  lineOrigin.x + baseLineLength, y: lineOrigin.y};

        titleOrigin.x = lineOrigin.x + titleSize.width/2 + 10;
        titleOrigin.y = lineConOrigin.y - 5 ;

        menuOrigin.x = lineOrigin.x + textSize.width/2 + 20;
        menuOrigin.y = lineConOrigin.y + textSize.height;
    }

    drawText(ctx, title, titleOrigin, color);
    drawText(ctx, nameText, menuOrigin, color);
    drawLine(ctx, lineOrigin, lineConOrigin, color);
    drawLine(ctx, center, lineOrigin, color);

    if (connection.type === 'operation_connection') {
        let text = 'type: ' + connection.connection.type;
        let ofst = textSize.width/2 - ctx.measureText(text).width/2;
        drawText(ctx, text, offset(menuOrigin, {x:-ofst, y:20}), color);
    }
}


function drawInnerProgressMeter(ctx, vm, radius, color, progress) {
    /// 内側のプログレスメーター部分の描画
    drawEllipse(ctx, vm.position, {width: radius * 2, height: radius * 2}, color, {
        fill: false,
        lineWidth: 2.0
    });
    drawEllipse(ctx, vm.position, {width: radius * 2 + 30, height: radius * 2 + 30}, color, {
        fill: false,
        lineWidth: 2.0
    });

    let circle_progress = progress;
    drawEllipse(ctx, vm.position, {width: radius * 2 + 70, height: radius * 2 + 70}, color, {
        fill: false,
        lineWidth: 1.0,
        startAngle: 0,
        endAngle: Math.PI * 2 / 100 * circle_progress
    });

    if (progress >= 90) {
        drawPi(ctx, vm.position, radius + 40, Math.PI / 2 - 0.9, Math.PI / 2 + 0.3, color, {
            innerRadius: radius + 36,
            stroke: false
        });
        drawPi(ctx, vm.position, radius + 40, Math.PI + Math.PI / 2 - 0.9, Math.PI + Math.PI / 2 + 0.3, color, {
            innerRadius: radius + 36,
            stroke: false
        });
    }

    let rr = radius + 2;
    let rd = radius + 12;
    for (let i = 0; i < circle_progress; i++) {
        let theta = Math.PI * 2 / 100 * i;
        let c = Ncos(theta);
        let s = Nsin(theta);
        drawLine(ctx, {x: rr * c + vm.position.x, y: rr * s + vm.position.y}, {
            x: rd * c + vm.position.x,
            y: rd * s + vm.position.y
        }, color);
    }
}


function drawVMInstanceNameMenu(progress, radius, ctx, vm, color) {
    // インスタンス名を描画
    // let instanceName = vm.model.info.fullName;
    //if (vm.type === 'callback') instanceName = vm.model.model.name;

    let arrow_progress = progress > 33 ? 100 : progress * 3;
    let base_progress = progress > 66 ? 100 : (progress - 33) * 3;
    let theta = -Math.PI / 5;

    const maxBaseLength = 200;
    const c = Ncos(theta);
    const s = Nsin(theta);
    let rr = radius - 20;
    let rd = rr + (100) / 100.0 * arrow_progress;
    let base_length = maxBaseLength / 100.0 * base_progress;
    drawLine(ctx, {x: vm.position.x + rr * c, y: vm.position.y + rr * s}, {
            x: rd * c + vm.position.x,
            y: rd * s + vm.position.y
        },
        color);
    if (base_progress > 0) {
        drawLine(ctx, {
                x: rd * c + vm.position.x,
                y: rd * s + vm.position.y
            }, {x: rd * c + vm.position.x + base_length, y: rd * s + vm.position.y},
            color);
    }

    if (progress >= 100) {
        const instance_name_position = {
            x: rd * c + vm.position.x + maxBaseLength / 2,
            y: rd * s + vm.position.y - 10
        };

        let button_size = 40;
        let close_button_position = {
            x: instance_name_position.x + maxBaseLength / 2,
            y: instance_name_position.y - button_size / 2 - 10
        };

        drawText(ctx, vm.type, {
            x: rd * c + vm.position.x + 60,
            y: rd * s + vm.position.y - 30
        }, color);
        drawText(ctx, '"' + vm.model.info.fullName + '"', instance_name_position, color);

        drawText(ctx, 'description:', {
            x: rd * c + vm.position.x + maxBaseLength / 2,
            y: rd * s + vm.position.y + 20
        }, color);

        drawText(ctx, '"' + vm.model.info.description + '"', {
            x: rd * c + vm.position.x + maxBaseLength / 2,
            y: rd * s + vm.position.y + 40
        }, color, { align: 'left'});
    }
}

function drawSelectedVMMenuWorker(drawer, ctx, vm, progress, menuAnimationProgress) {

    let radius = Math.sqrt(vm.size.width * vm.size.width + vm.size.height * vm.size.height) / 2 + 10;
    const color = colors[vm.model.info.className];
    // 内側の基本円を書く
    drawInnerProgressMeter(ctx, vm, radius, color, progress);

    {
        drawVMInstanceNameMenu(progress, radius, ctx, vm, color);
    }

    if (vm.type === 'Container') {
        drawContainerSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    } else if (vm.type === 'ExecutionContext') {
        drawECSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    } else if (vm.type === 'FSM') {
        drawFSMSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    } else if (vm.type === 'callback') {
        drawCallbackSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    } else if (vm.type === 'Operation') {
        drawOperationControlMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
        drawOperationSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    }
}

function pos_to_string(pose) {
    return '(' + pose.position.x + ',' + pose.position.y + ',' + pose.position.z + ')';
}

function ori_to_string(pose) {
    return '('
        + pose.orientation.x + ',' + pose.orientation.y + ',' + pose.orientation.z + ',' + pose.orientation.w + ')';
}

function drawContainerSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {

    let arrow_progress = progress > 33 ? 100 : progress * 3;
    let theta = -Math.PI / 5;
    const c = Ncos(theta);
    const s = Nsin(theta);
    let rr = radius - 20;
    let rd = rr + (100) / 100.0 * arrow_progress;
    const maxBaseLength = 200;

    if (progress >= 100) {
        drawText(ctx, 'basePose', {
            x: rd * c + vm.position.x + maxBaseLength / 2,
            y: rd * s + vm.position.y + 50
        }, color);
        drawText(ctx, '- position:' +  pos_to_string(vm.model.basePose.pose), {
            x: rd * c + vm.position.x + maxBaseLength / 2-20,
            y: rd * s + vm.position.y + 65
        }, color, {align: 'left'});

        drawText(ctx, '- orientation:' +  ori_to_string(vm.model.basePose.pose), {
            x: rd * c + vm.position.x + maxBaseLength / 2-20,
            y: rd * s + vm.position.y + 80
        }, color, {align: 'left'});
    }
}


function drawCallbackSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {
    let padding = 15;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};

    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};

    menuParameter.callbackButtonState.viewModel = vm;
    menuParameter.callbackButtonState.startButtonState = {
        position: startPos,
        size: size,
    };
    menuParameter.callbackButtonState.stopButtonState = {
        position: stopPos,
        size: size,
    };
    menuParameter.callbackButtonState.boundedOperationButtons = []

    let baseProgress = (progress) * 3 + 10;
    if (baseProgress > 100) baseProgress = 100;

    let arrowProgress = progress < 30 ? 0 :(progress - 30) * 3 + 10;
    if (arrowProgress > 100) arrowProgress = 100;

    let menuProgress = progress < 60 ? 0 :(progress - 60) * 3 + 10;
    if (menuProgress > 100) menuProgress = 100;

    let theta = Math.PI / 4;

    // 右下にBound Operationsのメニューを描画します．
    let maxBaseLength = 200;
    let c = Ncos(theta);
    let s = Nsin(theta);
    let rr = radius - 20;
    let rd = rr + (100) / 100.0 * baseProgress;
    let base_length = maxBaseLength / 100.0 * arrowProgress;
    drawLine(ctx, {x: vm.position.x + rr * c, y: vm.position.y + rr * s}, {x: rd * c + vm.position.x, y: rd*s + vm.position.y},
        color);
    if (baseProgress > 95) {
        drawLine(ctx, {
                x: rd * c + vm.position.x,
                y: rd * s + vm.position.y
            }, {x: rd * c + vm.position.x + base_length, y: rd * s + vm.position.y},
            color);

        if (arrowProgress > 80) {
            // ここからがBound Operationのメニューを表示
            drawText(ctx, 'Bound Operations', {
                x: vm.position.x + rd * c + 150,
                y: vm.position.y + rd * s - 10
            }, color);

            drawRect(ctx, {
                x: vm.position.x + rd * c + 175,
                y: vm.position.y + rd * s + 3
            }, {width: 50, height: 5}, color, {
                stroke: false,
                fillColor: 'white',
                fill: true,
                lineWidth: 1.0,
            });

            /// Bounded Operationごとのボタンを表示して登録
            // console.log('EC: ', vm.model.model, menuParameter.ecButtonState)


            // Bind Operationボタンが押された状態
            if (menuParameter.callbackButtonState.bindOperationState) {
                // menuParameter.ecButtonState.boundedOperationButtons = [];
                menuParameter.callbackButtonState.bindOperationTargetButtons = [];
                drawRect(ctx, {
                    x: vm.position.x + rd * c + 140,
                    y: vm.position.y + rd * s + 40 * 1
                }, { width: 260, height: 30}, color);

                //let instanceName = ;
                drawText(ctx, 'Bind Other Operation....',{
                    x: vm.position.x + rd * c + 20,
                    y: vm.position.y + rd * s + 5 + 40 * 1
                }, color, { align: 'left'});
                let i = 2;
                drawer.viewModels.forEach((viewModel) => {
                    if (viewModel.type === 'operation' || viewModel.type === 'container_operation') {
                        let fullName = viewModel.model.model.fullName;
                        //if (viewModel.model.model.ownerContainerInstanceName) {
                        //    instanceName = viewModel.model.model.ownerContainerInstanceName + ':' + instanceName;
                        //}

                        drawRect(ctx, {
                            x: vm.position.x + rd * c + 160,
                            y: vm.position.y + rd * s + 40 * i
                        }, { width: 260, height: 30}, color);

                        drawText(ctx, fullName,{
                            x: vm.position.x + rd * c + 40,
                            y: vm.position.y + rd * s + 5 + 40 * i
                        }, color, { align: 'left'});


                        menuParameter.callbackButtonState.bindOperationTargetButtons.push({
                            position: {
                                x: vm.position.x + rd * c + 160,
                                y: vm.position.y + rd * s + 40 * i
                            }, size: {width: 260, height: 30}, ec: vm, viewModel: viewModel
                        });
                        i++;
                    }
                })
            } else {
                menuParameter.callbackButtonState.boundedOperationButtons = [];
                let i = 0;
                //console.log('CallbackVm:,', vm);
                vm.model.model.target.forEach((op) => {
                    drawRect(ctx, {
                        x: vm.position.x + rd * c + 140,
                        y: vm.position.y + rd * s + 40 * (i + 1)
                    }, {width: 260, height: 30}, color);

                    let instanceName = op.name;

                    drawText(ctx, instanceName, {
                        x: vm.position.x + rd * c + 20,
                        y: vm.position.y + rd * s + 5 + 40 * (i + 1)
                    }, color, {align: 'left'});


                    menuParameter.callbackButtonState.boundedOperationButtons.push({
                        position: {
                            x: vm.position.x + rd * c + 140,
                            y: vm.position.y + rd * s + 40 * (i + 1)
                        }, size: {width: 260, height: 30}, operation: op
                    });

                    if (menuParameter.callbackButtonState.selectOperationState) {
                        let tgtop = menuParameter.callbackButtonState.selectedButton.operation;
                        if (tgtop && tgtop == op) {
                            /// DELETEボタン表示
                            drawRect(ctx, {
                                x: vm.position.x + rd * c + 330,
                                y: vm.position.y + rd * s + 40 * (i + 1)
                            }, {width: 100, height: 30}, color);

                            drawText(ctx, 'DELETE', {
                                x: vm.position.x + rd * c + 330,
                                y: vm.position.y + rd * s + 5 + 40 * (i + 1)
                            }, color,);

                            menuParameter.callbackButtonState.selectOperationState.deleteButton = {
                                position: {
                                    x: vm.position.x + rd * c + 330,
                                    y: vm.position.y + rd * s + 40 * (i + 1)
                                }, size: {width: 100, height: 30}, ec: vm, operation: op
                            };
                        }
                    }

                    i++;



                });
                drawRect(ctx, {
                    x: vm.position.x + rd * c + 140,
                    y: vm.position.y + rd * s + 40 * (i+1)
                }, { width: 260, height: 30}, color);

                let instanceName = 'Bind Other Operation....';
                drawText(ctx, instanceName,{
                    x: vm.position.x + rd * c + 20,
                    y: vm.position.y + rd * s + 5 + 40 * (i+1)
                }, color, { align: 'left'});

                menuParameter.callbackButtonState.boundedOperationButtons.push({
                    position:{
                        x: vm.position.x + rd * c + 140,
                        y: vm.position.y + rd * s + 40 * (i+1)
                    }, size: { width: 260, height: 30}, operation: null
                });
            }
        }
    }
}

function drawFSMSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {
    // console.log('drawECSpecialMenu');
    let padding = 15;
    let stride = vm.size.height/3;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding - stride};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding - stride};

    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};

    menuParameter.fsmButtonState.viewModel = vm;
    let leftPos = startPos;
    let rightPos = stopPos;
    menuParameter.fsmButtonState.stateButtonStates = vm.model.states.map((s, i) => {
        if (i % 2 === 0) {
            leftPos.y += stride;
            rightPos.y += stride;
        }
        return {
            state: s,
            position: i % 2 === 0 ? leftPos : rightPos,
            size: size
        };
    });

    menuParameter.fsmButtonState.boundedOperationButtons = []
}

function drawECSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {
    console.log('drawECSpecialMenu');
    let padding = 15;
    let stopPos = {x:vm.position.x - (vm.size.width-padding*3)/4 - padding/2, y: vm.position.y + vm.size.height/3 - padding};
    let startPos = {x:vm.position.x + (vm.size.width-padding*3)/4 + padding/2, y: vm.position.y + vm.size.height/3 - padding};

    let size = {width: (vm.size.width-padding*3)/2, height:vm.size.height/2-padding*3};

    menuParameter.ecButtonState.viewModel = vm;
    menuParameter.ecButtonState.startButtonState = {
        position: startPos,
        size: size,
    };
    menuParameter.ecButtonState.stopButtonState = {
        position: stopPos,
        size: size,
    };
    menuParameter.ecButtonState.boundedOperationButtons = []

    let baseProgress = (progress) * 3 + 10;
    if (baseProgress > 100) baseProgress = 100;

    let arrowProgress = progress < 30 ? 0 :(progress - 30) * 3 + 10;
    if (arrowProgress > 100) arrowProgress = 100;

    let menuProgress = progress < 60 ? 0 :(progress - 60) * 3 + 10;
    if (menuProgress > 100) menuProgress = 100;

    let theta = Math.PI / 4;

    // 右下にBound Operationsのメニューを描画します．
    let maxBaseLength = 200;
    let c = Ncos(theta);
    let s = Nsin(theta);
    let rr = radius - 20;
    let rd = rr + (100) / 100.0 * baseProgress;
    let base_length = maxBaseLength / 100.0 * arrowProgress;
    drawLine(ctx, {x: vm.position.x + rr * c, y: vm.position.y + rr * s}, {x: rd * c + vm.position.x, y: rd*s + vm.position.y},
        color);
    if (baseProgress > 95) {
        drawLine(ctx, {
                x: rd * c + vm.position.x,
                y: rd * s + vm.position.y
            }, {x: rd * c + vm.position.x + base_length, y: rd * s + vm.position.y},
            color);

        if (arrowProgress > 80) {
            // ここからがBound Operationのメニューを表示
            drawText(ctx, 'Bound Operations', {
                x: vm.position.x + rd * c + 150,
                y: vm.position.y + rd * s - 10
            }, color);

            drawRect(ctx, {
                x: vm.position.x + rd * c + 175,
                y: vm.position.y + rd * s + 3
            }, {width: 50, height: 5}, color, {
                stroke: false,
                fillColor: 'white',
                fill: true,
                lineWidth: 1.0,
            });

            /// Bounded Operationごとのボタンを表示して登録
            // console.log('EC: ', vm.model.model, menuParameter.ecButtonState)


            // Bind Operationボタンが押された状態
            if (menuParameter.ecButtonState.bindOperationState) {
                // menuParameter.ecButtonState.boundedOperationButtons = [];
                menuParameter.ecButtonState.bindOperationTargetButtons = [];
                drawRect(ctx, {
                    x: vm.position.x + rd * c + 140,
                    y: vm.position.y + rd * s + 40 * 1
                }, { width: 260, height: 30}, color);

               // let instanceName = ;
                drawText(ctx, 'Bind Other Operation....',{
                    x: vm.position.x + rd * c + 20,
                    y: vm.position.y + rd * s + 5 + 40 * 1
                }, color, { align: 'left'});
                let i = 2;
                drawer.viewModels.forEach((viewModel) => {
                    if (viewModel.type === 'operation' || viewModel.type === 'container_operation') {
                        let fullName = viewModel.model.model.fullName;
                        //if (viewModel.model.model.ownerContainerInstanceName) {
                        //    instanceName = viewModel.model.model.ownerContainerInstanceName + ':' + instanceName;
                        //}

                        drawRect(ctx, {
                            x: vm.position.x + rd * c + 160,
                            y: vm.position.y + rd * s + 40 * i
                        }, { width: 260, height: 30}, color);

                        drawText(ctx, fullName,{
                            x: vm.position.x + rd * c + 40,
                            y: vm.position.y + rd * s + 5 + 40 * i
                        }, color, { align: 'left'});

                        menuParameter.ecButtonState.bindOperationTargetButtons.push({
                            position: {
                                x: vm.position.x + rd * c + 160,
                                y: vm.position.y + rd * s + 40 * i
                            }, size: {width: 260, height: 30}, ec: vm, viewModel: viewModel
                        });
                        i++;
                    }
                })
            } else {
                menuParameter.ecButtonState.boundedOperationButtons = [];
                let i = 0;
                /*
                vm.model.model.boundOperations.forEach((op) => {
                    drawRect(ctx, {
                        x: vm.position.x + rd * c + 140,
                        y: vm.position.y + rd * s + 40 * (i + 1)
                    }, {width: 260, height: 30}, color);

                    let fullName = op.fullName;

                    drawText(ctx, fullName, {
                        x: vm.position.x + rd * c + 20,
                        y: vm.position.y + rd * s + 5 + 40 * (i + 1)
                    }, color, {align: 'left'});


                    menuParameter.ecButtonState.boundedOperationButtons.push({
                        position: {
                            x: vm.position.x + rd * c + 140,
                            y: vm.position.y + rd * s + 40 * (i + 1)
                        }, size: {width: 260, height: 30}, operation: op
                    });

                    if (menuParameter.ecButtonState.selectOperationState) {
                        let tgtop = menuParameter.ecButtonState.selectedButton.operation;
                        if (tgtop && tgtop == op) {
                            /// DELETEボタン表示
                            drawRect(ctx, {
                                x: vm.position.x + rd * c + 330,
                                y: vm.position.y + rd * s + 40 * (i + 1)
                            }, {width: 100, height: 30}, color);

                            drawText(ctx, 'DELETE', {
                                x: vm.position.x + rd * c + 330,
                                y: vm.position.y + rd * s + 5 + 40 * (i + 1)
                            }, color,);

                            menuParameter.ecButtonState.selectOperationState.deleteButton = {
                                position: {
                                    x: vm.position.x + rd * c + 330,
                                    y: vm.position.y + rd * s + 40 * (i + 1)
                                }, size: {width: 100, height: 30}, ec: vm, operation: op
                            };
                        }
                    }

                    i++;



                });
                drawRect(ctx, {
                    x: vm.position.x + rd * c + 140,
                    y: vm.position.y + rd * s + 40 * (i+1)
                }, { width: 260, height: 30}, color);

                let instanceName = 'Bind Other Operation....';
                drawText(ctx, instanceName,{
                    x: vm.position.x + rd * c + 20,
                    y: vm.position.y + rd * s + 5 + 40 * (i+1)
                }, color, { align: 'left'});

                menuParameter.ecButtonState.boundedOperationButtons.push({
                    position:{
                        x: vm.position.x + rd * c + 140,
                        y: vm.position.y + rd * s + 40 * (i+1)
                    }, size: { width: 260, height: 30}, operation: null
                });

                 */
            }
        }
    }
}
