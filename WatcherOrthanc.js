var oc = require('orthanc-client');
var fs = require('fs');
var Q = require('q');
var mainProcess = require('./ServerNode_v1');
var client = new oc({
    url: 'http://localhost:8042',
    auth: {
      username: 'foo',
      password: 'bar'
    }
});
//Get all ids of studies of parent
var allStudies = client.studies.getAll();
var arrStudies = [];
//Set up time for Settimeout or Setinterval
var time = 500;
//JSON object for showing on study list
var studyList = {"studyList":[]};
//Export image to another place
var studies = {};
var checkStudiesChange = setInterval(function() {
    client.studies.getAll()
        .then(
            res => {
                 if(JSON.parse(res).length != studies.length) {                
                    studies = JSON.parse(res);
                    console.log("1>" + studies.length);
                    console.log("1>" + "");                                   
                    mainProcess.moew().
                        then(
                            res => {
                                console.log(res);
                            }
                        ).catch(
                            err => console.log(err)
                        );
                 } else {
                     console.log("2>" + studies.length);
                 }
            }
        )
        .catch(
            err => {console.log(err)}
        )
},1500);



