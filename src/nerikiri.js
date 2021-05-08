
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
function container(url, containerInfo, operations) {
    return {
        url: url,
        info: containerInfo,
        operations: operations,
        isOwn : (operation) => {
            return ownerContainerName(operation.info) == containerInfo.fullName;
        }
    };
}



function operation(url, operationInfo) {
    return {
        url: url,
        info: operationInfo
    };
}

function pureOperationTypeName(info) {
    console.log('pureOperationTypeName:', info.typeName);
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

export function process_api(url) {

    let api = 'httpBroker/';
    let fetchJson = async (addr) => {
        return (await fetch(url + api + addr, {method: 'GET', mode: 'cors'})).json();
    };

    return {
        process: async() => {
            let info = await fetchJson('fullInfo');
            return {
                url: ()=> {
                    return url;
                },
                operations: info.operations.filter(opInfo => {
                    return !pureOperationTypeName(opInfo).startsWith('_') && !(opInfo.typeName === 'Topic');
                }).map(opInfo => { return operation(url, opInfo); }),
                containers: info.containers.filter(cInfo => {
                    return !cInfo.typeName.startsWith('_');
                }).map(cInfo => {
                    return container(url, cInfo, info.operations.filter((oInfo) => {
                        return ownerContainerName(oInfo) == cInfo.fullName;
                    }));
                }),
                topics:[],
                fsms:[],
                ecs:[],
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


export async function changeECState(procUrl, ec, state) {
    if (procUrl) {
        console.log('nerikiri.changeECState(', procUrl, ec, state, ')');
        let f = await fetch( procUrl + 'process/ecs/' + ec.fullName + '/state/', {
            method: 'PUT',
            mode: 'cors',
            body: '"' + state + '"',
        });
        return f.json();
    }
}

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