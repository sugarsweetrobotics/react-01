import {drawLine} from "./Drawers/Drawing";

var fetch = require('node-fetch');


export function urlToAddr(url) {
   // let buf = url;
    if (url.startsWith('http://')) {
        url = url.slice(7);
    }
    let idx = url.indexOf(':');
    if (idx < 0) {
        return url;
    }
    return url.slice(0, idx);
}

export function urlToPort(url) {
   // let buf = url;
    if (url.startsWith('http://')) {
        url = url.slice(7);
    }
    let idx = url.indexOf(':');
    if (idx < 0) {
        return 80;
    }
    return parseInt(url.slice(idx+1));
}

/**
 *
 * @param containerInfo
 * @param operations
 * @returns {{operations, info}}
 */
async function container(url, containerInfo, operations) {


    async function get_base_pose(url, fullName) {
        console.info('nerikiri.getECState ', container);
        let api = 'httpBroker/';
        return (await fetch(url + api + 'operations/' + fullName + ':container_get_pose.ope/call', {method: 'PUT', body: '{}', mode: 'cors'})).json();
    }
    let pose = await get_base_pose(url, containerInfo.fullName);
    console.log('container  get_basepose :  ', pose);
    return {
        url: url,
        info: containerInfo,
        operations: operations,
        basePose__: {
            position: { x: -1, y: -1, z: -1 },
            orientation: {x: 0, y:0, z: 0, w: 1}
        },
        basePose : pose,
        isOwn : (operation) => {
            return ownerContainerName(operation.info) == containerInfo.fullName;
        }
    };
}


export async function getBasePose(container) {
    console.info('nerikiri.getECState ', container);
    let api = 'httpBroker/';
    return (await fetch(container.url + api + 'operations/' + container.info.fullName + ':get_state.ope/call', {method: 'PUT', body: '{}', mode: 'cors'})).json();
}

function topic(url, operationInfo) {
    return {
        url: url,
        info: operationInfo
    };
}

function operation(url, operationInfo) {
    return {
        url: url,
        info: operationInfo
    };
}

export function selectConnectingOperation(operation, operations) {
    console.log('selectConnectingOperation(', operation, operations, ')');
    return operations.filter((op) => {
        return Object.keys(operation.destination_connections).some((con_key)=> {
            let c = operation.destination_connections[con_key];
            return c.destination_identifier === op.identifier;
        } );
    });
}


export async function changeECState(ec, state) {
    console.info('nerikiri.changeECState ', ec, state);
    //let api = 'httpBroker/';
    if (state === 'started') {
        return (await fetch('/api/execution_context/start?identifier=' + ec.identifier , {method: 'PATCH', body: '{}', mode: 'cors', headers: {
            "Content-Type": "application/json"
        }})).json();
    } else if (state === 'stopped') {
        return (await fetch('/api/execution_context/stop?identifier=' + ec.identifier , {method: 'PATCH', body: '{}', mode: 'cors', headers: {
            "Content-Type": "application/json"
        }})).json();
    } else {
        console.error('Unknown state for ec:', state);
    }
}


export async function getECState(ec) {
    console.info('nerikiri.getECState ', ec);
    //let api = 'httpBroker/';
    return (await fetch('/api/execution_context/get_state?identifier=' + ec.identifier, {method: 'GET', mode: 'cors'})).json();
}

export async function updateECState(ec) {
    console.info('nerikiri.updateECState ', ec);
    let currentState = await getECState(ec);
    ec.ec_state = currentState;
    return currentState;
}

function ec(url, containerInfo, operations) {
    let api = 'httpBroker/';
    return {
        url: url,
        info: containerInfo,
        operations: operations,
        ec_state: 'unknown',
        isOwn: (operation) => {
            return ownerContainerName(operation.info) == containerInfo.fullName;
        },
        getState: async () => {
            return (await fetch(url + api + 'operations/' + containerInfo.fullName + ':get_state.ope/call', {method: 'PUT', body: "{}", mode: 'cors'})).json();
        },
        setState: async (state) => {
            return (await fetch(url + api + 'operations/' + containerInfo.fullName + ':set_state.ope/call', {method: 'PUT', body: '{"' + state + '"}', mode: 'cors'})).json();
        }
    };
}

/**
 * ExecutionContextのstarted状態繊維を行うOperationを取得する
 * @param ec
 * @returns {undefined}
 */
export function getActivateStartFunctions(ec) {
    console.log('getActivateStartFunction(', ec, ')');
    return ec.targets
    /*
    let activate_started_ope = undefined;
    ec.targets.forEach( (op) => {
        console.log(' -- op:',)
        if (op.identifier === ec.identifier) {
            activate_started_ope = op;
        }
    });
    if (activate_started_ope === undefined) {
        console.error('Error. Activation operation for EC(', ec.info.fullName, ') can not be found.');
        return undefined;
    }
    return activate_started_ope;
    */
}

export function selectECBoundedOperations(ec, processes) {
    console.info('nerikiri.selectECBoundedOperations ', ec, processes);
    let activate_started_opes = getActivateStartFunctions(ec);
    return processes.filter((op) => {
        let ps = activate_started_opes.filter((opi) => {return opi === op.identifier});
        return ps.length > 0
        //activate_started_ope.outlet.connections.some((conInfo) => op.info.fullName === conInfo.inlet.ownerFullName)
    });
}

export async function getFSMState(fsmData) {
    /// console.info('nerikiri.getFSMState ', fsmData);
    let api = 'httpBroker/';
    return (await fetch(fsmData.url + api + 'operations/' + fsmData.info.fullName + ':get_state.ope/call', {method: 'PUT', body: '{}', mode: 'cors'})).json();
}

export async function changeFSMState(fsm, state) {
    console.info('nerikiri.changeFSMState ', fsm, state);
    let api = 'httpBroker/';
    return (await fetch(fsm.url + api + 'operations/' + fsm.info.fullName + ':activate_state_' + state + '.ope/execute', {method: 'PUT', body: '{}', mode: 'cors'})).json();
}

export async function updateFSMState(fsm) {
    console.info('nerikiri.updateFSMState ', fsm);
    let currentState = await getFSMState(fsm);
    fsm.fsm_state = currentState;
    return currentState;;
}

function fsm(url, containerInfo, operations) {
    let api = 'httpBroker/';

    return {
        url: url,
        info: containerInfo,
        states: operations.filter(op=> {
            return op.fullName.startsWith((containerInfo.fullName + ':' + 'activate_state_'));
        }).map(op => {
            return op.fullName.slice((containerInfo.fullName + ':' + 'activate_state_').length, op.fullName.length - '.ope'.length);
        }),
        operations: operations,
        fsm_state: 'unknown',
        isOwn: (operation) => {
            return ownerContainerName(operation.info) == containerInfo.fullName;
        },
        getState: async () => {
            return (await fetch(url + api + 'operations/' + containerInfo.fullName + ':get_state.ope/call', {method: 'PUT', body: "{}", mode: 'cors'})).json();
        },
        setState: async (state) => {
            return (await fetch(url + api + 'operations/' + containerInfo.fullName + ':set_state.ope/call', {method: 'PUT', body: '{"' + state + '"}', mode: 'cors'})).json();
        }
    };
}


/**
 * FSMのstarted状態繊維を行うOperationを取得する
 * @param fsm
 * @param state
 * @returns {undefined}
 */
export function getActivateStateFunction(fsm, state) {
    let activate_state_ope = undefined;
    fsm.operations.forEach( (op) => {
        if (op.fullName === fsm.info.fullName + ':activate_state_' + state + '.ope') {
            activate_state_ope = op;
        }
    });
    if (activate_state_ope === undefined) {
        console.error('Error. Activation state (' + state + ') operation for FSM(', fsm.info.fullName, ') can not be found.');
        return undefined;
    }
    return activate_state_ope;
}


export function selectFSMStateBoundedOperations(fsm, state, operations) {
    let activate_state_ope = getActivateStateFunction(fsm, state);
    return operations.filter(op =>
        activate_state_ope.outlet.connections.some((conInfo) => op.info.fullName === conInfo.inlet.ownerFullName)
    );
}

export function selectFSMStateBoundedECs(fsm, fsm_state, ecs, ec_state) {
    let activate_state_ope = getActivateStateFunction(fsm, fsm_state);
    return ecs.filter(ec =>
        activate_state_ope.outlet.connections.some((conInfo) => conInfo.inlet.ownerFullName === ec.info.fullName + ':activate_state_'+ec_state+'.ope')
    );
}


function pureOperationTypeName(info) {
    // console.log('pureOperationTypeName:', info.typeName);
    let tokens = info.typeName.split(':');
    if (tokens.length >= 3) {
        return tokens[tokens.length-2];
    }
    return info.typeName;
}

function ownerContainerName(info) {
    let tokens = info.typeName.split(':');
    if (tokens.length >= 2) {
        return tokens[0];
    }
    return '';
}

function selectPureOperations(url, info) {
    console.log('selectPureOperations:', info);
    return Object.keys(info.core_store.processes).map( (k) => {
        return info.core_store.processes[k];
    });
}

export function system_api(url) {

    let api = 'api/';
    let fetchJson = async (addr) => {
        return (await fetch(url + api + addr, {method: 'GET', mode: 'cors'})).json();
    };

    let putJson = async (addr, obj) => {
        return (await fetch(url + api + addr, {method: 'PUT', body: JSON.stringify(obj), mode: 'cors'})).json();
    }

    return {
        process: async() => {
            let info = await fetchJson('system/profile_full');
            let cs = info.core_store.containers;
            let cops = info.core_store.container_processes;
            Object.keys(cs).forEach((cs_id) => {
                let c = cs[cs_id];
                c.container_processes = {};
                Object.keys(cops).forEach((cop_id) => {
                    let cop = cops[cop_id];
                    console.log('cop:', cop);
                    if (cs_id === cop.container_identifier) {
                        c.container_processes[cop_id] = cop;
                    }
                });
            });
            /*
            let cs =  await Promise.all(info.containers.filter(cInfo => {
                return !cInfo.typeName.startsWith('_') && cInfo.className === 'Container';
            }).map(async cInfo => {
                let c = await container(url, cInfo, info.operations.filter((oInfo) => {
                    return ownerContainerName(oInfo) == cInfo.fullName;
                }));
                console.log('c:', c);
                return c;
            }));
            console.log('cs:', cs);
            */
            console.log('nerikiri::process(', info, ')');  
            return {
                url: ()=> {
                    return url;
                },
                //_all_operations: info.operations.map(opInfo => { return operation(url, opInfo); }),
                operations: info.core_store.processes,
                containers: info.core_store.containers,
                //topics: info.operations.filter(opInfo => {
                //    return opInfo.typeName === 'Topic';
                //}).map(opInfo => { return topic(url, opInfo); }),
                //fsms: info.containers.filter(cInfo => {
                //    return cInfo.className === 'FSM';
                //}).map(cInfo => {
                //    let f = fsm(url, cInfo, info.operations.filter((oInfo) => {
                //        return ownerContainerName(oInfo) == cInfo.fullName;
                //    }));
                //    let s = getFSMState(f).then(s => f.fsm_state = s);
                //    return f;
                //}),

                ecs: info.core_store.ecs,
                /*
                .map(cInfo => {
                    let e = ec(url, cInfo, info.operations.filter((oInfo) => {
                        return ownerContainerName(oInfo) == cInfo.fullName;
                    }));
                    let s = e.getState().then(s => e.ec_state = s);
                    return e;
                }),
                */
                brokers:[],
                connections:[]
            }
        },

        containers : async () => {
            return (await fetchJson('containers')).filter((cinfo) => {
                return !cinfo.typeName.startsWith('_');
            }).map(async (cinfo) => {
                return container(cinfo, (await fetchJson('operations')).filter((oinfo) => {
                    return ownerContainerName(oinfo) == cinfo.fullName;
                }));
            })
        },

        operations : async () => {
            let f = await fetch(url + api + 'operations/', {method: 'GET', mode: 'cors'});
            return await f.json().filter((oinfo) => {
                return !pureOperationTypeName(oinfo).startsWith('_');
            }).map((oinfo) => {
                return operation(oinfo);
            })
        }
    };
}

export default function process(url) {

    let api = 'httpBroker/';
    let containers = async() => {
        let f = await fetch(url + api + 'containers/', {method: 'GET', mode: 'cors'});
        let cinfos = await f.json();
        let of = await fetch(url + api + 'operations/', {method: 'GET', mode: 'cors'});
        let oinfos = await of.json();
        return cinfos.filter((cinfo)=>{
            return !cinfo.typeName.startsWith('_');
        }).map((cinfo)=> {
            return container(cinfo, oinfos.filter((oinfo)=> { return ownerContainerName(oinfo) == cinfo.fullName; }));
        })
    };

    let operations = async() => {
        let f = await fetch(url + api + 'operations/', {method: 'GET', mode: 'cors'});
        let oinfos = await f.json();
        return oinfos.filter((oinfo)=>{
            return !pureOperationTypeName(oinfo).startsWith('_');
        }).map((oinfo)=> {
            return operation(oinfo);
        })
    };

    let operationListInfos = async() => {
        let f = await fetch(url + api + 'operations', {method: 'GET', mode: 'cors'});
        return f.json();
    };

    let operationInfo = async(fullName) => {
        let f = await fetch(url + api + 'operations/' + fullName, {method: 'GET', mode: 'cors'});
        return f.json();
    };

    let operationFullInfo = async(fullName) => {
        let f = await fetch(url + api + 'operations/' + fullName + '/fullInfo', {method: 'GET', mode: 'cors'});
        return f.json();
    };

    return {
        url: () => { return url; },

        hostAddress: () => {
            return urlToAddr(url);
        },

        port: () => {
            return urlToPort(url);
        },

        props: {
            info: {},
            operations: [],
            containers: [],
            connections: [],
            ecs: [],
            topics: [],
            fsms: [],
            brokers: [],
            callbacks: [],
        },



        info: async () => {
            let f = await fetch(url + api + 'info/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        fullInfo: async () => {
            let f = await fetch(url + api + 'fullInfo/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        containers: containers,
        operations: operations,

        operationListInfos: operationListInfos,

        operationInfo: operationInfo,

        operationInfos: async() => {
            return operationListInfos().then(async (oinfos) => {
                return Promise.all(
                    oinfos.map((oinfo) => {
                        let fullInfo = operationFullInfo(oinfo.fullName);

                        return fullInfo.then((i) => {
                            // console.log('fullInfo:', i);
                            return i;
                        });
                    })
                );
            });
        },

        containerInfos: async() => {
            let f = await fetch(url + api + 'containers/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        containerOperationInfos: async(containerInfo) => {
            let f = await fetch(url + api + 'containers/' + containerInfo.fullName + '/operations/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        connectionInfos: async(operationInfo) => {
            if (typeof(operationInfo) === 'undefined') {
                let f = await fetch(url + api + 'connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                return f.json();
            }

            //console.log(operationInfo);
            if (operationInfo.ownerContainerInstanceName === undefined) {
                let f = await fetch(url + api + 'operations/' + operationInfo.fullName + '/inlets/', {
                    method: 'GET',
                    mode: 'cors'
                });
                // console.log('f is ', f);
                //f.then((info) => {
                //    // ここでinletのconnection情報を収集して整理
                //});
                let v = f.json();

                return v;
            } else {
                let f = await fetch(url + api + 'containers/' + operationInfo.ownerContainerInstanceName + '/operations/' + operationInfo.instanceName + '/connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                let v = f.json();
                return v;
            }
        },

        topicConnectionInfos: async(topicInfo) => {
            if (typeof(topicInfo) === 'undefined') {
                return {}
            }

            let f = await fetch(url + api + 'topics/' + topicInfo.fullName + '/connections/', {
                method: 'GET',
                mode: 'cors'
            });
            let v = f.json();
            return v;
        },

        ecInfos: async(ecInfo) => {

            if (ecInfo === undefined) {
                let f = await fetch(url + api + '/ecs/', {
                    method: 'GET',
                    mode: 'cors'
                });
                return f.json();
            }

            let f = await fetch(url + api + 'ecs/' + ecInfo.fullName + "/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();

        },

        brokerInfos: async() => {
            let f = await fetch(url + api + "brokers/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        topicInfos: async() => {
            let f = await fetch(url + api + "topics/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        fsmInfos: async() => {
            let f = await fetch(url + api + "fsms/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        boundOperationInfos: async(ecInfo) => {
            let f = await fetch(url + api + 'ecs/' + ecInfo.fullName + "/operations/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        callbackInfo: async(info) => {
            let f = await fetch( url + api + 'callbacks/', {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        }
    };
};

export function valueIsError(v) {
    return(v.__ERROR__ !== undefined) ;
}

export async function updateProps(proc) {
    let p = await Promise.all([
        proc.info().then((i) => { proc.props.info = i; return i; }),
        proc.operationInfos().then((infos)=>{
            proc.props.operations = infos;
            let ps = infos.map((info) => {
               //  console.log('operation_full:', info);

                //info.connections = {
                //    inlet: [],
                //    outlet: []
                //};
                //return proc.connectionInfos(info).then((cis) => {
                //    info.connections = cis;
                //    return cis;
                //});
                return info;
            });
            return Promise.all(ps);
        }),
        proc.containerInfos().then((infos)=> {
            /*
            let ps = infos.map((info) => {
                return proc.containerOperationInfos(info).then((opInfos) => {
                    info.operations = opInfos;
                    info.operations.map((opInfo) => {
                        return proc.connectionInfos(opInfo).then((cis) => {
                            opInfo.connections = cis;
                            return cis;
                        })
                    });
                });
            });

             */
            proc.props.containers = infos;
            //return Promise.all(ps);
            return infos;
        }),
        proc.topicInfos().then((infos) => {
            proc.props.topics = infos;
            let ps = infos.map((info) => {
                info.connections = {
                    inlet: [],
                    outlet: []
                };
                return proc.topicConnectionInfos(info).then((cis) => {
                    info.connections = cis;
                    return cis;
                });
            });
            return Promise.all(ps);
        }),
        proc.fsmInfos().then((infos) => {
            proc.props.fsms = infos;

        }),
        //proc.connectionInfos().then((infos)=>{
        //    proc.props.connections = infos; return infos;
//
 //       }),
        proc.ecInfos().then((infos)=>{
            let ps = infos.map((info) => {
                return proc.boundOperationInfos(info).then((opInfos)=> {
                    info.boundOperations = opInfos;
                    return opInfos;
                });
            });
            proc.props.ecs = infos;
            return Promise.all(ps);
        }),
        proc.brokerInfos().then((infos)=>{ proc.props.brokers = infos; return infos; }),
        //proc.callbackInfo().then((info)=>{ proc.props.callbacks = info; return info; }),
        ]
    );
    return p;

}

export async function deleteConnection(proc, connection) {
    if (proc) {
        let url = proc;
        let operationName = connection.output.info.fullName;
        let connectionName = connection.name;
        let f = await fetch(url + 'process/operations/' + operationName + "/output/connections/" + connectionName + '/', {
            method: 'DELETE',
            mode: 'cors'
        });
        return f.json();
    }
}

export async function connect(proc, connectionInfo) {
    if (proc) {
        let url = proc.url();
        let operationName = connectionInfo.output.info.fullName;
        let f = await fetch(url + 'process/operations/' + operationName + "/output/connections/", {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(connectionInfo)
        });
        return f.json();
    }
}

/*
export async function changeFSMState(procUrl, fsm, state) {
    if (procUrl) {
        console.log('nerikiri.changeECState(', procUrl, fsm, state, ')');
        let f = await fetch( procUrl + 'process/fsms/' + fsm.fullName + '/state/', {
            method: 'PUT',
            mode: 'cors',
            body: '"' + state + '"',
        });
        return f.json();
    }
}
 */

export async function invokeOperation(op) {
    console.debug('nerikiri.invokeOperation(', op, ')');
    return fetch( op.url + 'httpBroker/operations/' + op.info.fullName + '/invoke', {
        method: 'PUT',
        mode: 'cors',
        body: '{}'
    }).then((f) => f.json());
}

export async function executeOperation(op) {
    console.debug('nerikiri.executeOperation(', op, ')');
    return fetch( op.url + 'httpBroker/operations/' + op.info.fullName + '/execute', {
        method: 'PUT',
        mode: 'cors',
        body: '{}'
    }).then((f)=>f.json());
}


export async function bindOperation(procUrl, ec, op) {
    console.log('nerikiri.bindOperation(', procUrl, ec, op, ')');
    let fullName = op.fullName;
    let f = await fetch( procUrl + 'process/ecs/' + ec.fullName + '/operations/' + op.fullName + '/', {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(op)
    });
    return f.json();

}

export async function unbindOperation(procUrl, ec, op) {
    let fullName = op.fullName;
    //if (op.ownerContainerInstanceName) {
    //    instanceName = op.ownerContainerInstanceName + ':' + instanceName;
    //}
    let f = await fetch( procUrl + 'process/ecs/' + ec.fullName + '/operations/' + fullName + '/', {
        method: 'DELETE',
        mode: 'cors'
    });
    return f.json();

}