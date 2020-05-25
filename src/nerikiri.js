
export function urlToAddr(url) {
    let buf = url;
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
    let buf = url;
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
            brokers: [],
        },



        info: async () => {
            let f = await fetch(url + '/process/info/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        operationInfos: async() => {
            let f = await fetch(url + '/process/operations/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        containerInfos: async() => {
            let f = await fetch(url + '/process/containers/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        containerOperationInfos: async(containerInfo) => {
            let f = await fetch(url + '/process/containers/' + containerInfo.instanceName + '/operations/', {method: 'GET', mode: 'cors'});
            return f.json();
        },

        connectionInfos: async(operationInfo) => {
            if (typeof(operationInfo) === 'undefined') {
                let f = await fetch(url + '/process/connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                return f.json();
            }

            //console.log(operationInfo);
            if (operationInfo.ownerContainerInstanceName === undefined) {
                let f = await fetch(url + '/process/operations/' + operationInfo.instanceName + '/connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                let v = f.json();

                return v;
            } else {
                let f = await fetch(url + '/process/containers/' + operationInfo.ownerContainerInstanceName + '/operations/' + operationInfo.instanceName + '/connections/', {
                    method: 'GET',
                    mode: 'cors'
                });
                let v = f.json();
                return v;
            }
        },

        ecInfos: async(ecInfo) => {

            if (ecInfo === undefined) {
                let f = await fetch(url + '/process/ecs/', {
                    method: 'GET',
                    mode: 'cors'
                });
                return f.json();
            }

            let f = await fetch(url + '/process/ecs/' + ecInfo.instanceName + "/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();

        },

        brokerInfos: async() => {
            let f = await fetch(url + "/process/brokers/", {
                method: 'GET',
                mode: 'cors'
            });
            return f.json();
        },

        boundOperationInfos: async(ecInfo) => {
            let f = await fetch(url + '/process/ecs/' + ecInfo.instanceName + "/operations/", {
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
        proc.connectionInfos().then((infos)=>{
            proc.props.connections = infos; return infos;
        }),
        proc.ecInfos().then((infos)=>{ proc.props.ecs = infos; return infos; }),
        proc.brokerInfos().then((infos)=>{ proc.props.brokers = infos; return infos; }),
        ]
    );
    return p;

}

export async function deleteConnection(proc, connection) {
    if (proc) {
        let url = proc;
        let operationName = connection.output.info.instanceName;
        let connectionName = connection.name;
        let f = await fetch(url + '/process/operations/' + operationName + "/output/connections/" + connectionName + '/', {
            method: 'DELETE',
            mode: 'cors'
        });
        return f.json();
    }
}

export async function connect(proc, connectionInfo) {
    if (proc) {
        let url = proc.url();
        let operationName = connectionInfo.output.info.instanceName;
        let f = await fetch(url + '/process/operations/' + operationName + "/output/connections/", {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(connectionInfo)
        });
        return f.json();
    }
}

export async function changeECState(procUrl, ec, state) {
    if (procUrl) {
        let f = await fetch( procUrl + '/process/ecs/' + ec.instanceName + '/state/', {
            method: 'POST',
            mode: 'cors',
            body: '"' + state + '"',
        });
        return f.json();
    }
}