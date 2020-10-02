
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

export default function process(url) {
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
            let f = await fetch(url + 'process/info/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        operationInfos: async() => {
            let f = await fetch(url + 'process/operations/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        containerInfos: async() => {
            let f = await fetch(url + 'process/containers/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        containerOperationInfos: async(containerInfo) => {
            let f = await fetch(url + 'process/containers/' + containerInfo.fullName + '/operations/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        connectionInfos: async(operationInfo) => {
            if (typeof(operationInfo) === 'undefined') {
                let f = await fetch(url + 'process/connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                return f.json();
            }

            //console.log(operationInfo);
            if (operationInfo.ownerContainerInstanceName === undefined) {
                let f = await fetch(url + 'process/operations/' + operationInfo.fullName + '/connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                let v = f.json();

                return v;
            } else {
                let f = await fetch(url + 'process/containers/' + operationInfo.ownerContainerInstanceName + '/operations/' + operationInfo.instanceName + '/connections/', {
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

            let f = await fetch(url + 'process/topics/' + topicInfo.fullName + '/connections/', {
                method: 'GET',
                mode: 'cors'
            });
            let v = f.json();
            return v;
        },

        ecInfos: async(ecInfo) => {

            if (ecInfo === undefined) {
                let f = await fetch(url + 'process/ecs/', {
                    method: 'GET',
                    mode: 'cors'
                });
                return f.json();
            }

            let f = await fetch(url + 'process/ecs/' + ecInfo.fullName + "/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();

        },

        brokerInfos: async() => {
            let f = await fetch(url + "process/brokers/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        topicInfos: async() => {
            let f = await fetch(url + "process/topics/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        fsmInfos: async() => {
            let f = await fetch(url + "process/fsms/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        boundOperationInfos: async(ecInfo) => {
            let f = await fetch(url + 'process/ecs/' + ecInfo.fullName + "/operations/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        callbackInfo: async(info) => {
            let f = await fetch( url + 'process/callbacks/', {
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
                info.connections = {
                    input: [],
                    output: []
                };
                return proc.connectionInfos(info).then((cis) => {
                    info.connections = cis;
                    return cis;
                });
            });
            return Promise.all(ps);
        }),
        proc.containerInfos().then((infos)=> {
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
            proc.props.containers = infos;
            return Promise.all(ps);
        }),
        proc.topicInfos().then((infos) => {
            proc.props.topics = infos;
            let ps = infos.map((info) => {
                info.connections = {
                    input: [],
                    output: []
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
        proc.connectionInfos().then((infos)=>{
            proc.props.connections = infos; return infos;

        }),
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
        proc.callbackInfo().then((info)=>{ proc.props.callbacks = info; return info; }),
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

export async function invokeOperation(procUrl, op) {
    if (procUrl) {
        let fullName = op.fullName;
        // if (op.ownerContainerInstanceName) {
        //    instanceName = op.ownerContainerInstanceName + ':' + instanceName;
        //}
        let f = await fetch( procUrl + 'process/operations/' + fullName + '/', {
            method: 'GET',
            mode: 'cors',
        });
        return f.json();
    }
}

export async function executeOperation(procUrl, op) {
    if (procUrl) {
        let fullName = op.fullName;
        //if (op.ownerContainerInstanceName) {
        //    instanceName = op.ownerContainerInstanceName + ':' + instanceName;
        //}
        let f = await fetch( procUrl + 'process/operations/' + fullName + '/execution/', {
            method: 'PUT',
            mode: 'cors',
            body: '{}'
        });
        return f.json();
    }
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