import {menuParameter} from "./MenuParameter";
import {drawArc, drawLine, drawPi, drawRect, drawText, Ncos, Nsin} from "./Drawing";



export function drawOperationSpecialMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {

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

            if (conProgress > 50) {


                conTitlePos.y += 40;
                //console.log('Drawing Connections...', vm);
                for (let i = 0; vm.model.info.outlet.connections && i < vm.model.info.outlet.connections.length; ++i) {
                    let con = vm.model.info.outlet.connections[i];
                    //let w = ctx.measureText(con.name).width;

                    console.log('Con:', con);
                    let fullName = con.inlet.fullName;
                    drawRect(ctx, {
                        x: vm.position.x + radius + 120 + 140,
                        y: conTitlePos.y - 5
                    }, {width: 280, height: 30}, color);

                    drawText(ctx, fullName, {
                        //x: lineEnd.x - w/2 - 30,
                        x: vm.position.x + radius + 120,
                        y: conTitlePos.y
                    }, color, {
                        align: 'left'
                    });


                    menuParameter.outputButtonState.connectorButtons.push({
                        position: {
                            x: vm.position.x + radius + 120 + 140,
                            y: conTitlePos.y - 5
                        }, size: {width: 280, height: 30}, connection: con
                    });
                    // もし，押されてたコネクションボタンが選択中の接続と一致したらDELETEボタンを表示
                    if (menuParameter.outputButtonState.pushedConnectorButton !== null &&
                        menuParameter.outputButtonState.pushedConnectorButton.connection == con) {


                        drawRect(ctx, {
                            x: lineEnd.x + 155,
                            y: conTitlePos.y - 5
                        }, {width: 70, height: 40}, color);
                        menuParameter.outputButtonState.deleteButton = {
                            position: {
                                x: lineEnd.x + 155,
                                y: conTitlePos.y - 5
                            },
                            size: {width: 70, height: 20},
                            connection: con,
                            vm: vm
                        }
                        drawText(ctx, 'DELETE', {x: lineEnd.x + 153, y: conTitlePos.y}, color);


                    } else {
                        menuParameter.outputButtonState.deleteButton = null;
                    }
                    conTitlePos.y += 35;
                }
                w = ctx.measureText("Add Connection...").width;

                drawRect(ctx,
                    {
                        x: vm.position.x + radius + 120 + 140,
                        y: conTitlePos.y - 5
                    },
                    //{x: lineEnd.x - 10, y: conTitlePos.y -10},
                    {width: 280, height: 30}, color);
                drawText(ctx, "Add Connection...", {

                    x: vm.position.x + radius + 120,
                    y: conTitlePos.y
                }, color, {align: 'left'});

                menuParameter.outputButtonState.connectorButtons.push({
                    position: {
                        x: vm.position.x + radius + 120 + 140,
                        y: conTitlePos.y - 5
                    }, size: {width: 280, height: 30}, connection: null
                });

                // Add Connection... ボタンが押されたとき・・・
                if (menuParameter.outputButtonState.pushedConnectorButton !== null &&
                    menuParameter.outputButtonState.pushedConnectorButton.connection == null) {

                    /// もし，ターゲットとなるOperationのボタンが押されていたら
                    if (menuParameter.outputButtonState.pushedConnectorButton.pushedTargetButton !== null) {
                        menuParameter.outputButtonState.pushedConnectorButton.targetButtons = [];
                        menuParameter.outputButtonState.pushedConnectorButton.argumentButtons = [];
                        let posY = conTitlePos.y - 10 + 50;
                        let target_vm = menuParameter.outputButtonState.pushedConnectorButton.pushedTargetButton.viewModel;
                        let m = target_vm.model;
                        let instanceName = m.model.fullName;
                        //if (m.type === 'container_operation') {
                        //    instanceName = m.model.ownerContainerInstanceName + '::' + instanceName;
                        //}
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

                            //console.log('Select Brokers');
                            //console.log(menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton)
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
                            for (let b of commonBrokers) {
                                let textWidth = ctx.measureText(b.fullName).width;
                                drawRect(ctx, {
                                    x: lineEnd.x - 30 + 20 + 20,
                                    y: posY
                                }, {width: 250, height: 20}, color);
                                drawText(ctx, b.fullName, {
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
                            //
                            // console.log('args:', m);
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
                        let posY = conTitlePos.y - 10 + 50;
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

            }
            conTitlePos.y += 30;
        }

        // ここは入力ボタンの分！個数に応じて表示場所を調整している分！
        if (!vm.model.info.inlets) {
            // console.error('defaultArg is undefined:', vm);
            // return;
        }
        let numOfArgs = vm.model.info.inlets.length;
        let startAngle = Math.PI - Math.PI / 16 * numOfArgs;
        for(let inlet of vm.model.info.inlets) {
            let arg = inlet.defaultValue;
            let argName = inlet.name;
            // console.log('arg is ', inlet);
            if (arg.length === 0) continue;
            let input_icon_center = {
                x: vm.position.x - (vm.size.width / 2 + 90),
                y: vm.position.y};
            let endAngle = startAngle + Math.PI / 8;
            drawPi(ctx, vm.position, radius + 100,  startAngle, endAngle, color, {
                innerRadius: radius + 45,
                fill: false,
                lineWidth: 2.0
            });
            // console.log(arg);
            let theta = (startAngle + endAngle) / 2;
            let textPosition = {
                x: vm.position.x + (vm.size.width / 2 + 90) * Ncos(theta),
                y: vm.position.y + (vm.size.width / 2 + 90) * Nsin(theta)
            }
            drawText(ctx, argName, textPosition, color);
            startAngle = endAngle;
        }
    }

}


export function drawOperationControlMenu(drawer, ctx, vm, radius, color, progress, menuAnimationProgress) {
    if (vm.type !== 'Operation') return;

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
            // Invoke
            drawRect(ctx, {
                x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y
            }, {
                width: 80, height: 50 * menuProgress / 100
            }, color);

            // Cyclic Invoke
            drawRect(ctx, {
                x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y + 60
            }, {
                width: 80, height: 50 * menuProgress / 100
            }, color);

            // Execute
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
                    viewModel: vm,
                    name: 'Invoke'
                };
                menuParameter.operationControlButtonState.executeButton = {
                    position: {
                        x: vm.position.x - 45 + 90, y: anchor.y + 25 + vm.position.y
                    },
                    size: {
                        width: 80, height: 50 * menuProgress / 100
                    },
                    viewModel: vm,
                    name: 'Execute'
                };
                menuParameter.operationControlButtonState.cyclicButton = {
                    position: {
                        x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y + 60
                    },
                    size: {
                        width: 80, height: 50 * menuProgress / 100
                    },
                    viewModel: vm,
                    name: 'Cyclic'
                };

                drawText(ctx, 'Invoke', {
                    x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y
                }, color);
                drawText(ctx, 'Cyclic', {
                    x: vm.position.x - 45, y: anchor.y + 25 + vm.position.y + 60
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
        let c = Ncos(theta);
        let s = Nsin(theta);
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
                    if (menuParameter.operationControlButtonState.outputLog.__TYPE__ === '__IMAGE__') {
                        if (!menuParameter.operationControlButtonState.outputLog.__rawImage__) {
                            menuParameter.operationControlButtonState.outputLog.__rawImage__
                                = atob(menuParameter.operationControlButtonState.outputLog.data.__byte64__);
                        }

                        let thumbnailWidth = 200;
                        let size = {width: menuParameter.operationControlButtonState.outputLog.cols, height: menuParameter.operationControlButtonState.outputLog.rows};
                        let scale = thumbnailWidth / menuParameter.operationControlButtonState.outputLog.cols;
                        if (!menuParameter.operationControlButtonState.outputLog.__newCanvas__) {
                            let newCanvas = document.createElement("canvas");
                            newCanvas.setAttribute('width', size.width.toString());
                            newCanvas.setAttribute('height', size.height.toString());
                            newCanvas.width = size.width;
                            newCanvas.height = size.height;

                            let imageData = ctx.getImageData(0, 0, size.width, size.height);
                            let data = imageData.data;

                            let k = 0;
                            for(let i = 0;i < data.length;i += 4) {
                                data[i] = menuParameter.operationControlButtonState.outputLog.__rawImage__.charCodeAt(k+2);
                                data[i+1] = menuParameter.operationControlButtonState.outputLog.__rawImage__.charCodeAt(k+1);
                                data[i+2] = menuParameter.operationControlButtonState.outputLog.__rawImage__.charCodeAt(k+0);
                                k += 3;
                            }
                            newCanvas.getContext('2d').putImageData(imageData, 0, 0);
                            menuParameter.operationControlButtonState.outputLog.__newCanvas__ = newCanvas;
                        }

                        //console.log('Image size:', menuParameter.operationControlButtonState.outputLog.__rawImage__.length);
                        //console.log(menuParameter.operationControlButtonState.outputLog.__rawImage__);
                        drawText(ctx, 'IMAGE', {
                            x: vm.position.x + rd * c + 20,
                            y: vm.position.y + rd * s + 30 + 30 * 0
                        }, color, {
                            align: 'left'
                        });

                        ctx.scale(scale, scale);
                        ctx.drawImage(menuParameter.operationControlButtonState.outputLog.__newCanvas__, vm.position.x / scale + (rd * c + 20) / scale, vm.position.y/scale  + (rd * s + 30 + 30)/scale);
                        ctx.scale(1/scale, 1/scale);
                    } else {
                        //let outputLog = menuParameter.operationControlButtonState.outputLog;
                        let replacer = (key, value) => {
                            if (value instanceof Array) {
                                if (value.length > 50) {
                                    return "Long Array";
                                }
                                return "Array[" + value.toString() + "]";
                            }
                            if (typeof (value) === "string") {
                                if (value.length > 50) {
                                    return "Long String...";
                                }
                                return value;
                            }
                            return value;
                        }
                        //console.log('Stringifying....');
                        let text = JSON.stringify(menuParameter.operationControlButtonState.outputLog, replacer, 2);
                        //console.log('Stringfied');
                        let ts = text.split('\n');
                        ts.forEach((t, i) => {
                            drawText(ctx, t, {
                                x: vm.position.x + rd * c + 20,
                                y: vm.position.y + rd * s + 30 + 30 * i
                            }, color, {
                                align: 'left'
                            });

                        })
                    }
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