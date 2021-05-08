

import process, {process_api, changeECState, changeFSMState, deleteConnection, updateProps, invokeOperation, executeOperation, bindOperation, unbindOperation} from './nerikiri';

export default class ModelController {

    constructor() {
        this.processes = [];
        this.on_update_func = [];
    }

    setOnUpdateModel(func) {
        this.on_update_func.push(func);
    }

    loadProcess(url, cb) {
        this.pushProcess({url: ()=> url});
        this.update().then(cb);
        /*
        let p = process(url);
        let promise = updateProps(p);
        if (cb) {
            promise.then(cb);
        }
        this.pushProcess(p);
        return this;

         */
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

    async update() {
        let procs = this.processes;
        this.processes = [];
        procs.forEach(async (proc) => {
            this.processes.push(await process_api(proc.url()).process());
        });
        return this;
        /*
        let procs = this.processes;
        this.processes = [];
        let promises = []
        procs.forEach((proc) => {
            let p = process_api(proc.url());
            promises.push(updateProps(p));
            this.pushProcess(p);
        });
        return Promise.all(promises).then((ret) => {
            console.log('ModelController.update() done:', ret);
            this.on_update_func.forEach((func) => { func(this); });
            console.log('ModelController task: onUpdate callback done.')
            return ret;
        });

         */
    }

    deleteConnection(processUrl, connection) {
        console.log("ModelController.deleteConnection(", processUrl, connection, ")");
        return deleteConnection(processUrl, connection).then((info) => {
            console.log('deleted: ', info);
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

    changeFSMState(processUrl, fsm, state) {
        return changeFSMState(processUrl, fsm, state).then((info) => {
            // console.log('updateECState');
            this.update();
            return info;
        })
    }

    async invokeOperation(op) {
        console.info('ModelController.invokeOperation:', op);
        return await invokeOperation(op).catch((e)=> {
            console.error('nerikiri.invokeOperation failed:', e); return undefined;
        });
    }

    async executeOperation(op) {
        console.info('ModelController.executeOperation:', op);
        return await executeOperation(op).catch((e)=> {
            console.error('nerikiri.executeOperation failed:', e); return undefined;
        })
    }

    bindOperation(processUrl, ec, operation) {
        console.info('ModelController.bindOperation(', processUrl, ec, operation, ')');
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