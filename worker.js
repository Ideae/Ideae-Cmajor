
const connection = createPatchConnection();

function log(message) {
    console.log(message);
}

function loopThroughJSON(obj) {
    log("Calling loopThroughJSON on" + obj);
    for (let key in obj) {
        log("Found key: " + key);
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

connection.addStoredStateValueListener((message) => {
    // message.key, message.value
    console.log("!!! message.key: " + message.key + "  message.value: " + message.value);
});

connection.requestFullStoredState ((state) => {
    console.log("!!! !!! Stored State: " + state);
    /*
    let keys = Object.keys(state);
    console.log("Keys: " + keys);
    let parameters = state.parameters;
    let values = state.values;
    log("parameters: " + parameters);
    log("values: " + values);
    log("Object.keys(values): " + Object.keys(values));
    loopThroughJSON(state);
    */
});

// This can be used to receive an audiostream from the patch
//connection.addEndpointListener (endpointID, listener, granularity)