
import {drawVM, drawEC, drawFSM} from "./ObjectDrawer";
import {
    drawCallbackBindConnection,
    drawContainerConnection,
    drawECBindConnection,
    drawFSMBindOperationConnection,
    drawFSMBindECConnection,
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
import process, {connect, urlToAddr, urlToPort} from "../nerikiri";

import {drawLine, drawArc, drawText} from "./Drawing";
import {drawLeftSideMenu} from "../SideMenuDrawer";

const sizes = {
    'Process': {width: 150, height: 70},
    'Container': {width: 150, height: 70},
    'ContainerProcess': {width: 150, height: 70},
    'Topic': {width: 150, height: 70},
    'ExecutionContext': {width: 150, height: 150},
    'FSM': {width: 150, height: 150}
}
export let ViewModel = (m, pos) => {
    console.log('ViewMode(', m, pos, ')');
    /*
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
    } else if (m.type === 'fsm') {
        return {
            type: 'fsm',
            position: pos,
            size: {width: 150, height: 150},
            model: m
        }
    }  else if (m.type === 'container_operation') {
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
    } else if (m.info.typeName === '_ECContainerStruct') {
        return {
            type: 'EC',
            position: pos,
            size: sizes[m.info.className],
            model: m
        };
    } else if (m.info.typeName === '_FSMContainerStruct') {
        return {
            type: 'FSM',
            position: pos,
            size: sizes[m.info.className],
            model: m
        };
    } else {
        */
    {
        return {
            type: m.class_name,
            position: pos,
            size: sizes[m.class_name],
            model: m
        };
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
        this.startup = 0;
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
            if (this.viewModels[i].model.identifier !== model.identifier) {
                continue;
            }
            if (this.viewModels[i].model.type !== model.type) {
                continue;
            }
            //if (model.type === 'container_operation' && model.model.ownerContainerInstanceName !== this.viewModels[i].model.model.ownerContainerInstanceName) {
            //    continue;
            //}

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

    /**
     * キャンバスにD&Dされるとこの関数が呼ばれる
     * @param model
     * @param point
     * @returns {CanvasDraw}
     */
    addModel(model, point) {
        console.info('CanvasDraw.addModel ', model, point);
        /// 重複登録を避ける
        for(let vm of this.viewModels) {
            if (model.class_name === vm.model.class_name && model.identifier === vm.model.identifier) { // もし重複があったら何もしない
                return this;
            }
        }
        this.viewModels.push(ViewModel(model, point));

        /*
        if (model.type === 'container_operation') {
            this.addModel({
                type: 'container',
                model: model.ownerContainer,
                processUrl: model.processUrl
            }, {x: point.x - 70, y: point.y});
        }

        //this.models.push(model);

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

         */

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
        console.log('check Menu Button Clicked fsm:', menuParameter.fsmButtonState, 'ec:', menuParameter.ecButtonState);
        if (menuParameter.fsmButtonState.stateButtonStates) {
            for(let st of menuParameter.fsmButtonState.stateButtonStates) {
                if (includes(st, point)) {
                    console.log('Clicked: ', st.state.name);
                    this.onChangeFSMState(menuParameter.fsmButtonState.viewModel, st.state);
                    return true;
                }
            }

        }
        /// ECのメニューが表示されているとき
        if (menuParameter.ecButtonState.startButtonState) {
            console.info('check EC Button state');
            if (includes(menuParameter.ecButtonState.startButtonState, point)) {
                this.onChangeECState(menuParameter.ecButtonState.viewModel, 'started');

                this.controller.update();
                
                return true;
            } else if (includes(menuParameter.ecButtonState.stopButtonState, point)) {
                this.onChangeECState(menuParameter.ecButtonState.viewModel, 'stopped');

                this.controller.update();
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
                            let inputFullName = btn.input.model.model.fullName;
                            //if (btn.input.model.type === 'container_operation') {
                            //    inputInstanceName = btn.input.model.model.ownerContainerInstanceName + ':' + inputInstanceName;
                           // }
                            let outputFullName = btn.output.model.model.fullName;
                            //if (btn.output.model.type === 'container_operation') {
                            //    outputInstanceName = btn.output.model.model.ownerContainerInstanceName + ':' + outputInstanceName;
                            //}
                            let connectionInfo = {
                                name: connectionName,
                                broker: connectionBroker,
                                input: {
                                    broker: {
                                        typeName: 'HTTPBroker',
                                        host: urlToAddr((btn.input.model.processUrl)),
                                        port: urlToPort(btn.input.model.processUrl)
                                    },
                                    info: {
                                        fullName: inputFullName
                                    },
                                    target: {
                                        name: btn.targetName
                                    }
                                },
                                output: {
                                    broker: {
                                        typeName: 'HTTPBroker',
                                        host: urlToAddr((btn.input.model.processUrl)),
                                        port: urlToPort(btn.input.model.processUrl)
                                    },
                                    info: {
                                        fullName: outputFullName
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
                                fullName: "CoreBroker"
                            });
                        }

                        p.then((ps) => {
                            console.log('Searching Common Brokers:', ps);
                            for(let b1 of ps[0]) {
                                for(let b2 of ps[1]) {
                                    if (b1.fullName === b2.fullName) {
                                        console.log('Found Name:', b1);
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
        console.trace('Delete Button clicked:', deleteButton);
        let connection = deleteButton.connection;
        //console.trace(deleteButton);
        let processUrl = deleteButton.vm.model.processUrl;
        this.controller.deleteConnection(processUrl, connection);
    }

    onChangeECState(vm, state) {
        console.log('onChangeECState:', vm, state);
        return this.controller.changeECState(vm.model, state).then((info) => {
            this.validate();
            //this.controller.update();
        });
    }

    onChangeFSMState(vm, state) {
        console.log('onChangeFSMState:', vm, state);
        return this.controller.changeFSMState(vm.model, state).then((info) => {
            this.validate();
            this.controller.update();
        });
    }

    async onInvokeOperation(model) {
        console.info('CanvasDraw.onInvokeOperation:', model);
        return await this.controller.invokeOperation(model).then((info) => {
            menuParameter.operationControlButtonState.outputLog = info;
            console.log("onInvokeOperation: done. Return value is ", info);
            this.validate();
            this.updateCanvas();
            return info;
        }).catch((error) => {
            console.error('CanvasDraw.onInvokeOperation: error.', error);
            return undefined;
        });
    }

    onCyclicOperation(model) {
        console.info('CanvasDraw.onCyclicOperation:', model);
        let handler = () => {
            return this.controller.invokeOperation(model).then((info) => {
                if (!menuParameter.operationControlButtonState) return info;
                menuParameter.operationControlButtonState.outputLog = info;
                this.updateCanvas();
                setTimeout(handler, 100);
                return info;
            }).catch((error) => {
                console.error('onCyclicOperation: error.', error);
            });
        };
        setTimeout(handler, 100);
    }

    async onExecuteOperation(model) {
        console.info('CanvasDraw.onExecuteOperation(', model, ')');
        return await this.controller.executeOperation(model).then((info) => {
            menuParameter.operationControlButtonState.outputLog = info;
            this.validate();
            return info;
        }).catch((error) => {
            console.error('CanvasDraw.onExecuteOperation: error.', error);
        });
    }

    onUnbindOperation(ecVM, operation) {
        let processUrl = ecVM.model.processUrl;
        //console.log('onUnbindOperation(', ecVM, operation, ')');
        this.controller.unbindOperation(processUrl, ecVM.model.model, operation).then((info) => {
            this.validate();
        })
    }

    onBindOperationToEC(ecVM, opVM) {
        let processUrl = ecVM.model.processUrl;
        //console.log('onBindOperationToEC(', ecVM, opVM, ')')
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
            this.controller.getSystems().forEach((p) => {
                if (p.url() === vm.model.processUrl) {
                    let m = vm.model.model;
                    if (vm.model.type === 'operation' && p) {
                        p.props.operations.forEach((op) => {
                            if (op.fullName === m.fullName) {
                                vm.model.model = op;
                            }
                        });
                    } else if (vm.model.type === 'container') {

                    } else if (vm.model.type === 'container_operation') {
                        p.props.containers.forEach((con) => {
                            con.operations.forEach((op) => {
                                if (op.fullName === m.fullName) {
                                    vm.model.model = op;
                                }
                            })
                        })
                    } else if (vm.model.type === 'execution_context') {
                        p.props.ecs.forEach((ec) => {
                            if (ec.identifier === m.identifier) {
                                vm.model.model = ec;
                            }
                        });
                    } else if (vm.model.type === 'fsm') {
                        p.props.fsms.forEach((ec) => {
                            if (ec.fullName === m.fullName) {
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
            // drawTopicConnection(this, ctx, vm);
        });
        
        this.viewModels.forEach((vm) => {
            drawEC(this, ctx, vm);
        });
        /*
        this.viewModels.forEach((vm) => {
            drawFSM(this, ctx, vm);
        });
        */
        
        this.viewModels.forEach((vm) => {
            drawECBindConnection(this, ctx, vm);
            //drawCallbackBindConnection(this, ctx, vm);
            //drawFSMBindOperationConnection(this, ctx, vm);
            //drawFSMBindECConnection(this, ctx, vm);
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
            //drawLeftSideMenu(this, ctx);
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

        let rate = (this.startup - 50) * 2/ 100.0;
        rate = rate < 0 ? 0 : (rate > 100 ? 100 : rate);
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
                    x: -this.canvasOffset.x + this.clientSize.width/2,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                },{
                    x: -this.canvasOffset.x + this.clientSize.width/2 + this.clientSize.width/2 * rate,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                }, color, {
                    lineWidth: w, blur: 5
                });

                drawLine(ctx, {
                    x: -this.canvasOffset.x + this.clientSize.width/2,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                },{
                    x: -this.canvasOffset.x + this.clientSize.width/2 -  this.clientSize.width/2 * rate,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                }, color, {
                    lineWidth: w, blur: 5
                });
            }

            let i = x < 0 ? Math.PI / 2: Math.PI * 3 / 2;
            let rad = 2400000 / x;
            let theta = Math.atan2(this.clientSize.width/2, Math.abs(-this.canvasOffset.y  + rad + 2 * x ) - this.clientSize.height/2 );
            drawArc(ctx, {
                x: -this.canvasOffset.x + this.clientSize.width / 2 ,
                y: -this.canvasOffset.y + this.clientSize.height/2 + rad + 2 * x
            }, Math.abs(rad + x), (-theta * rate + i) , (theta * rate + i) , color, {
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
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                },{
                    x: -this.canvasOffset.x + this.clientSize.width / 2 ,
                    y: -this.canvasOffset.y + this.clientSize.height / 2 + this.clientSize.height / 2 * rate
                }, color, {
                    lineWidth: w, blur: 5
                });

                drawLine(ctx, {
                    x: -this.canvasOffset.x + this.clientSize.width / 2,
                    y: -this.canvasOffset.y + this.clientSize.height / 2
                },{
                    x: -this.canvasOffset.x + this.clientSize.width / 2 ,
                    y: -this.canvasOffset.y + this.clientSize.height / 2 - this.clientSize.height / 2 * rate
                }, color, {
                    lineWidth: w, blur: 5
                });
            }

            let i = x > 0 ? Math.PI : 0;
            let rad = 2400000 / x;
            let theta = Math.atan2( this.clientSize.height/2, Math.abs(-this.canvasOffset.x  + rad + 2 * x) - this.clientSize.width / 2) ;
            drawArc(ctx, {
                x: -this.canvasOffset.x + this.clientSize.width / 2 + rad + 2 * x,
                y: -this.canvasOffset.y + this.clientSize.height/2
            }, Math.abs(rad + x), -theta * rate + i, theta * rate + i, color, {
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
