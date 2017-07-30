var oc = require('orthanc-client');
var fs = require('fs');
var Q = require('q');
var client = new oc({
    url: 'http://localhost:8042',
    auth: {
      username: 'foo',
      password: 'bar'
    }
});
/*
Get all ids of studies of parent
*/
var allStudies = client.studies.getAll();
var studiesList;

/*
Get all id instances
*/
var instanceList;

/*
Series List 
*/
var seriesList = [];

/*
Set up time for Settimeout or Setinterval
*/
var time = 500;

/*
JSON object for showing on study list
*/
var studiesListJSON;

/*
Export image to another place
*/
module.exports.image = "";

var study = {
    "patientName":"",
    "patientId": "",
    "studyDate": "",
    "modality": "",
    "studyDescription": "",
    "numImages": 0 ,
    "studyId": "",
    "seriesList":[{
        "seriesUid": "",
        "seriesDescription": "",
        "seriesNumber": "",
        "instanceList": [],
        "frameRate":""
    }]
};

/*
Get list of studies
*/
function getAllStudyId() {
    var deferred = Q.defer();
    client.studies.getAll()
        .then(function(res) {
            //Be careful when you're processing your string such as space, break line....
            var arrRes = res.replace('[','').replace(']','').replace(/(\n|\t)/g,'').replace(/"/g,'').replace(/ /g,'').split(',');
            studiesList = arrRes;
            deferred.resolve(studiesList);
        })
        .catch(function(err) {
            console.log(err);
    });
    return deferred.promise;
}

/*
Get list of series 
*/
function getAllSeriesId() {
    client.series.getAll()
        .then(function(res) {
            seriesList = res;
        })
        .catch(function(err) {
            console.log(err);
    });
}

/*
Make a object ID instaces list for checking a instance that have either been existed or not
*/
function makeInstanceList() {
    var deferred = Q.defer();
    client.instances.getAll()
        .then(
            function(resInstances) {
                instanceList = resInstances;
                deferred.resolve(instanceList);
            }
        )
        .catch(
            function(err) {
                console.log(err);
            }
        );
    return deferred.promise;
}

/*
Make a structural JSON file by length of all studies
*/
function makeStudyList() {
    for(var i=0; i < studiesList.length; i++) {
        studiesListJSON.studyList.push({
            "patientName" : "",
            "patientId" : "",
            "studyDate" : "",
            "modality" : "",
            "studyDescription" :"",
            "numImages" : 0,
            "studyId" : "",
            "seriesUid":"" ,
            "seriesDescription": "",
            "seriesNumber": "",
            "instanceList": [] 
        });
    }
    return studiesListJSON;
}

/*
Make a study json constructor
*/
function aStudy(studyInStudyList) {
    this.patientName = studyInStudyList.patientName;
    this.patientId = studyInStudyList.patientId;
    this.studyDate = studyInStudyList.modality;
    this.studyDescription = studyInStudyList.studyDescription;
    this.numImages = studyInStudyList.numImages;
    this.studyId = studyInStudyList.studyId;
    this.seriesList = [{
        seriesUid : studyInStudyList.seriesUid,
        seriesDescription : studyInStudyList.seriesDescription,
        seriesNumber : studyInStudyList.seriesNumber,
        instanceList : [],
        frameRate : undefined,
    }];
}

/*
Iterate and show every study ID on JSON
I did wrong reference to all json in study list because it referred to same object study
*/
function makeJSONStudyList() {
    var i = 0;
    var the_promises = [];
    studiesList.forEach(
        function(element) {
            var deferred = Q.defer();
            client.studies.get(element)
                .then(
                    function(res) {
                        //Study Id
                        studiesListJSON.studyList[i].studyId = res.ID.toString();
                        //Patient Id
                        studiesListJSON.studyList[i].patientId = res.PatientMainDicomTags.PatientID;
                        //Patient Name
                        studiesListJSON.studyList[i].patientName = res.PatientMainDicomTags.PatientName;
                        //Study Date
                        studiesListJSON.studyList[i].studyDate = res.MainDicomTags.StudyDate;
                        //Study Description
                        studiesListJSON.studyList[i].studyDescription = res.MainDicomTags.StudyDescription;
                        i++;
                        return [client.series.get(res.Series[0]),i-1];
                    })
                .then(
                     function(resSeries) {
                        resSeries[0]
                            .then(function(res) {
                                //Instances List
                                studiesListJSON.studyList[resSeries[1]].instanceList = res.Instances;
                                //Series UID
                                studiesListJSON.studyList[resSeries[1]].seriesUid = res.MainDicomTags.SeriesInstanceUID;
                                //Series Description
                                studiesListJSON.studyList[resSeries[1]].seriesDescription = res.MainDicomTags.SeriesDescription;
                                //Series Number
                                studiesListJSON.studyList[resSeries[1]].seriesNumber = res.MainDicomTags.SeriesNumber;
                                //Modality
                                studiesListJSON.studyList[resSeries[1]].modality = res.MainDicomTags.Modality;
                                //Count Instances - #Images
                                studiesListJSON.studyList[resSeries[1]].numImages = res.Instances.length;
                                return deferred.resolve(studiesListJSON);
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                        }
                    )
                .catch(
                    function(err) {
                        console.log(err);
                }
            );   
            the_promises.push(deferred.promise);
        }  
    );
    return Q.all(the_promises);
}

/*
Make json studies on studiesListId
*/
function makeJSONStudy() {
    studiesListJSON.studyList.forEach(function(element) {
        var newStudy = new aStudy(element);
        for(var i = 0; i < element.instanceList.length; i++) {
            var obj = {"imageId":element.instanceList[i]+'.dcm'};
            newStudy.seriesList[0].instanceList.push(obj);
        }
        //Write every element to file follow studyID
        writeJSONStudy(element.studyId, newStudy);
    });
}

/*
Push dicom files of every study to Client site.
These dicom files intergrate with orthanC dicom files
*/
function loadDicomFileToClient() {
    var i = 0;
    //Check id instance in instances list folder
    var net = setInterval(function() {
        client.instances.getFile(instanceList[i])
                .then(
                    function(dicom) {
                        writeDicomFile(instanceList[i], dicom);
                        console.log(i);
                        i++;
                }).catch(
                    function(err) {
                        console.log(err);
                    }
                );
        if(i >= instanceList.length - 1) {
            clearInterval(net);   
        }
    },100);
}

function writeJSONStudy(studyId, study) {
    var pathJSONStudy = __dirname + "\\client\\dist\\assets\\studies\\" + studyId + ".json";
    fs.stat(pathJSONStudy,(err, stats)=>{
        if(err) {
            fs.writeFile(pathJSONStudy, JSON.stringify(study), function(error) {
                if (error) {
                    console.error("write error:  " + error.message);
                } else {
                    console.log("Successful Write to " + path);
                }
             });
        }
    });
    
}

function writeDicomFile(instanceID, fileDicom) {
    var path = __dirname + "\\client\\dist\\assets\\images\\" + instanceID + ".dcm";    
    fs.stat(path,(err, stats)=>{
        if(err) {
            fs.writeFile(path, fileDicom, function(error) {
                if (error) {
                    console.error("Write error:  " + error.message);
                } else {
                    console.log("Successful Write to " + path);
                }
            });
        }
    });
}

/*
Save studyList.json file to testImages folder
*/
function writeJSONStudyList() {
    var pathJSONStudyList = __dirname + "\\client\\dist\\assets\\studiesList.json";
    fs.unlinkSync(pathJSONStudyList);
        fs.writeFile(pathJSONStudyList, JSON.stringify(studiesListJSON) + '\n', function(error) {
            if (error) {
                console.error("write error:  " + error.message);
            } else {
                console.log("Successful Write to " + pathJSONStudyList);
            }
        }) 
}

function writeToAppendFile(file) {
    var pathInstanceList = path.join(__dirname, '\\instanceList.txt');
    //= __dirname + "\\instanceList.txt";
    path.join(__dirname, '\\instanceList.txt')
    fs.appendFile(pathInstanceList, file + '\r\n', function(error) {
        if (error) {
            console.error("write error:  " + error.message);
        } else {
            console.log("Successful Write to " + path);
        }
    })
}

/*
getAllStudyId-->makeStudyList-->makeJSONStudyList-->makeInstanceList-->loadDicomFileToClient
*/
var mainServerProcess = function() {
    studiesListJSON = {"studyList":[]};
    instanceList = [];
    var deferred =  Q.defer();
    getAllStudyId()
        .then(makeStudyList)
        .then(makeJSONStudyList)
        .then(writeJSONStudyList)
        .then(makeInstanceList)
        .then(makeJSONStudy)
        //.then(loadDicomFileToClient)
        .then(function(){
            deferred.resolve("Loading...");
            //deferred.resolve(studiesList);
        })
        .catch(
            err=>{
                deferred.reject(err);
            });
    return deferred.promise;
}

/* 
Default module export var module = {export:{}} 
*/
module.exports.moew = mainServerProcess;





