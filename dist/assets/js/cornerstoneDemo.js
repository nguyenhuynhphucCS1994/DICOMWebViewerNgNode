// Load in HTML templates

var viewportTemplate; // the viewport template
loadTemplate("assets/templates/viewport.html", function(element) {
    viewportTemplate = element;
});

var studyViewerTemplate; // the study viewer template
loadTemplate("assets/templates/studyViewer.html", function(element) {
    studyViewerTemplate = element;
});

var watcher = 0;
var loadEvents = setInterval(function() {
    if ($('#studyListData').find('tr').length > 0 && $('#studyListData').find('tr').length != watcher) {
      addClickEvent();
      watcher = $('#studyListData').find('tr').length;
      console.log(watcher);
    } 
},1500);

// Get study list from JSON manifest
//I configured link in getJSON - $.getJSON('studyList.json', function(data)
var addClickEvent = function() {
  $.getJSON('assets/studiesList.json', function(data) {
    var count = 0;
    var studyRow = $('#studyListData').find('tr');//.children();  
    data.studyList.forEach(function(study) {
      // Create one table row for each study in the manifest
      // Append the row to the study list
      // On study list row click
      $(studyRow[count]).unbind('click').click(function() {
        // Add new tab for this study and switch to it
        var studyTab = '<li><a href="#x' + study.patientId + '" data-toggle="tab">' + study.patientName + '</a></li>';
        $('#tabs').append(studyTab);

        // Add tab content by making a copy of the studyViewerTemplate element
        var studyViewerCopy = studyViewerTemplate.clone();

        /*var viewportCopy = viewportTemplate.clone();
        studyViewerCopy.find('.imageViewer').append(viewportCopy);*/
        studyViewerCopy.attr("id", 'x' + study.patientId);
        // Make the viewer visible
        studyViewerCopy.removeClass('hidden');
        // Add section to the tab content
        studyViewerCopy.appendTo('#tabContent');

        // Show the new tab (which will be the last one since it was just added
        $('#tabs a:last').tab('show');

        // Toggle window resize (?)
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
          $(window).trigger('resize');
        });

        // Now load the study.json
        loadStudy(studyViewerCopy, viewportTemplate, study.studyId + ".json");
      });
    count++;
    });
  });
}



// Show tabs on click
$('#tabs a').click (function(e) {
  e.preventDefault();
  $(this).tab('show');
});

// Resize main
function resizeMain() {
  var height = $(window).height();
  $('#main').height(height - 50);
  $('#tabContent').height(height - 50 - 42);
}

// Call resize main on window resize
$(window).resize(function() {
    resizeMain();
});
resizeMain();

// Prevent scrolling on iOS
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
});
