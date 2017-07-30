//Import express module
var express = require('express');
//Import path module - join string to path 
var path = require("path");
//Import body-parser
var bodyParser = require("body-parser");
//Import orthanc for getting dicom image
//var dicom = require("./server_node");
//Process with express framework
var app = express();

// setTimeout(function() {
//     //console.log(dicom.image.length);
// },5000); 

app.use(bodyParser());
//Use static files - change static folder after __dirname
app.use(express.static(path.join(__dirname ,'examples')));
//Configure app with views and ejs file inside
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'examples\\views'));
//Assume todoItems is a Database
// var todoItems = [
//             {id: 1,desc: 'foo'},
//             {id: 2,desc: 'bar'},
//             {id: 3,desc: 'baz'},
//         ];

app.get('/', function(req, res) {
    // res.render('index',{
    //     title: 'My App',
    //     items: todoItems
    // });
    res.render('index',{
        data: ""
    });
});

//When you add new something
// app.post('/add', function(req, res) {
//     var newItem = req.body.newItem;
//     todoItems.push({   
//         id: todoItems.length + 1,
//         desc: newItem
//     });
//     res.redirect('/');
// });

app.listen(3000, function() {
    console.log('Ready on port 3000');
});