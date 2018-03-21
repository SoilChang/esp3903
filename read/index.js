'use strict';
// @ts-check

const serialport = require('serialport');
const readline = require('readline');
const sp_readline = serialport.parsers.Readline;
const express = require("express");
const bodyParser = require('body-parser');
const fetch = require("node-fetch");
const cors = require('cors');


// const baseUrl = "https://esp3903.herokuapp.com";
const baseUrl = "http://localhost:5000";
let data = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
];
class App {
    constructor() {
        this.app = express()
        this.assembleRoutes(this.app);
        this.config(this.app);

        this.app.listen(3000, () => {
            console.log('***The App listening on port 3000!***')
            console.log("")
            // this.readSerialInput()
        })



        // fetch(`${baseUrl}/api/update`, {
        //     method: "POST",
        //     body: JSON.stringify({
        //         "row": 2,
        //         "col": 2,
        //         "voltage": 20
        //     }),
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        // }).then(rsp => {
        //     console.log(rsp.body);
        // }).catch(err => {
        //     console.error(err);
        // })

        // fetch(`${baseUrl}/api/data`, {
        //     method: "GET",
        // }).then(rsp => {
        //     console.log(rsp.body);
        // }).catch(err => {
        //     console.error(err);
        // })

    }

    assembleRoutes(app) {
        this.app.get('/', (req, res) => res.send('Welcome to Output visualizor'))

        this.app.get("/api/data/", (req, res) => {
            res.status(200).send(this.data)
        })
    }

    config(app) {
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: false
        }));
    }



    /**
     * @param {string} [str] - serial input string. 
     */
    process(str) {
        if (typeof str != "string" || !str) {
            console.log("No String Input");
        }
        const arr = str.split(" ");
        console.log(arr)
        arr.forEach(entry => {
            try {
                const coord = entry.split("/")[0];

                let r = parseInt(coord.split(".")[0])
                let c = parseInt(coord.split(".")[1])
                let voltage = parseFloat(entry.split("/")[1])
                data[r][c] = voltage;
                fetch(`${baseUrl}/api/update`, {
                    method: "POST",
                    body: JSON.stringify({
                        "row": r,
                        "col": c,
                        "voltage": voltage
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    },
                }).then(rsp => {
                    console.log(rsp.body);
                }).catch(err => {
                    console.error(err);
                })
            } catch (err) {
                console.log(err)
            }
        })
    }

    readSerialInput() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'select port> '
        });

        let idx = 0;
        let ports = [];
        console.log('COM port list:');
        serialport.list((err, p) => {
            p.forEach(function (p) {
                ports.push(p.comName);
                console.log(' [' + idx + '] ' + p.comName);
                idx++;
            });

            this.rl.prompt();

            this.rl.on('line', (line) => {
                //console.log(line);
                //console.log(ports);
                if (line < idx) {
                    console.log('Opening ' + ports[Number(line)] + "\n");

                    const port = new serialport(ports[Number(line)], {
                        baudRate: 9600
                    });
                    const parser = new sp_readline();
                    port.pipe(parser);

                    parser.on('data', (data) => {
                        this.process(data);
                        console.log(data);
                    });

                    port.on('error', (err) => {
                        console.error(err.message);
                        process.exit(0);
                    });

                    port.on('open', () => {
                        console.log('Serial Port Opened');
                    });

                    port.on('close', (err) => {
                        console.log('Serial Port Closed: ' + err);
                        process.exit(0);
                    });

                } else {
                    console.error('ERROR: Wrong port number');
                    process.exit(0);
                }
            });

            this.rl.on('close', () => {
                console.log('Terminating Process');
                process.exit(0);
            });

        });
    }
}




new App()