// let add = (a,b) => {
//     return new Promise(
//         (resolve,reject) => {
//             setTimeout(()=>{
//                 if(typeof a != 'number'|| typeof b != 'number') {
//                     return reject(new Error("This is not a number"));
//                 }
//                 resolve(a+b);
//             },1000);
//         }
//     );
// };

// let multiply = (a,b) => {
//     //we defined a callback have 2 parameters - result and error.
//     return new Promise((resolve,reject)=> {
//         setTimeout(() => {
//             if (typeof a != 'number'||typeof b != 'number') {
//                 return reject(new Error("This object is not a number."));
//             }
//             resolve(a*b);
//         },1000);
//     });

// };

function* genFunc(){ //looks synchronously written

        var post1title = yield fetch("https://jsonplaceholder.typicode.com/posts/1");
        console.log(post1title); 
        //post1title = "sunt aut facere repellat provident occaecati excepturi optio reprehenderit"
        var post2title = yield fetch("https://jsonplaceholder.typicode.com/posts/2");
        console.log(post2title);
        //post2title = "qui est esse"


}

var genObject = genFunc(); //creating generator object

var yieldedObject = genObject.next(); //starting generator and returning first yielded object
var promise = yieldedObject.value; //getting promise from value property of the yielded object
promise.then(function(val){ //callback for then() of promise
    return val.json(); //getting json stream from fetch response
}).then(function(val){ //chaining another then()
    var secondYieldedObject = genObject.next(val.title); //sending title back to generator function
                                                         //and receiving second yielded object from generator function
    var secondPromise = secondYieldedObject.value; //getting promise from value property of second yielded object
    secondPromise.then(function(val){ //callback for then() of promise
       return val.json();  //getting json stream from fetch response
    }).then(function(val){ //chaining another then()
      genObject.next(val.title); //sending back the second title to the generator function
    })
})