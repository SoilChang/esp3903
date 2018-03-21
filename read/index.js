'use strict';
// @ts-check

const serialport = require('serialport');
const readline = require('readline');
const sp_readline = serialport.parsers.Readline;
const express = require("express");
const cors = require('cors');

class App {
    constructor() {
        this.app = express()
        this.assembleRoutes(this.app);
        this.app.use(cors());
        this.app.listen(3000, () => {
            console.log('***The App listening on port 3000!***')
            console.log("")
            this.readSerialInput()
        })


        this.data = [
            [],[],[],[]
        ];

    }

    assembleRoutes(app) {
        this.app.get('/', (req, res) => res.send('Welcome to Output visualizor'))

        this.app.get("/api/data/", (req, res) => {
            res.status(200).send(this.data)
        })
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
                this.data[r][c] = voltage;
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
