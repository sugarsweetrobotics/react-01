

import process, {changeECState, deleteConnection, updateProps} from './nerikiri';

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
            console.log('deleted: ', info);
            this.update();
            return info;
        });
    }


    changeECState(processUrl, ec, state) {
        return changeECState(processUrl, ec, state).then((info) => {
            console.log('updateECState');
            this.update();
            return info;
        })
    }

}