

//let fs = require('fs');
//let wav = require('node-wav');
//import * as fs from 'fs';
//import * as wav from '../node-wav';

//importScripts("javascripts/Mp3LameEncoder.js")
//import * as lame from '/lib/Mp3LameEncoder';

// self.Mp3LameEncoderConfig = {
//     //memoryInitializerPrefixURL: "../vendor/",
//     TOTAL_MEMORY: 1073741824,
//   }

//https://github.com/higuma/mp3-lame-encoder-js
import * as lame from './Mp3LameEncoder.js';

function log(message) {
    console.log(message);
}

function loopThroughJSON(obj) {
    log("Calling loopThroughJSON on" + obj);
    for (let key in obj) {
        log("Found key: " + key + ": " + obj[key]);
        if (typeof obj[key] === 'object') {
            if (Array.isArray(obj[key])) {
                // loop through array
                for (let i = 0; i < obj[key].length; i++) {
                loopThroughJSON(obj[key][i]);
                }
            } else {
                // call function recursively for object
                loopThroughJSON(obj[key]);
            }
        } else {
        // do something with value
        console.log(key + ': ' + obj[key]);
        }
    }
}

function writeBlob(filename, blob) {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;        
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
    // log("Wrote file: " + filename);
    log("Wrote file.");
}

function saveFileWAV(filename, data) {
    const blob = new Blob([data], {type: 'audio/wav'});
    writeBlob(filename, blob);
}

function saveFileMP3(filename, data) {
    let sampleRate = 44100;
    let bitRate = 128;

    let encoder = new Mp3LameEncoder(sampleRate, bitRate);
    encoder.encode([data, data]); // Left and right channels will be identical
    let blob = encoder.finish(["audio/mpeg"]); //"audio/mp3"
    writeBlob(filename, blob);
}

class AudioGrab_View extends HTMLElement
{    constructor (patchConnection)
    {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
        this.innerHTML = this.getHTML();

        this.audioData = [];
        this.audioDataIndex = 0;
        this.audioDataLength= 1000000;

        this.counter = 0;

        this.FLOAT32_VIEW = new Float32Array( 1 );
    }

    // This was just an experiment based on a hunch
    float64ToFloat32( x ) {
        this.FLOAT32_VIEW[ 0 ] = x;
        return this.FLOAT32_VIEW[ 0 ];
    }

    connectedCallback()
    {
        this.audioData = Array(this.audioDataLength).fill(0);

        //this.querySelector ("#saveFile1").onclick = () => { this.patchConnection.sendEventOrValue ("saveFile", 0); };
        this.querySelector ("#saveFile1").onclick = () => {
            // let fileName = "test01.wav";
            let fileName = "test01.mp3";

            // let buffer = wav.encode(this.audioData, { sampleRate: sampleRate, float: true, bitDepth: 32 }); // todo: should bitDepth be 24 instead?
            // fs.writeFile(fileName, buffer, (err) => {
            // if (err) return console.log(err);
            //     console.log(fileName);
            // });

            //saveFileWAV(fileName, {"this": "is", "a": "test"});
            saveFileMP3(fileName, this.audioData);
        };
        
        this.outputListener = (output) => {
            let data = output.data[0];
            for(let i = 0; i < data.length; i++) {
                var samp = data[i];
                // var samp = this.float64ToFloat32(data[i]);
                this.audioData[this.audioDataIndex] = samp;
                this.audioDataIndex = (this.audioDataIndex + 1) % this.audioDataLength;
            }
        };

        let granularity = undefined;
        let sendFullAudioData = true;

        this.patchConnection.addEndpointListener ("out", this.outputListener, granularity, sendFullAudioData);
    }

    disconnectedCallback()
    {
        // When our element is removed, this is a good place to remove
        // any listeners that you may have added to the PatchConnection object.
        this.patchConnection.removeParameterListener("frequency", this.freqListener);
        this.patchConnection.removeEndpointListener("out", this.outputListener);
    }

    getHTML()
    {
        return `
        <style>
            .main-view-element {
                background: #bcb;
                display: block;
                width: 100%;
                height: 100%;
                padding: 10px;
                overflow: auto;
            }

            .param {
                display: inline-block;
                margin: 10px;
                width: 300px;
            }
            /*
            input {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 1rem;
                display: inline;
                margin: 0.5rem;
            }

            p {
                font-family: Arial, Helvetica, sans-serif;
                text-align: center;
                font-size: 1.5rem;
                margin: 2rem;
            }
            */

        </style>

        <div id="controls">
          <p>Your GUI goes here!</p>
          <input type="button" id="saveFile1" value="Save File"></input>
          <!-- <input type="range" class="param" id="frequency" min="5" max="1000">Frequency</input> -->
        </div>`;
    }
}

// todo: let them know of this uppercase error so they can fix it
window.customElements.define ("audiograb-view", AudioGrab_View);

console.log("Loaded index.js script.");

export default function createPatchView (patchConnection)
{
    return new AudioGrab_View (patchConnection);
}
