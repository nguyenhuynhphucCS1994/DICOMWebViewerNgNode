var oc = require('orthanc-client');
var fs = require('fs');
var client = new oc({
    url: 'http://localhost:8042',
    auth: {
      username: 'foo',
      password: 'bar'
    }
});
/*Get all ids of studies of parent*/
var allStudies = client.studies.getAll();
var studiesList = [];
/*Get all id instances*/
var instanceList = [];
/*Series List */
var seriesList = [];
/*Set up time for Settimeout or Setinterval*/
var time = 500;
/*JSON object for showing on study list*/
var studiesListJSON = {"studyList":[]};
/*Export image to another place*/
module.exports.image = "";

/*Get list of studies*/
function getAllStudyId() {
    allStudies
        .then(function(res) {
            //Be careful when you're processing your string such as space, break line....
            var arrRes = res.replace('[','').replace(']','').replace(/(\n|\t)/g,'').replace(/"/g,'').replace(/ /g,'').split(',');
            studiesList = arrRes;
        })
        .catch(function(err) {
            console.log(err);
    });
}

/*Get list of series */
function getAllSeriesId() {
    client.series.getAll()
        .then(function(res) {
            seriesList = res;
        })
        .catch(function(err) {
            console.log(err);
    });
}

/*Make a object ID instaces list for checking a instance that have either been existed or not*/
function makeInstanceList() {
    // for(var i = 0; i < studiesListJSON.studyList.length; i++) {
    //     instanceList = instanceList.concat(studiesListJSON.studyList[i].instanceList);
    // }
    client.instances.getAll()
        .then(
            function(resInstances) {
                instanceList = resInstances;
            }
        )
        .catch(
            function(err) {
                console.log(err);
            }
        );
}

/*Make a structural JSON file by length of all studies*/
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
}
/*Make a study json constructor*/
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

/*Iterate and show every study ID on JSON
I did wrong reference to all json in study list because it referred to same object study*/
function makeJSONStudyList() {
    var i = 0;
    studiesList.forEach(
        function(element) {
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
        }  
    );
}

/*Make json studies on studiesListId*/
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

function getFileFromInstance() {
    client.instances.getFile("9f4f9746-846f10b6-f61d5120-a65962cb-348a0497")
        .then(
            function(dicom) {
                console.log("Get file success");
                //i++;
        }).catch(
            function(err) {
                console.log(err);
        }
    );
}

/*Push dicom files of every study to Client site.
These dicom files intergrate with orthanC dicom files*/
function loadDicomFileToClient() {
    var i = 0;
    //Check id instance in instances list folder
    var net = setInterval(function() {
        client.instances.getFile(instanceList[i])
                .then(
                    function(dicom) {
                        writeDicomFile(instanceList[i], dicom);
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
    
    // studiesListJSON.studyList[0].instanceList.forEach(
    //     function(element) {
    //         client.instances.getFile(element)
    //             .then(
    //                 function(dicom) {
    //                     console.log(j + "<------------");
    //                     j++;
    //             }).catch(
    //                 function(err) {
    //                     console.log(err);
    //                 }
    //             );
    //         //console.log(element);
    //     });
    //If not we write that instance to our folder
}

function writeJSONStudy(studyId, study) {
    var path = "D:\\Assignments\\examples\\studies\\" + studyId + ".json";    
    //Not asynchronous function
    fs.writeFile(path, JSON.stringify(study), function(error) {
        if (error) {
            console.error("write error:  " + error.message);
        } else {
            console.log("Successful Write to " + path);
        }
    });
}

function writeDicomFile(instanceID, fileDicom) {
    var path = "D:\\Assignments\\examples\\images\\ClearCanvas\\" + instanceID + ".dcm";    
    //Not asynchronous function
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

//Save studyList.json file to testImages folder
function writeJSONStudyList() {
    var path = "D:\\Assignments\\examples\\studyList.json";
    fs.writeFile(path, JSON.stringify(studiesListJSON), function(error) {
        if (error) {
            console.error("write error:  " + error.message);
        } else {
            console.log("Successful Write to " + path);
        }
    })
}

function writeToAppendFile(file) {
    var path = "D:\\Assignments\\instanceList.txt";
    fs.appendFile(path, file + '\r\n', function(error) {
        if (error) {
            console.error("write error:  " + error.message);
        } else {
            //console.log("Successful Write to " + path);
        }
    })
}

//getAllStudyId-->makeStudyList-->makeJSONStudyList-->makeInstanceList-->
//Main thread
var mainThread = function() {
    setTimeout(getAllStudyId, 0);
    setTimeout(makeStudyList, 1000);    
    setTimeout(makeJSONStudyList, 1500);
    //setTimeout(writeJSONStudyList, 3000)
    setTimeout(makeInstanceList, 2000);
    //setTimeout(()=>{console.log(instanceList)},3000);
    setTimeout(loadDicomFileToClient,2500);
    //setTimeout(loadDicomFileToClient, 4000);
    //setTimeout(makeJSONStudy, 4000);
    //setTimeout(loadDicomFileToClient, 4000);
}
mainThread();


