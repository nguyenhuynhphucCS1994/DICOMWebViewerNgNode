//Print out the num value in range nagative, zero and positive
//Arrow function
//Callback function
//Square of Trapezium (a+b)*h/2
//let square = (a,b,h) =>  {return (a + b)*h/2};
//console.log(square(1,2,3));

let add = (a,b,callback) => {
    //we defined a callback have 2 parameters - result and error.
    setTimeout(() => {
        if(typeof a != 'number'||typeof b!= 'number') {
            //callback(error,result=underfine)
            return callback(new Error("This object is not a number."));
        }
        callback(undefined,a+b);
    },1000);
};

let multiply = (a,b,callback) => {
    //we defined a callback have 2 parameters - result and error.
    setTimeout(() => {
        if (typeof a != 'number'||typeof b != 'number') {
            return callback(new Error("This object is not a number."));
        }
        callback(undefined,a*b);
    },1000);
};

let division = (a,b,callback) => {
    setTimeout(()=> {
        if (typeof a != 'number'||typeof b != 'number') {
            return callback(new Error("This object is not a number."));
        }
        if(b==0) {
            return callback(new Error("Divide by zero."));
        }
        callback(undefined,a/b);
    },1000);
};

let square = (a,b,h,callback) => {
    add(a,b,(error,result)=>{
        if(error) {
            return console.log("Error: ",error);
        }
        multiply(result,h,(error,result)=>{
            if(error) {
                return console.log("Error: ",error);
            }
            division(result,2,(error,square)=>{
                if(error) {
                    return console.log("Error: ",error);
                }
                callback(undefined,square);
            });
        });
    });
};

square(1,2,3,(error,result)=>{
    if(error) {
        return console.log("Error: ",error);
    }
    console.log("Square: ",result);
});