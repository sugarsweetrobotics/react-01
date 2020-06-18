
import {drawVM, drawEC} from "./ObjectDrawer";
import {
    drawCallbackBindConnection,
    drawContainerConnection,
    drawECBindConnection,
    drawOperationConnection, drawTopicConnection
} from "./RelationDraw";
import {includes, distanceToLine, distance} from "./Dimension";
import {menuParameter} from "./MenuParameter";
import {
    drawSelectedVMMenu,
    drawSelectedVMBackground,
    drawSelectedRelationMenu,
    drawSelectedRelationMenuBackground
} from "./MenuDrawer";
import process, {connect, urlToAddr, urlToPort} from "./nerikiri";

import {drawLine, drawArc, drawText} from "./Drawing";
import {drawLeftSideMenu} from "./SideMenuDrawer";

export let ViewModel = (m, pos) => {
    if (m.type === 'container') {
        return {
            type: 'container',
            position: pos,
            size: {width: 150, height: 70},
            model: m
        }
    } else if (m.type === 'topic') {
        return {
            type: 'topic',
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
    } else if (m.type === 'callback') {
        return {
            type: 'callback',
            position: pos,
            size: {width: 150, height: 50},
            model: m
        }
    }
}
/*
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
*/

export class CanvasDraw {

    constructor(controller, updateCanvasFunc) {
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
        this.scrolling = false;
        this.leftSideMenuButtons = [];
        this.leftSideMenuRotateAngle = 0.0;

        this.controller.setOnUpdateModel((ctrlor) => {
            this.validate();
        })

        this.updateCanvas = ()=>updateCanvasFunc()
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

            /// console.log('found');
            //this.models.splice(i, 1);
            this.viewModels.splice(i, 1);
            break;

        }

        if (model.type === 'container') {
            if (model.operations) {
                model.operations.forEach((op) => {
                    this.removeModel(op);
                });
            }
        }
    }

    addModel(model, point) {
        /// 重複登録を避ける
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
                } else if (model.type === 'callback' && m.model.name === model.model.name) {
                    return this;
                } else if (model.type === "topic" && m.model.instanceName === model.model.instanceName) {
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
            // console.log(model);
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
        // console.log('clientPosition:', e.clientX, e);
        if (e.clientX) {
            let target_rect = e.currentTarget.getBoundingClientRect();
            return {
                x: e.clientX - target_rect.left - this.canvasOffset.x,
                y: e.clientY - target_rect.top - this.canvasOffset.y
            };
        } else {
            /// Touchのとき
            let target_rect = e.target.getBoundingClientRect();
            // console.log('target_rect:', target_rect);
            return {
                x: e.clientX - target_rect.left - this.canvasOffset.x,
                y: e.clientY - target_rect.top - this.canvasOffset.y
            };
        }

    }


    onClick(e) {
        //this.selectedViewModel = this.getIncludingViewModel(this.clientPosition(e));
        this.pickedPoint = null;
        this.selectedObjectIsRemoving = false;

        return this;
    }

    onMouseMove(e, cb) {
        //console.log('onMouseMove(', e, ')');
        // 左サイドメニューでクリックがあった場合
        if (this.leftSideMenuClicked && this.pickedPoint) {
            let cp = this.clientPosition(e);
            //this.selectedViewModel.position.x += cp.x - this.pickedPoint.x;
            this.leftSideMenuRotateAngle += (cp.y - this.pickedPoint.y) * 0.01;
            this.pickedPoint = cp;
            cb(this);
            return this;
        }

        // オブジェクト上でマウスダウンがあった場合
        // ドラッグ状態の処理
        if (this.selectedViewModel != null && this.pickedPoint != null && !this.scrolling) {
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
        if ((this.selectedViewModel === null && this.pickedPoint != null)|| this.scrolling) {
            let cp = this.clientPosition(e);
            //console.log('clickedPoint:', cp);
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
        if (menuParameter.ecButtonState.startButtonState) {
            console.info('check EC Button state');
            if (includes(menuParameter.ecButtonState.startButtonState, point)) {
                this.onChangeECState(menuParameter.ecButtonState.viewModel, 'started');
                return true;
            } else if (includes(menuParameter.ecButtonState.stopButtonState, point)) {
                this.onChangeECState(menuParameter.ecButtonState.viewModel, 'stopped');
                return true;
            }

            if (menuParameter.ecButtonState.bindOperationTargetButtons) {
                menuParameter.ecButtonState.bindOperationTargetButtons.forEach((btn) => {
                    if (includes(btn, point)) {
                        console.log('Bind Operation');
                        this.onBindOperationToEC(btn.ec, btn.viewModel);
                    }
                })
            }

            //// Bounded Operationのリストが表示されているとき
            if (menuParameter.ecButtonState.boundedOperationButtons.length > 0) {
                for(let i = 0;i <  menuParameter.ecButtonState.boundedOperationButtons.length;++i) {
                    let btn =  menuParameter.ecButtonState.boundedOperationButtons[i];
                    if (includes(btn, point)) {
                        console.log('pushed button:', btn);
                        menuParameter.ecButtonState.selectedButton = btn;
                        if (btn.operation === null) {
                            // Bind Operation Buttonが押された
                            // console.log('pushed bind operation');
                            menuParameter.ecButtonState.bindOperationState = true;
                            menuParameter.ecButtonState.selectOperationState = null;
                            //menuParameter.ecButtonState.bindOperationTargetButtons = []
                        } else {
                            // どれかの選択肢が押された
                            // console.log('pushed not bind operation');
                            menuParameter.ecButtonState.bindOperationState = false;
                            menuParameter.ecButtonState.selectOperationState = {};


                            //this.onBindOperationToEC(btn.ec, btn.viewModel);

                        }
                        return true;
                    }
                    menuParameter.ecButtonState.bindOperationState = false;
                    //if (menuParameter.ecButtonState.selectOperationState) {
                    //    menuParameter.ecButtonState.selectOperationState = null;
                    //}
                }

                /// DELETEボタン確認
                console.log('DELETE?:', menuParameter.ecButtonState);
                if (menuParameter.ecButtonState.selectOperationState) {
                    console.log('DELETE BUTTON  CHECK...');
                    let deleteButton = menuParameter.ecButtonState.selectOperationState.deleteButton;
                    if (deleteButton && includes(deleteButton, point)) {
                        console.log('DELETED BOUND OPERATION!!;', deleteButton.operation);
                        this.onUnbindOperation(deleteButton.ec, deleteButton.operation);
                        return true;
                    } else {
                        menuParameter.ecButtonState.selectOperationState = null;
                    }
                }


            }

            menuParameter.ecButtonState = {};
        }

        /// Operationの操作ボタンが表示されているとき
        if (menuParameter.operationControlButtonState) {

            console.info('check Operation Button state');
            if (distance(point, menuParameter.operationControlButtonState.button.position) < menuParameter.operationControlButtonState.button.radius) {
                if (!menuParameter.operationControlButtonState.pushedButton) {
                    menuParameter.operationControlButtonState.pushedButton = {};
                    this.menuAnimationProgressed = -1;
                    return true;
                }
            } else if (menuParameter.operationControlButtonState.pushedButton){
                if (includes(menuParameter.operationControlButtonState.invokeButton, point)) {
                    //console.log('Invoke');
                    this.onInvokeOperation(menuParameter.operationControlButtonState.invokeButton.viewModel.model);
                    return true;
                } else if (includes(menuParameter.operationControlButtonState.executeButton, point)) {
                    //console.log('Execute');
                    this.onExecuteOperation(menuParameter.operationControlButtonState.invokeButton.viewModel.model);
                    return true;
                } else if (includes(menuParameter.operationControlButtonState.cyclicButton, point)) {
                    //console.log('Execute');
                    this.onCyclicOperation(menuParameter.operationControlButtonState.invokeButton.viewModel.model);
                    return true;
                }
            }
            menuParameter.operationControlButtonState = null;
        }

        // 出力ボタンにクリックがあったとき
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
                    // let connection = menuParameter.outputButtonState.deleteButton.connection;
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

                            // let inputP = process(btn.input.model.processUrl);
                            // let inputB_promise = inputP.brokerInfos();
                            let outputP = process(btn.output.model.processUrl);
                            // let outputB_promise = outputP.brokerInfos();
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

                            // console.log('connectionInfo:', connectionInfo);
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

                        // console.log('Connect:', btn);
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
                            // console.log('Searching Common Brokers:', ps);
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
        if (e.metaKey) {
            this.scrolling = true;
            this.pickedPoint = cp;
            return this;
        }

        // もし左サイドメニューが表示されていたら
        if (this.leftSideMenu) {
            let center = this.leftSideMenuCenter;
            let d = distance(center, cp);
            // console.log('leftSide:', center, cp, d);
            if (d < 150) {
                this.leftSideMenuClicked = true;
                this.pickedPoint = cp;
                this.selectedConnection = null;
                this.selectedViewModel = null;
                return this;
            } else {
                this.leftSideMenuClicked = false;
            }
        }

        // メニューが表示されてたらボタンチェックするよ
        if (this.menuProgressed >= 100) {
            if (this.checkMenuButtonClicked(cp)) {
                //this.menuProgressed = -1;
                this.selectedConnection = null;
                this.pickedPoint = cp;
                return this;
            }
        }

        let vm = this.getIncludingViewModel(cp);
        //if (this.selectedViewModel && this.selectedViewModel.is(vm)) {
        if (this.selectedViewModel != vm) {
            if (vm !== null) {
                this.menuProgressed = -1;
                this.selectedConnection = null;
                this.selectedViewModel = vm;
            }
        }

        this.scrolling = false;
        this.selectedViewModel = vm;

        if (this.selectedViewModel === null) {
            this.selectedConnection = this.checkConnectionIsSelected(this.operationConnections, cp);
        }

        this.pickedPoint = cp;


        return this;
    }

    onMouseUp(e) {
        if (this.leftSideMenuClicked && this.pickedPoint) {
            let cp = this.clientPosition(e);

            let center = this.leftSideMenuCenter;
            let d = distance(center, cp);
            console.log('leftSide:', center, cp, d);

            this.leftSideMenuButtons.forEach((btn)=> {
                if (btn.innerR < d && btn.outerR > d) {
                    let dx = center.x - cp.x;
                    let dy = center.y - cp.y;
                    let th = Math.atan2(-dy, -dx);
                    if (th < btn.angleMax && th > btn.angleMin) {
                        //console.log("btn:", btn.name);
                        btn.clicked = true;
                    } else {
                        btn.clicked = false;
                    }
                }
            });
            return this;
        }

        if (this.selectedObjectIsRemoving) {
            this.removeModel(this.selectedViewModel.model);
            this.selectedViewModel = null;
        }
        this.pickedPoint = this.clientPosition(e);
        this.selectedObjectIsRemoving = false;
        this.scrolling = false;
        this.leftSideMenuClicked = false;

        return this;
    }

    onMouseLeave(e) {
        this.pickedPoint = null;
        this.selectedObjectIsRemoving = false;
        this.scrolling = false;
        return this;
    }

    checkConnectionIsSelected(connections, clickedPoint) {
        for(let connection of connections) {
            let center = {x: (connection.line.x0 + connection.line.x1)/2, y: (connection.line.y0 + connection.line.y1)/2};
            let lineLength = Math.sqrt((connection.line.x0-connection.line.x1)**2 + (connection.line.y0-connection.line.y1)**2);
            if (distance(center, clickedPoint) > lineLength / 2) continue;
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
        return this.controller.changeECState(processUrl, vm.model.model, state).then((info) => {
            this.validate();
            //this.controller.update();
        });
    }

    onInvokeOperation(vm) {
        console.log('onInvokeOperation:', vm);
        let processUrl = vm.processUrl;
        return this.controller.invokeOperation(processUrl, vm.model).then((info) => {
            menuParameter.operationControlButtonState.outputLog = info;
            console.log("onInvokeOperation: done.");
            this.validate();
            console.log("onInvokeOperation: validated");
            //this.controller.update();]
            console.log('updateCanvas/....');
            this.updateCanvas();
            return info;
        }).catch((error) => {
            console.log('onInvokeOperation: error.', error);
        });
    }

    onCyclicOperation(vm) {
        console.log('onCyclicOperation:', vm);
        let processUrl = vm.processUrl;
        let handler = () => {
            return this.controller.invokeOperation(processUrl, vm.model).then((info) => {
                if (!menuParameter.operationControlButtonState) return info;

                menuParameter.operationControlButtonState.outputLog = info;
                this.updateCanvas();
                /*menuParameter.operationControlButtonState.outputLog.timer.*/
                setTimeout(handler, 100);
                return info;
            }).catch((error) => {
                console.log('onCyclicOperation: error.', error);
            });
        };/*
        menuParameter.operationControlButtonState.outputLog.timer = */
        setTimeout(handler, 100);
    }

    onExecuteOperation(vm) {
        console.log('onExecuteOperation:', vm);
        let processUrl = vm.processUrl;
        return this.controller.executeOperation(processUrl, vm.model).then((info) => {
            menuParameter.operationControlButtonState.outputLog = info;
            this.validate();
            //this.controller.update();
        });
    }

    onUnbindOperation(ecVM, operation) {
        let processUrl = ecVM.model.processUrl;
        console.log('onUnbindOperation(', ecVM, operation, ')');
        this.controller.unbindOperation(processUrl, ecVM.model.model, operation).then((info) => {
            this.validate();
        })
    }

    onBindOperationToEC(ecVM, opVM) {
        let processUrl = ecVM.model.processUrl;
        console.log('onBindOperationToEC(', ecVM, opVM, ')')
        this.controller.bindOperation(processUrl, ecVM.model.model, opVM.model.model).then((info) => {
            this.validate();
        })
    }


    validate() {
        //console.log('validate()');
        // ViewModelとController内のモデルとの照合

        // 描画中のViewModeについて
        this.viewModels.forEach((vm) => {
            // let url = vm.model.processUrl;
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
                                if (op.instanceName === m.instanceName && op.ownerContainerInstanceName === m.ownerContainerInstanceName) {
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


    drawCanvas(ctx) {
        ctx.nkScale = 1.0;
        ctx.translate(this.canvasOffset.x, this.canvasOffset.y);
        this.drawBackground(ctx);
        drawSelectedVMBackground(ctx, this.selectedViewModel);
        drawSelectedRelationMenuBackground(ctx, this.selectedConnection);

        this.operationConnections = [];
        this.viewModels.forEach((vm) => {
            drawContainerConnection(this, ctx, vm);
            drawOperationConnection(this, ctx, vm);
            drawTopicConnection(this, ctx, vm);
        });

        this.viewModels.forEach((vm) => {
            drawEC(this, ctx, vm);
        });

        this.viewModels.forEach((vm) => {
            drawECBindConnection(this, ctx, vm);
            drawCallbackBindConnection(this, ctx, vm);
        });

        this.viewModels.forEach((vm) => {
            drawVM(this, ctx, vm);
        });

        if (!this.selectedObjectIsRemoving) {
            drawSelectedVMMenu(this, ctx, this.selectedViewModel);
            drawSelectedRelationMenu(this, ctx, this.selectedConnection);
        }

        if (!this.selectedViewModel) {
            this.leftSideMenu = true;
            this.leftSideMenuCenter = {
                x: -this.canvasOffset.x,
                y: -this.canvasOffset.y + ctx.canvas.clientHeight / 2
            };
            drawLeftSideMenu(this, ctx);
        } else {
            this.leftSideMenu = false;
        }

        ctx.scale(1.0, 1.0);
        ctx.translate(-this.canvasOffset.x, -this.canvasOffset.y);
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
        ctx.ellipse(400 - 4000 -this.canvasOffset.x , 200 -this.canvasOffset.y, 100, 100, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();


        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(200 - 4000 -this.canvasOffset.x, 100-this.canvasOffset.y, 80, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.shadowColor = color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        let drawArcBackV = (x, w) => {
            if (w === undefined) w = 0.5;
            let p = Math.floor(this.canvasOffset.y * 1.1 / 200);
            if (p < 0) p += 1;
            let x_ = x / 200;
            let ofst = this.canvasOffset.y * 1.1 % 200;
            x = x + ofst;
            if ((x_ - p) % 4 === 0) {
                w = 2.0
                let text = ( x_ - p ) / 4 * 1000;
                drawText(ctx, text, {
                    y: -this.canvasOffset.y + this.clientSize.height / 2 - 20 + x,
                    x: -this.canvasOffset.x + 20
                }, color, {
                    align: 'left'
                })
            }


            if (x === 0) {
                drawLine(ctx, {
                    x: -this.canvasOffset.x + 0,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                },{
                    x: -this.canvasOffset.x + this.clientSize.width ,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                }, color, {
                    lineWidth: w, blur: 5
                });
            }

            let i = x < 0 ? Math.PI / 2 : Math.PI * 3 / 2;
            let rad = 2400000 / x;
            drawArc(ctx, {
                x: -this.canvasOffset.x + this.clientSize.width / 2 ,
                y: -this.canvasOffset.y + this.clientSize.height/2 + rad + 2 * x
            }, Math.abs(rad + x), -0.3 + i, 0.3 + i, color, {
                lineWidth: w, blur: 5
            });
        }
        let drawArcBack = (x, w) => {
            if (w === undefined) w = 0.5;
            let p = Math.floor(this.canvasOffset.x * 1.1 / 200);
            if (p < 0) p += 1;
            let x_ = x / 200;

            let ofst = this.canvasOffset.x * 1.1 % 200;
            x = x + ofst;


            if ((x_ - p) % 4 === 0) {
                w = 2.0
                let text = ( x_ - p ) / 4 * 1000;
                drawText(ctx, text, {
                    y: -this.canvasOffset.y + 20,
                    x: -this.canvasOffset.x + this.clientSize.width / 2 + 15 + x
                }, color, {
                    align: 'left'
                })
            }

            if (x === 0) {
                drawLine(ctx, {
                    x: -this.canvasOffset.x + this.clientSize.width / 2,
                    y: -this.canvasOffset.y + 0
                },{
                    x: -this.canvasOffset.x + this.clientSize.width / 2,
                    y: -this.canvasOffset.y + this.clientSize.height
                }, color, {
                    lineWidth: w, blur: 5
                });
            }

            let i = x > 0 ? Math.PI : 0;
            let rad = 2400000 / x;
            drawArc(ctx, {
                x: -this.canvasOffset.x + this.clientSize.width / 2 + rad + 2 * x,
                y: -this.canvasOffset.y + this.clientSize.height/2
            }, Math.abs(rad + x), -0.3 + i, 0.3 + i, color, {
                lineWidth: w, blur: 5
            });
        }

        drawArcBack(-800);
        drawArcBack(-600);
        drawArcBack(-400);
        drawArcBack(-200);
        drawArcBack(-0);
        drawArcBack(200);
        drawArcBack(400);
        drawArcBack(600);
        drawArcBack(800);

        drawArcBackV(-800);
        drawArcBackV(-600);
        drawArcBackV(-400);
        drawArcBackV(-200);
        drawArcBackV(-0 );
        drawArcBackV(200);
        drawArcBackV(400);
        drawArcBackV(600);
        drawArcBackV(800);



        if (this.selectedObjectIsRemoving) {
            ctx.fillRect(-this.canvasOffset.x, -this.canvasOffset.y, 100, this.clientSize.height+8000)
        }
    }

}
