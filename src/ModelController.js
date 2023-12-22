

import process, {
    system_api,
    changeECState,
    changeFSMState,
    deleteConnection,
    updateProps,
    invokeOperation,
    executeOperation,
    bindOperation,
    unbindOperation,
    updateECState,
    updateFSMState
} from './nerikiri';

export default class ModelController {

    constructor() {
        this.systems = [];
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

    getSystems() {
        return this.systems;
    }

    getProcessByUrl(url) {
        for(let p of this.systems) {
            if (p.url() === url) {
                return p;
            }
        }
        return null;
    }

    pushProcess(proc) {
        this.systems.push(proc);
    }

    async update() {
        let procs = this.systems;
        this.systems = [];
        procs.forEach(async (proc) => {
            this.systems.push(await system_api(proc.url()).process());
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


    async changeECState(ec, state) {
        console.info('ModelController.changeECState ', ec, state);
        return await changeECState(ec, state).then((info) => {
            return updateECState(ec);
        });
    }

    async changeFSMState(fsm, state) {
        console.info('ModelController.changeFSMState ', fsm, state);
        return await changeFSMState(fsm, state).then((info) => {
            return updateFSMState(fsm);
        });
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