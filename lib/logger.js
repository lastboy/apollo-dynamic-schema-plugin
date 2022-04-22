const COLOR_START_ERROR = '\x1b[31m';
const COLOR_START_WARNING = '\x1b[33m' 
const COLOR_END = '\x1b[0m';

const base = (...args) => {    
    const method = args.pop();
    addLoggerTextAndColor(args, method);
    console[method].apply(console, args);

    return {
        method,
        args
    }
}

const addLoggerTextAndColor = (args, method) => {
    args.unshift('[dynamic schema plugin]');
    if (method === "error") {
        args.unshift(COLOR_START_ERROR);
    } if  (method === "warn") {
        args.unshift(COLOR_START_WARNING);
    }
    args.push(COLOR_END);
}

export default {
    log: (...args) => base(...[...args, "log"]),
    debug: (...args) => base(...[...args, "debug"]),
    warn:  (...args) => base(...[...args, "warn"]),
    error:  (...args) => base(...[...args, "error"])
}