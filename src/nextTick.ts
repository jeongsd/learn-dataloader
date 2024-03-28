// let bar: any;
// // this has an asynchronous signature, but calls callback synchronously
// function someAsyncApiCall(callback: any) {
//   callback();
// }
// // the callback is called before `someAsyncApiCall` completes.
// someAsyncApiCall(() => {
//   // since someAsyncApiCall hasn't completed, bar hasn't been assigned any value
//   console.log("bar", bar); // undefined
// });
// bar = 1;

let bar: any;

function someAsyncApiCall(callback: any) {
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log("bar", bar); // 1
});

bar = 1;
