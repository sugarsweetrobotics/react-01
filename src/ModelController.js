

import process, {changeECState, deleteConnection, updateProps, invokeOperation, executeOperation, bindOperation, unbindOperation} from './nerikiri';

export default class ModelController {

    constructor() {
        this.processes = [];
        this.on_update_func = [];
    }

    setOnUpdateModel(func) {
        this.on_update_func.push(func);
    }

    loadProcess(url) {
        let p = process(url);
        updateProps(p);
        this.pushProcess(p);
        return this;
    }

    getProcesses() {
        return this.processes;
    }

    getProcessByUrl(url) {
        for(let p of this.processes) {
            if (p.url() === url) {
                return p;
            }
        }
        return null;
    }

    pushProcess(proc) {
        this.processes.push(proc);
    }

    update() {
        let procs = this.processes;
        this.processes = [];
        let promises = []
        procs.forEach((proc) => {
            let p = process(proc.url());
            promises.push(updateProps(p));
            this.pushProcess(p);
        });
        Promise.all(promises).then(() => {
            console.log('all promised');
            this.on_update_func.forEach((func) => { func(this); });
        });
    }

    deleteConnection(processUrl, connection) {
        return deleteConnection(processUrl, connection).then((info) => {
            // console.log('deleted: ', info);
            this.update();
            return info;
        });
    }


    changeECState(processUrl, ec, state) {
        return changeECState(processUrl, ec, state).then((info) => {
            // console.log('updateECState');
            this.update();
            return info;
        })
    }

    invokeOperation(processUrl, op) {
        // console.log('ModelController.invokeOperation:', processUrl, op);
        return invokeOperation(processUrl, op).then((info) => {
            // console.log('OperationInvoked:', info);
            this.update();
            return info;
        })
    }

    executeOperation(processUrl, op) {
        // console.log('ModelController.executeOperation:', processUrl, op);
        return executeOperation(processUrl, op).then((info) => {
            // console.log('OperationExecuted:', info);
            this.update();
            return info;
        })
    }

    bindOperation(processUrl, ec, operation) {
        return bindOperation(processUrl, ec, operation).then((info) => {
            this.update();
            return info;
        })
    }

    unbindOperation(processUrl, ec, operation) {
        return unbindOperation(processUrl, ec, operation).then((info) => {
            this.update();
            return info;
        })
    }

}