console.log("global.js loaded");
function make(serializedFormArray) {
  var obj = {};
  for (let inputRow of serializedFormArray) {
    obj[inputRow.name] = inputRow.value;
  }
  return obj;
}
