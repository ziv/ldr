import index from "../db/index.json" with {type: "json"};

console.log(JSON.stringify(Object.keys(index), null, 2));