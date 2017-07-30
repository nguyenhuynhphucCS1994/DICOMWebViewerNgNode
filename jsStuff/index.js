var study = {"patientName" : "",
             "patientId" : "",
             "studyDate" : "",
             "modality" : "",
             "studyDescription" :"",
             "numImages" :"",
             "studyId" : ""};
var studyList = {"studyList":[]};

for(var i=0; i<5; i++) {
    studyList.studyList.push({"patientName" : "",
             "patientId" : "",
             "studyDate" : "",
             "modality" : "",
             "studyDescription" :"",
             "numImages" :"",
             "studyId" : ""});
}

for(var i=0; i<5; i++) {
    studyList.studyList[i].numImages = i*10;
}

console.log(studyList);