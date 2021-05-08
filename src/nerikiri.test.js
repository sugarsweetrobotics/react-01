/**
 * @jest-environment node
 */
/*
 * test_calc.js
 * Copyright (C) 2014 kaoru <kaoru@bsd>
 */

//plet assert = require('assert');
import fetch from 'node-fetch'
//jest.mock('node-fetch', () => jest.fn());


test('process api test', async (done)=>{
    /*
    const dummyResponse = Promise.resolve({
        ok: true,
        status: 200,
        json: () => {
            return {};
        },
    });
    fetch.mockImplementation(() => dummyResponse)
    await dummyResponse;
     */

    let nk = require('./nerikiri.js');

    let p = nk.process_api('http://localhost:8080/');

    p.containers().then(cs=> {
            expect(cs.length).toBe(2);
            done();
        }
    )

    p.process().then(proc => {
        console.log(proc);
        expect(proc.className).toBe('Process');
        expect(proc.containers.length).toBe(2);
    });

});

/*
test('process test', async (done)=>{

    const dummyResponse = Promise.resolve({
        ok: true,
        status: 200,
        json: () => {
            return {};
        },
    });
    fetch.mockImplementation(() => dummyResponse)
    await dummyResponse;
     *

    let nk = require('./nerikiri.js');
    let process = nk.default;

    let p = process('http://localhost:8080/');
    expect(p.url()).toBe('http://localhost:8080/');
    let ops = await p.operationListInfos();

    p.operationListInfos().then(ops=> {
            expect(ops.length).toBe(14);
            done();
        }
    );

    p.containers().then(cs=> {
            expect(cs.length).toBe(2);
            done();
        }
    )

});

 */