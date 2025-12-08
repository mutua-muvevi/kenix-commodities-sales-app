// const cluster = require("cluster");
// const os = require("os");
// const path = require("path");
// const directoryName = __dirname;

// const cpuCount = os.cpus().length;

// console.log(`The total number of CPUs is ${cpuCount}`);
// console.log(`Primary pid=${process.pid}`);

// cluster.setupPrimary({
// 	exec: path.join(directoryName, "../index.js"),
// });

// for (let i = 0; i < cpuCount; i++) {
// 	cluster.fork();
// }

// cluster.on("exit", (worker, code, signal) => {
// 	console.log(`worker ${worker.process.pid} died`);
// 	cluster.fork();
// });
