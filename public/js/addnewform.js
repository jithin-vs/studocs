
  function showtextarea(buttonId) {
  $("#text"+ buttonId).toggle();
}

function displayText() {
  var from = document.getElementById('text1').value.replace(/\n/g, "<br>");
  var date = document.getElementById('text2').value.replace(/\n/g, "<br>");
  var to = document.getElementById("text3").value.replace(/\n/g, "<br>");
  var subject = document.getElementById("text4").value.replace(/\n/g, "<br>");
  var salutation = document.getElementById("text5").value.replace(/\n/g, "<br>");
  var paragraph1 = document.getElementById("text6").value.replace(/\n/g, "<br>");
  var paragraph2 = document.getElementById("text7").value.replace(/\n/g, "<br>");
  var ending = document.getElementById("text8").value.replace(/\n/g, "<br>");
  var letterPreview = document.getElementById("letter-preview");

  var content = "<strong>From,</strong><br> " + from + "<br><br>" +
    date + "<br><br>" + "<strong>To,</strong><br> " + to + "<br><br>" +
    "<strong>Sub:</strong>" + subject + "<br><br>" + salutation + ",<br><br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp " +
    paragraph1 + "<br><br>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + paragraph2 + "<br><br>" + ending;

  var regex = /#\w+/g;
  var highlightedContent = content.replace(regex, '<span style="color: red;">$&</span>');
  letterPreview.innerHTML = highlightedContent;
}



function toggleTextArea(content, spanElement) 
{
  var textArea = document.createElement("textarea");
  textArea.classList.add("form-control");
  textArea.rows = "3";
  textArea.placeholder = "Enter text...";
  textArea.value = content.replace(/\n/g, '\r\n');
  spanElement.parentNode.appendChild(textArea);
  
  var icon = spanElement.querySelector("i");
  icon.classList.remove("fa-plus");
  icon.classList.add("fa-chevron-down");
  
  spanElement.onclick = function() {
    toggleTextAreaAndIcon(textArea, icon, this);
  };
}

function toggleTextAreaAndIcon(textArea, icon) {
  textArea.parentNode.removeChild(textArea);
  icon.classList.remove("fa-chevron-down");
  icon.classList.add("fa-plus");
  
  spanElement.onclick = function() {
    toggleTextArea(this);
  };
}
function tDate(){
  var date=document.getElementById('text2');
  date.value=getCurrentDate();
}
function getCurrentDate() {
  var currentDate = new Date();
  var day = String(currentDate.getDate()).padStart(2, '0');
  var month = String(currentDate.getMonth() + 1).padStart(2, '0');
  var year = currentDate.getFullYear();
  return `${day}-${month}-${year}`;
}

function generatePDF() {
  const doc = new jsPDF('p', 'pt', 'a4');

  // Define the dimensions of the A4 page
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Define the position and size of the content div
  const contentX = 20;
  const contentY = 20;
  const contentWidth = pageWidth - 2 * contentX;
  const contentHeight = pageHeight - 2 * contentY;

  // Get the content div element
  const contentDiv = document.getElementById('letter-preview');

  // Convert the content div to a canvas
  html2canvas(contentDiv).then((canvas) => {
    const contentDataURL = canvas.toDataURL('image/png');

    // Add the content image to the PDF
    doc.addImage(contentDataURL, 'PNG', contentX, contentY, contentWidth, contentHeight);

    // Save the PDF
    doc.save('download.pdf');
  });
}
