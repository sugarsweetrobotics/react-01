import {drawEllipse, drawArc, drawRect, drawEllipseShadow, drawLine, drawPi, drawRectShadow, drawText} from "./Drawing";

//import {drawVM, drawEC, drawECStates} from "./ObjectDrawer";
//import {drawContainerConnection, drawECBindConnection, drawOperationConnection} from "./RelationDraw";
import {offset} from "./Dimension";
import {menuParameter} from "./MenuParameter";


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
    }
}


export function drawSelectedRelationMenuBackground(ctx, connection) {
    if (connection == null) return;
    let color = '#fff';
    //console.log(connection.connection);
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


export function drawSelectedVMMenu(drawer, ctx, vm) {
    //console.log('drawSelectedVMMenu', drawer.menuProgressed, drawer.menuAnimationProgressed);
    if (vm == null) {
        drawer.menuProgressed = -1;
        return;
    }
    drawSelectedVMMenuWorker(drawer, ctx, vm, drawer.menuProgressed, drawer.menuAnimationProgressed);
    if (drawer.menuProgressed < 0) {
        drawer.menuProgressed = 1;
        let startTime = Date.now();
        let timer = setInterval( () => {
            let durationMS = Date.now() - startTime;
            drawer.menuProgressed = 100 * durationMS / 300;
            drawer.drawCanvas(ctx);
            if (drawer.menuProgressed >= 100) {
                drawer.menuProgressed = 100;
                clearInterval(timer);
            }
        }, 50);
    } else if (drawer.menuAnimationProgressed < 0) {
        let startTime = Date.now();
        let timer = setInterval( () => {
            let durationMS = Date.now() - startTime;
            drawer.menuAnimationProgressed = 100 * durationMS / 300;
            drawer.drawCanvas(ctx);
            if (drawer.menuAnimationProgressed >= 100) {
                drawer.menuAnimationProgressed = 100;
                clearInterval(timer);
            }
        }, 50);
    }


}

function drawSelectedVMMenuWorker(drawer, ctx, vm, progress, menuAnimationProgress) {

    let radius = Math.sqrt(vm.size.width * vm.size.width + vm.size.height * vm.size.height) / 2 + 10;
    let color = '#00fcf4';
    if (vm.type === 'ec') {
        color = '#fff900';
    } else if (vm.type === 'container') {
        color = '#00fcf4';
    } else if (vm.type === 'operation') {
        color = '#ff0000';
    } else if (vm.type === 'container_operation') {
        color = '#00ff29';
    }

    {
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
            let c = Math.cos(theta);
            let s = Math.sin(theta);
            drawLine(ctx, {x: rr * c + vm.position.x, y: rr * s + vm.position.y}, {
                x: rd * c + vm.position.x,
                y: rd * s + vm.position.y
            }, color);
        }
    }

    if (vm.type === 'operation' || vm.type === 'container_operation'){
        /// 操作メニュー

        if (!menuParameter.operationControlButtonState) {
            drawArc(ctx,{
                x:0 + vm.position.x, y: 180 + vm.position.y
            }, 30 * progress / 100 + 1, 0, Math.PI * 2 / 100 * progress, color);
            drawArc(ctx, {
                x:0 + vm.position.x, y: 180 + vm.position.y
            }, 20 * progress / 100 + 1, 0, -Math.PI * 2 / 100 * progress , color, {
                ccw: true,
            });

            if (progress >= 100) {
                drawText(ctx, 'Control Menu', {
                    x: vm.position.x + 90, y: 180 + vm.position.y
                }, color);

                menuParameter.operationControlButtonState = {
                    button: {
                        position: {
                            x: vm.position.x, y: vm.position.y + 180
                        },
                        radius: 30
                    },
                    pushedButton: null,
                }
            }
        } else if (!menuParameter.operationControlButtonState.pushedButton) {
            drawArc(ctx,{
                x:0 + vm.position.x, y: 180 + vm.position.y
            }, 30 * progress / 100 + 1, 0, Math.PI * 2 / 100 * progress, color);
            drawArc(ctx, {
                x:0 + vm.position.x, y: 180 + vm.position.y
            }, 20 * progress / 100 + 1, 0, -Math.PI * 2 / 100 * progress , color, {
                ccw: true,
            });
            drawText(ctx, 'Control Menu', {
                x: vm.position.x + 90, y: 180 + vm.position.y
            }, color);

            menuParameter.operationControlButtonState = {
                button: {
                    position: {
                        x: vm.position.x, y: vm.position.y + 180
                    },
                    radius: 30
                },
                pushedButton: null,
            }

        } else {
            const lineProgress = menuAnimationProgress < 30 ? menuAnimationProgress * 3 + 10 : 100;
            const maxLineLength = 200;
            let lineLength = maxLineLength * lineProgress / 100;
            let anchor = {
                x: -lineLength / 2, y: 150
            };
            drawLine(ctx, anchor, {
                x: anchor.x + lineLength, y: anchor.y
            }, color, {
                offset: vm.position
            });

            if (lineProgress > 80) {
                drawRect(ctx, {
                    x: anchor.x + 25 + vm.position.x, y: anchor.y - 2 + vm.position.y
                }, {
                    width: 50, height: 4
                }, color, {
                    stroke: false,
                    fillColor: 'white',
                    fill: true,
                    lineWidth: 1.0,
                })
            }

            let menuProgress = menuAnimationProgress < 30 ? 0 :(menuAnimationProgress - 30) * 3 + 10;
            if (menuProgress > 100) menuProgress = 100;
            anchor.y += 20;
            if (menuProgress > 0) {
                drawRect(ctx, {
                    x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y
                }, {
                    width: 80, height: 50 * menuProgress / 100
                }, color);

                drawRect(ctx, {
                    x: vm.position.x - 45 + 90, y: anchor.y + 25 + vm.position.y
                }, {
                    width: 80, height: 50 * menuProgress / 100
                }, color);

                if (menuProgress > 90) {
                    menuParameter.operationControlButtonState.invokeButton = {
                        position: {
                            x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y
                        },
                        size: {
                            width: 80, height: 50 * menuProgress / 100
                        },
                        viewModel: vm
                    };
                    menuParameter.operationControlButtonState.executeButton = {
                        position: {
                            x: vm.position.x - 45 + 90, y: anchor.y + 25 + vm.position.y
                        },
                        size: {
                            width: 80, height: 50 * menuProgress / 100
                        },
                        viewModel: vm
                    };

                    drawText(ctx, 'Invoke', {
                        x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y
                    }, color);
                    drawText(ctx, 'Execute', {
                        x: vm.position.x - 45 + 90, y: anchor.y + 25 + vm.position.y
                    }, color);
                }
            }


            let baseProgress = menuAnimationProgress < 30 ? 0 :(menuAnimationProgress - 30) * 3 + 10;
            if (baseProgress > 100) baseProgress = 100;

            let arrow_progress = progress > 33 ? 100 : progress * 3;
            if (arrow_progress > 100) arrow_progress = 100;
            let theta = Math.PI / 4;

            let maxBaseLength = 200;
            let c = Math.cos(theta);
            let s = Math.sin(theta);
            let rr = radius - 20;
            let rd = rr + (100) / 100.0 * arrow_progress;
            let base_length = maxBaseLength / 100.0 * baseProgress;
            drawLine(ctx, {x: vm.position.x + rr * c, y: vm.position.y + rr * s}, {x: rd * c + vm.position.x, y: rd*s + vm.position.y},
                color);
            if (baseProgress > 0) {
                drawLine(ctx, {
                        x: rd * c + vm.position.x,
                        y: rd * s + vm.position.y
                    }, {x: rd * c + vm.position.x + base_length, y: rd * s + vm.position.y},
                    color);

                if (baseProgress > 80) {
                    drawText(ctx, 'Log View', {
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

                    if (menuParameter.operationControlButtonState.outputLog) {
                        let outputLog = menuParameter.operationControlButtonState.outputLog;
                        let replacer = (key, value) => {
                            if (value instanceof Array) {
                                return "Array[" + value.toString() + "]";
                            }
                            return value;
                        }
                        let text = JSON.stringify(outputLog, replacer, 2);
                        let ts = text.split('\n');
                        ts.forEach((t, i) => {
                            drawText(ctx, t, {
                                x: vm.position.x + rd * c + 20,
                                y: vm.position.y + rd * s + 30 + 30 * i
                            }, color, {
                                align: 'left'
                            });

                        })

                    } else {
                        drawText(ctx, 'Select Control Menu Button', {
                            x: vm.position.x + rd * c + 20,
                            y: vm.position.y + rd * s + 30
                        }, color, {
                            align: 'left'
                        });
                    }
                }
            }


        }
    }

    {
        // インスタンス名を描画
        let instanceName = vm.model.model.instanceName;
        let arrow_progress = progress > 33 ? 100 : progress * 3;
        let base_progress = progress > 66 ? 100 : (progress - 33) * 3;
        let theta = -Math.PI / 5;

        let maxBaseLength = 200;
        let c = Math.cos(theta);
        let s = Math.sin(theta);
        let rr = radius - 20;
        let rd = rr + (100) / 100.0 * arrow_progress;
        let base_length = maxBaseLength / 100.0 * base_progress;
        drawLine(ctx, {x: vm.position.x + rr * c, y: vm.position.y + rr * s}, {x: rd * c + vm.position.x, y: rd*s + vm.position.y},
            color);
        if (base_progress > 0) {
            drawLine(ctx, {
                    x: rd * c + vm.position.x,
                    y: rd * s + vm.position.y
                }, {x: rd * c + vm.position.x + base_length, y: rd * s + vm.position.y},
                color);
        }

        if (progress >= 100) {
            let instance_name_position = {
                x: rd * c + vm.position.x + maxBaseLength/2,
                y: rd * s + vm.position.y - 10
            };

            let button_size = 40;
            let close_button_position = {
                x: instance_name_position.x + maxBaseLength / 2,
                y: instance_name_position.y - button_size /2 - 10
            };

            let title = 'Operation';
            if (vm.type === 'ec') title = 'ExecutionContext';
            else if (vm.type === 'container_operation') title = 'Container Operation';
            else if (vm.type === 'container') title = 'Container';
            drawText(ctx, title, {
                x: rd * c + vm.position.x + 40,
                y: rd * s + vm.position.y - 30
            }, color);

            drawText(ctx, '"' + instanceName + '"', instance_name_position , color);

            // drawRect(ctx, close_button_position, {width: button_size, height: button_size}, color);
        }
    }

    menuParameter.ecButtonState = null;
    if (vm.type === 'container') {
        return;
    }

    if (vm.type === 'ec') {

        menuParameter.ecButtonState = {};
        drawECSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    }


    if (vm.type === 'operation' || vm.type === 'container_operation') {
        drawOperationSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress);
    }
}


function drawECSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {
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



}

function drawOperationSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {

    /// 入出力ボタンの表示
    let icon_progress = progress < 50 ? 0 : (progress - 50) * 2;
    let icon_radius = 40;
    let arc_progress = icon_progress;

    let output_icon_center = {x:vm.position.x + vm.size.width / 2 + 90, y: vm.position.y};
    //this.drawEllipse(ctx, output_icon_center,
    //    {width: icon_radius*2, height: icon_radius*2}, color, {fill: false, lineWidth: 2.0, startAngle: 0, endAngle: Math.PI * 2 / 100 * icon_progress});

    let stopAngle = Math.PI * 1 / 10;
    let startAngle = ((-Math.PI * 3 / 5) - Math.PI / 4) * arc_progress / 100.0 + stopAngle;
    drawArc(ctx, vm.position, radius + 110, stopAngle, startAngle, color, {
        ccw: true,
        lineWidth: 2.0
    });

    if (progress >= 90) {
        let fill = false;
        if (drawer.menuState !== null) {
            fill = true;
        }
        // これは出力ボタンの分！
        drawPi(ctx, vm.position, radius + 100, -Math.PI/16, Math.PI / 16, color, {
            innerRadius: radius + 45,
            fill: fill,
            stroke: !fill,
            lineWidth: 2.0
        });
        // これは出力ボタンの横の装飾の分！
        drawPi(ctx, vm.position, radius + 110, -Math.PI/8, 0, color, {
            innerRadius: radius + 105,
            stroke: false,
            //fill: false,
        });

        menuParameter.outputButtonCenter = {x: vm.position.x + radius + 70, y: vm.position.y};
        drawText(ctx, 'Output', output_icon_center, color);

        // 出力ボタン選択状態の描画するよー
        if (drawer.menuState === 'output_button_clicked') {
            let lineProgress = menuAnimationProgress < 50 ? menuAnimationProgress * 2 : 100;
            let lineLength = 150;
            let lineEnd = {x: vm.position.x + radius + 120 + 20 + lineLength * lineProgress / 100, y: vm.position.y};
            drawLine(ctx, {x: vm.position.x + radius + 120, y: vm.position.y},
                lineEnd, color);

            let w = ctx.measureText('Connections').width;
            let conTitlePos = {x: 0 , y: vm.position.y - 10};
            drawText(ctx, 'Connections', {
                x: lineEnd.x - w / 2,
                y: conTitlePos.y
            }, color);

            let connectorButtonsState = menuParameter.outputButtonState.connectorButtons;
            menuParameter.outputButtonState.connectorButtons = [];
            menuParameter.outputButtonState.deleteButton = null;
            /// 接続があればリストにして表示するよー
            let conProgress = menuAnimationProgress < 50 ? 0 : (menuAnimationProgress - 50) * 2;
            conTitlePos.y += 40;
            console.log('Drawing Connections...', vm);
            for(let i = 0; vm.model.model.connections && i < vm.model.model.connections.output.length;++i) {
                let con = vm.model.model.connections.output[i];
                let w = ctx.measureText(con.name).width;
                drawText(ctx, con.name, {
                    x: lineEnd.x - w/2 - 30,
                    y: conTitlePos.y
                }, color);
                drawRect(ctx, {
                    x: lineEnd.x - 10,
                    y: conTitlePos.y -10}, {width: 22, height: 22}, color);
                menuParameter.outputButtonState.connectorButtons.push({
                    position: {
                        x: lineEnd.x - 10 + 5, y: conTitlePos.y - 10 + 5
                    }, size: {
                        width: 26, height: 26
                    }, connection: con
                });
                // もし，押されてたコネクションボタンが選択中の接続と一致したらDELETEボタンを表示
                if (menuParameter.outputButtonState.pushedConnectorButton !== null &&
                    menuParameter.outputButtonState.pushedConnectorButton.connection == con) {


                    drawRect(ctx, {
                        x: lineEnd.x + 45,
                        y: conTitlePos.y -10}, {width: 70, height: 20}, color);
                    menuParameter.outputButtonState.deleteButton = {
                        position: {
                            x: lineEnd.x + 45,
                            y: conTitlePos.y -10},
                        size:{width: 70, height: 20},
                        connection: con,
                        vm: vm
                    }
                    drawText(ctx, 'DELETE', {x: lineEnd.x + 43, y:conTitlePos.y - 5}, color);


                } else {
                    menuParameter.outputButtonState.deleteButton = null;
                }
                conTitlePos.y += 30;
            }
            w = ctx.measureText("Add Connection...").width;
            drawText(ctx, "Add Connection...", {
                x: lineEnd.x - w/2 - 30,
                y: conTitlePos.y
            }, color);
            drawRect(ctx, {
                x: lineEnd.x - 10,
                y: conTitlePos.y -10}, {width: 22, height: 22}, color);
            menuParameter.outputButtonState.connectorButtons.push({
                position: {
                    x: lineEnd.x - 10 + 5, y: conTitlePos.y - 10 + 5
                }, size: {
                    width: 26, height: 26
                }, connection: null
            });

            // Add Connection... ボタンが押されたとき・・・
            if (menuParameter.outputButtonState.pushedConnectorButton !== null &&
                menuParameter.outputButtonState.pushedConnectorButton.connection == null) {

                /// もし，ターゲットとなるOperationのボタンが押されていたら
                if (menuParameter.outputButtonState.pushedConnectorButton.pushedTargetButton !== null) {
                    menuParameter.outputButtonState.pushedConnectorButton.targetButtons = [];
                    menuParameter.outputButtonState.pushedConnectorButton.argumentButtons = [];
                    let posY = conTitlePos.y - 10 + 35;
                    let target_vm = menuParameter.outputButtonState.pushedConnectorButton.pushedTargetButton.viewModel;
                    let m = target_vm.model;
                    let instanceName = m.model.instanceName;
                    if (m.type === 'container_operation') {
                        instanceName = m.model.ownerContainerInstanceName + '::' + instanceName;
                    }
                    let textWidth = ctx.measureText(instanceName).width;
                    drawRect(ctx, {
                        x: lineEnd.x - 30,
                        y: posY
                    }, {width: 270, height: 20}, color);
                    drawText(ctx, instanceName, {
                        x: lineEnd.x - 50 - 100 + textWidth / 2, y: posY + 5
                    }, color);


                    if (menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton) {
                        let btn = menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.button;
                        let commonBrokers = menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.commonBrokers;
                        menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.brokerButtons = [];

                        console.log('Select Brokers');
                        console.log(menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton)
                        let arg = btn.targetName;
                        posY = posY + 30;
                        drawRect(ctx, {
                            x: lineEnd.x - 30 + 20,
                            y: posY
                        }, {width: 250, height: 20}, color);

                        let textWidth = ctx.measureText(arg).width;

                        drawText(ctx, arg, {
                            x: lineEnd.x - 30 + textWidth / 2, y: posY + 5
                        }, color);

                        posY += 30;
                        for(let b of commonBrokers) {
                            let textWidth = ctx.measureText(b.name).width;
                            drawRect(ctx, {
                                x: lineEnd.x - 30 + 20 + 20,
                                y: posY
                            }, {width: 250, height: 20}, color);
                            drawText(ctx, b.name, {
                                x: lineEnd.x - 30 + textWidth / 2, y: posY + 5
                            }, color);

                            menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.brokerButtons.push({
                                position: {
                                    x: lineEnd.x - 30 + 20 + 20,
                                    y: posY
                                },
                                size: {width: 250, height: 20},
                                broker: b
                            });


                            posY += 30;
                        }

                    } else {
                        /// 引数ボタンを表示
                        console.log('args:', m);
                        posY = posY + 30;
                        for (let arg in m.model.defaultArg) {
                            if (arg.length === 0) continue;
                            drawRect(ctx, {
                                x: lineEnd.x - 30 + 20,
                                y: posY
                            }, {width: 250, height: 20}, color);

                            let textWidth = ctx.measureText(arg).width;

                            drawText(ctx, arg, {
                                x: lineEnd.x - 30 + textWidth / 2, y: posY + 5
                            }, color);

                            menuParameter.outputButtonState.pushedConnectorButton.argumentButtons.push({
                                position: {
                                    x: lineEnd.x - 30 + 20,
                                    y: posY
                                },
                                size: {width: 250, height: 20},
                                targetName: arg,
                                input: target_vm,
                                output: vm
                            });

                            posY += 30;
                        }
                    }

                } else {
                    /// もし，ターゲットとなるOperationのボタンが押されていなかったら
                    let posY = conTitlePos.y - 10 + 35;
                    drawer.viewModels.forEach((vm) => {
                        let m = vm.model;
                        if (m.type === 'operation' || m.type === 'container_operation') {
                            let instanceName = m.model.instanceName;
                            if (m.type === 'container_operation') {
                                instanceName = m.model.ownerContainerInstanceName + '::' + instanceName;
                            }
                            let textWidth = ctx.measureText(instanceName).width;
                            drawRect(ctx, {
                                x: lineEnd.x - 30,
                                y: posY
                            }, {width: 270, height: 20}, color);
                            drawText(ctx, instanceName, {
                                x: lineEnd.x - 50 - 100 + textWidth / 2, y: posY + 5
                            }, color);

                            menuParameter.outputButtonState.pushedConnectorButton.targetButtons.push({
                                position: {
                                    x: lineEnd.x - 30, y: posY
                                },
                                size: {
                                    width: 270, height: 20
                                },
                                viewModel: vm
                            });
                            posY += 30;
                        }
                    });
                }
            }
            conTitlePos.y += 30;
        }

        // ここは入力ボタンの分！個数に応じて表示場所を調整している分！
        if (!vm.model.model.defaultArg) {
            console.error('defaultArg is undefined:', vm);
            return;
        }
        let numOfArgs = Object.keys(vm.model.model.defaultArg).length;
        let startAngle = Math.PI - Math.PI / 16 * numOfArgs;
        for(let arg in vm.model.model.defaultArg) {
            if (arg.length === 0) continue;
            let input_icon_center = {x: vm.position.x - (vm.size.width / 2 + 90), y: vm.position.y};
            let endAngle = startAngle + Math.PI / 8;
            drawPi(ctx, vm.position, radius + 100,  startAngle, endAngle, color, {
                innerRadius: radius + 45,
                fill: false,
                lineWidth: 2.0
            });
            // console.log(arg);
            let theta = (startAngle + endAngle) / 2;
            let textPosition = {
                x: vm.position.x + (vm.size.width / 2 + 90) * Math.cos(theta),
                y: vm.position.y + (vm.size.width / 2 + 90) * Math.sin(theta)
            }
            drawText(ctx, arg, input_icon_center, color);
            startAngle = endAngle;
        }
    }

}