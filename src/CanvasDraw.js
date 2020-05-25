
import {drawEllipse, drawLine, drawPi, drawPolygon, drawEllipseShadow, drawRect, drawText, drawRectShadow} from "./Drawing";
import {drawVM, drawEC, drawECStates} from "./ObjectDrawer";
import {drawContainerConnection, drawECBindConnection, drawOperationConnection} from "./RelationDraw";
import {includes, distanceToLine, distance, offset, rotate, translate} from "./Dimension";
import {menuParameter} from "./MenuParameter";
import {
    drawSelectedVMMenu,
    drawSelectedVMBackground,
    drawSelectedRelationMenu,
    drawSelectedRelationMenuBackground
} from "./MenuDrawer";
import process, {connect, urlToAddr, urlToPort} from "./nerikiri";

export let ViewModel = (m, pos) => {
    if (m.type === 'container') {
        return {
            type: 'container',
            position: pos,
            size: {width: 150, height: 70},
            model: m
        }
    } else if (m.type === 'operation') {
        return {
            type: 'operation',
            position: pos,
            size: {width: 150, height: 70},
            model: m
        }
    } else if (m.type === 'container_operation') {
        return {
            type: 'container_operation',
            position: pos,
            size: {width: 150, height: 70},
            model: m
        }
    } else if (m.type === 'ec') {
        return {
            type: 'ec',
            position: pos,
            size: {width: 150, height: 150},
            model: m
        }
    }
}

let menuOfSelectedVM = (vm) => {

    if (vm.type === 'container') {
        return {};
    }

    if (vm.type === 'ec') {
        return {};
    }

    let margin = 20;
    let menuSize = 20;
    let icons = [];
    let i = 0;

    for(let input in vm.model.model.defaultArg) {
        if (input.length === 0) continue;
        icons.push({
            name: input,
            value: vm.model.model.defaultArg[input],
            position: {x: vm.position.x - vm.size.width/2 - margin,
                y: vm.position.y - vm.size.height/2 + margin * i},
            size: {width: menuSize, height: menuSize}
        });
    }
    return {
        outputIcon: {
            position: {x: vm.position.x + vm.size.width/2 + margin,
                y: vm.position.y},
            size: {width: menuSize, height: menuSize}
        },
        inputIcons: icons
    }
}


export class CanvasDraw {

    constructor(controller) {
        this.controller = controller;
        //this.models = [];
        this.viewModels = [];
        this.selectedViewModel = null;
        this.selectedConnection = null;
        this.pickedPoint = null;
        this.menuProgressed = -1;
        this.menuAnimationProgressed = 100;
        this.canvasOffset = {x: 0, y: 0};
        this.clientSize = {width: 800, height: 800};
        this.backgroundColor = 'black';
        this.operationConnections = [];
        this.menuState = null;
        this.selectedObjectIsRemoving = false;

        this.controller.setOnUpdateModel((ctrlor) => {
            this.validate();
        })
    }

    removeModel(model) {
        for(let i = 0;i < this.viewModels.length;++i) {
            if (this.viewModels[i].model.model.instanceName !== model.model.instanceName) {
                continue;
            }
            if (this.viewModels[i].model.type !== model.type) {
                continue;
            }
            if (model.type === 'container_operation' && model.model.ownerContainerInstanceName !== this.viewModels[i].model.model.ownerContainerInstanceName) {
                continue;
            }

            console.log('found');
            //this.models.splice(i, 1);
            this.viewModels.splice(i, 1);
            break;

        }

        if (model.type === 'container') {
            model.operations.forEach((op) => {
                this.removeModel(op);
            });
        }
    }

    addModel(model, point) {
        for(let vm of this.viewModels) {
            let m = vm.model;
            if (model.type === m.type) {
                if (model.type === 'operation' && m.model.instanceName === model.model.instanceName) {
                    return this;
                } else if (model.type === 'container_operation' && m.model.instanceName === model.model.instanceName && model.model.ownerContainerInstanceName === m.model.ownerContainerInstanceName) {
                    return this;
                } else if (model.type === 'container' && m.model.instanceName === model.model.instanceName) {
                    return this;
                } else if (model.type === 'ec' && m.model.instanceName === model.model.instanceName) {
                    return this;
                }
            }
        }


        if (model.type === 'container_operation') {
            this.addModel({
                type: 'container',
                model: model.ownerContainer,
                processUrl: model.processUrl
            }, {x: point.x - 70, y: point.y});
        }


        //this.models.push(model);
        this.viewModels.push(ViewModel(model, point));

        if (model.type === 'container') {
            console.log(model);
            model.model.operations.forEach((operation, i)=> {

                let data = {
                    type: 'container_operation',
                    processUrl: model.processUrl,
                    model: operation,
                    ownerContainer: model.model
                };


                this.addModel(data, {x: point.x + 70, y: point.y + 70 * i});
            });
        }

        return this;
    }

    getIncludingViewModel(cp) {
        let svm = null;
        this.viewModels.forEach((vm) => {
            if ( includes(vm, cp) ) svm = vm;
        });
        return svm;
    }


    clientPosition(e) {
        let target_rect = e.currentTarget.getBoundingClientRect();
        return {x: e.clientX - target_rect.left - this.canvasOffset.x,
        y: e.clientY - target_rect.top - this.canvasOffset.y};
    }


    onClick(e) {
        //this.selectedViewModel = this.getIncludingViewModel(this.clientPosition(e));
        this.pickedPoint = null;
        this.selectedObjectIsRemoving = false;

        return this;
    }

    onMouseMove(e, cb) {
        // オブジェクト上でマウスダウンがあった場合
        // ドラッグ状態の処理
        if (this.selectedViewModel != null && this.pickedPoint != null) {
            let cp = this.clientPosition(e);
            this.selectedViewModel.position.x += cp.x - this.pickedPoint.x;
            this.selectedViewModel.position.y += cp.y - this.pickedPoint.y;
            this.pickedPoint = cp;

            //console.log(cp);

            if (cp.x + this.canvasOffset.x < 100) { // Dragging Object is removing {
                this.selectedObjectIsRemoving = true;
            } else {
                this.selectedObjectIsRemoving = false;
            }
            if (cb !== undefined) {
                cb(this);
            }
        }

        /// キャンバス場でマウスダウンがあった場合
        if (this.selectedViewModel === null && this.pickedPoint != null) {
            let cp = this.clientPosition(e);
            this.canvasOffset.x += cp.x - this.pickedPoint.x;
            this.canvasOffset.y += cp.y - this.pickedPoint.y;
            if (this.canvasOffset.x > 4000) this.canvasOffset.x = 4000;
            if (this.canvasOffset.x < -4000) this.canvasOffset.x = -4000;
            if (this.canvasOffset.y > 4000) this.canvasOffset.y = 4000;
            if (this.canvasOffset.y < -4000) this.canvasOffset.y = -4000;
            //this.pickedPoint = cp;
            if (cb !== undefined) {
                cb(this);
            }
        }
        return this;
    }

    checkMenuButtonClicked(point) {
        /// ECのメニューが表示されているとき
        if (menuParameter.ecButtonState) {
            if (includes(menuParameter.ecButtonState.startButtonState, point)) {
                this.onChangeECState(menuParameter.ecButtonState.viewModel, 'started');
                return true;
            } else if (includes(menuParameter.ecButtonState.stopButtonState, point)) {
                this.onChangeECState(menuParameter.ecButtonState.viewModel, 'stopped');
                return true;
            }
            return false;
        }

        if(distance(point, menuParameter.outputButtonCenter) < 30.0) {
            this.menuState = 'output_button_clicked';
            this.menuAnimationProgressed = -1;
            menuParameter.outputButtonState.pushedConnectorButton = null;

            return true;
        } else {
            for(let cb of menuParameter.outputButtonState.connectorButtons) {
                if (includes(cb, point)) {
                    menuParameter.outputButtonState.pushedConnectorButton = cb;
                    menuParameter.outputButtonState.pushedConnectorButton.targetButtons = [];
                    menuParameter.outputButtonState.pushedConnectorButton.pushedTargetButton = null;

                    return true;
                }
            }
            if (menuParameter.outputButtonState.deleteButton !== null && menuParameter.outputButtonState.deleteButton !== undefined) {
                if (includes(menuParameter.outputButtonState.deleteButton, point)) {
                    /// DELETEボタンが押された
                    let connection = menuParameter.outputButtonState.deleteButton.connection;
                    this.onDeleteButtonClicked(menuParameter.outputButtonState.deleteButton);
                    menuParameter.outputButtonState.pushedConnectorButton = null;

                }
            }
            if (menuParameter.outputButtonState.pushedConnectorButton !== null) {
                for(let i = 0;menuParameter.outputButtonState.pushedConnectorButton && i < menuParameter.outputButtonState.pushedConnectorButton.targetButtons.length;++i) {
                    let btn = menuParameter.outputButtonState.pushedConnectorButton.targetButtons[i];
                    if (includes(btn, point)) {
                        menuParameter.outputButtonState.pushedConnectorButton.pushedTargetButton = btn;
                        return true;
                    }
                }
            }

            /// 引数ボタンが押されていたらConnect処理を始めます
            if (menuParameter.outputButtonState.pushedConnectorButton && menuParameter.outputButtonState.pushedConnectorButton.argumentButtons) {
                if (menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton) {

                    for(let i = 0;i < menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.brokerButtons.length;i++) {
                        let bbtn = menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.brokerButtons[i];
                        if (includes(bbtn, point)) {
                            let btn = menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.button;

                            let inputP = process(btn.input.model.processUrl);
                            let inputB_promise = inputP.brokerInfos();
                            let outputP = process(btn.output.model.processUrl);
                            let outputB_promise = outputP.brokerInfos();
                            let connectionBroker = bbtn.broker;
                            let connectionName = 'connection';
                            let inputInstanceName = btn.input.model.model.instanceName;
                            if (btn.input.model.type === 'container_operation') {
                                inputInstanceName = btn.input.model.model.ownerContainerInstanceName + ':' + inputInstanceName;
                            }
                            let outputInstanceName = btn.output.model.model.instanceName;
                            if (btn.output.model.type === 'container_operation') {
                                outputInstanceName = btn.output.model.model.ownerContainerInstanceName + ':' + outputInstanceName;
                            }
                            let connectionInfo = {
                                name: connectionName,
                                broker: connectionBroker,
                                input: {
                                    broker: {
                                        name: 'HTTPBroker',
                                        host: urlToAddr((btn.input.model.processUrl)),
                                        port: urlToPort(btn.input.model.processUrl)
                                    },
                                    info: {
                                        instanceName: inputInstanceName
                                    },
                                    target: {
                                        name: btn.targetName
                                    }
                                },
                                output: {
                                    broker: {
                                        name: 'HTTPBroker',
                                        host: urlToAddr((btn.input.model.processUrl)),
                                        port: urlToPort(btn.input.model.processUrl)
                                    },
                                    info: {
                                        instanceName: outputInstanceName
                                    },
                                },
                                type: 'event'
                            }

                            console.log('connectionInfo:', connectionInfo);
                            connect(outputP, connectionInfo).then((info) => {
                                this.controller.update();
                            }).catch((err) => {
                                console.log('Not Connected: ', err);
                            })
                        }
                    }
                }

                menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton = null;

                for(let i = 0;i < menuParameter.outputButtonState.pushedConnectorButton.argumentButtons.length;++i) {
                    let btn = menuParameter.outputButtonState.pushedConnectorButton.argumentButtons[i];
                    if (includes(btn, point)) {
                        //menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton.brokerButtons = [];

                        console.log('Connect:', btn);
                        let inputP = process(btn.input.model.processUrl);
                        let inputB_promise = inputP.brokerInfos()
                        let outputP = process(btn.output.model.processUrl);
                        let outputB_promise = outputP.brokerInfos()

                        let p = Promise.all([inputB_promise, outputB_promise]);

                        let commonBrokers = [];

                        if (btn.input.model.processUrl === btn.output.model.processUrl) {
                            commonBrokers.push({
                                name: "CoreBroker"
                            });
                        }

                        p.then((ps) => {
                            console.log('Searching Common Brokers:', ps);
                            for(let b1 of ps[0]) {
                                for(let b2 of ps[1]) {
                                    if (b1.name === b2.name) {
                                        commonBrokers.push(b1);
                                    }
                                }
                            }
                        });

                        menuParameter.outputButtonState.pushedConnectorButton.pushedArgumentButton = {
                            commonBrokers: commonBrokers,
                            button: btn,
                        }
                        return true;
                    }
                }
            }
        }
        this.menuState = null;
        menuParameter.outputButtonState.pushedConnectorButton = null;

        return false;
    }

    onMouseDown(e) {
        let cp = this.clientPosition(e);

        // メニューが表示されてたらボタンチェックするよ
        if (this.menuProgressed >= 100) {
            if (this.checkMenuButtonClicked(cp)) {
                //this.menuProgressed = -1;
                this.selectedConnection = null;
                this.pickedPoint = cp;
                return this;
            }
        }

        let vm  =this.getIncludingViewModel(cp);
        if (this.selectedViewModel != vm) {
            this.menuProgressed = -1;
            this.selectedConnection = null;
        }
        this.selectedViewModel = vm;

        if (this.selectedViewModel === null) {
            this.selectedConnection = this.checkConnectionIsSelected(this.operationConnections, cp);
        }

        this.pickedPoint = cp;
        return this;
    }

    onMouseUp(e) {
        if (this.selectedObjectIsRemoving) {
            this.removeModel(this.selectedViewModel.model);
            this.selectedViewModel = null;
        }
        this.pickedPoint = this.clientPosition(e);
        this.selectedObjectIsRemoving = false;

        return this;
    }

    onMouseLeave(e) {
        this.pickedPoint = null;
        this.selectedObjectIsRemoving = false;

        return this;
    }

    checkConnectionIsSelected(connections, clickedPoint) {
        for(let connection of connections) {
            let d = distanceToLine(clickedPoint, connection.line);
            if (Math.abs(d) < 20) {
                return connection;
            }
        }
        return null;
    }


    isSelectedVM(vm) {
        if (this.selectedViewModel === null) {
            return false;
        }
        return (vm.model == this.selectedViewModel.model) ;
    }

    drawBackground(ctx) {

        ctx.fillStyle = this.backgroundColor;
        ctx.beginPath();
        ctx.fillRect(-4000, -4000, this.clientSize.width+8000, this.clientSize.height+8000);
        ctx.fill();
        ctx.closePath();

        let color = 'white';
        ctx.shadowColor = color;
        ctx.shadowOffsetX = 4000;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 300;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(400 - 4000, 200, 100, 100, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();


        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(200 - 4000, 100, 80, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.shadowColor = color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        if (this.selectedObjectIsRemoving) {
            ctx.fillRect(-this.canvasOffset.x, -this.canvasOffset.y, 100, this.clientSize.height+8000)
        }
    }

    drawCanvas(ctx) {
        ctx.translate(this.canvasOffset.x, this.canvasOffset.y);
        this.drawBackground(ctx);

        drawSelectedVMBackground(ctx, this.selectedViewModel);
        drawSelectedRelationMenuBackground(ctx, this.selectedConnection);

        this.operationConnections = [];
        this.viewModels.forEach((vm) => {
            drawContainerConnection(this, ctx, vm);
            drawOperationConnection(this, ctx, vm);
        });

        this.viewModels.forEach((vm) => {
            drawEC(this, ctx, vm);
        });

        this.viewModels.forEach((vm) => {
            drawECBindConnection(this, ctx, vm);
        });

        this.viewModels.forEach((vm) => {
            drawVM(this, ctx, vm);
        });

        if (!this.selectedObjectIsRemoving) {
            drawSelectedVMMenu(this, ctx, this.selectedViewModel);
            drawSelectedRelationMenu(this, ctx, this.selectedConnection);
        }

        ctx.translate(-this.canvasOffset.x, -this.canvasOffset.y);
    }

    onDeleteButtonClicked(deleteButton) {
        console.log('Delete Button clicked:', deleteButton);
        let connection = deleteButton.connection;
        console.log(deleteButton);
        let processUrl = deleteButton.vm.model.processUrl;
        this.controller.deleteConnection(processUrl, connection);
    }

    onChangeECState(vm, state) {
        console.log('onChangeECState:', vm, state);
        let processUrl = vm.model.processUrl;
        return this.controller.changeECState(processUrl, vm.model.model, state);
    }

    validate() {
        console.log('validate()');
        // ViewModelとController内のモデルとの照合

        // 描画中のViewModeについて
        this.viewModels.forEach((vm) => {
            let url = vm.model.processUrl;
            this.controller.getProcesses().forEach((p) => {
                if (p.url() === vm.model.processUrl) {
                    let m = vm.model.model;
                    if (vm.model.type === 'operation' && p) {
                        p.props.operations.forEach((op) => {
                            if (op.instanceName === m.instanceName) {
                                vm.model.model = op;
                            }
                        });
                    } else if (vm.model.type === 'container') {

                    } else if (vm.model.type === 'container_operation') {
                        p.props.containers.forEach((con) => {
                            con.operations.forEach((op) => {
                                if (op.instanceName === m.instanceName) {
                                    vm.model.model = op;
                                }
                            })
                        })
                    } else if (vm.model.type === 'ec') {
                        p.props.ecs.forEach((ec) => {
                            if (ec.instanceName === m.instanceName) {
                                vm.model.model = ec;
                            }
                        });
                    }
                }
            })
        })
    }
}
