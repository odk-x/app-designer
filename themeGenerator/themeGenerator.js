$(document).ready(function (){

  $(".colorpicker").spectrum({
    clickoutFiresChanges: true
  });   

  // $("#button-radius").slider();

  $("#toolbar-tabs").tabs();
  $(".accordion").accordion();

  $.get("./templates/customStyles.template.css", function(data){
    window.customStyle = data;
      $(".update-styles").on('change',function(){
        addToIFrame(generateCustomStyles());
      });
      $("#generateStyles").click(function(){
        downloadSource("customStyles.css", generateCustomStyles());
      });

      //wait a few seconds the load the initial CSS
      setTimeout(function(){
        addToIFrame(generateCustomStyles());
      },2000);
    });
  });


function showSource(text){ 
  var newWindow = window.open();
  newWindow.document.write(text);
}

function downloadSource(filename, contents){
  var blob = new Blob([contents], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename); 
}


// generates the Custom Style sheet
function generateCustomStyles(){
  // object that contains the pixel sizes for each kind of phone 
  var screenSizeChoices = {
    Droid : ["480px", "854px"], 
    Nexus_S : ["480px", "800"],
    Galaxy_Nexus : ["720px", "1280px"],
    Nexus_4 : ["768px", "1280px"],
    Nexus_7 : ["800px", "1280px"],
    Tablet_7: ["1024px", "600px"],
    Tablet_10 : ["1280px", "800px"],
    Nexus_10 : ["2560px", "1600px"]
  }
  //updates the iframe size
  var screenSize = $("#select-screen-size").val();
  $("#odk_view").css("width", screenSizeChoices[screenSize][0]);
  $("#odk_view").css("height", screenSizeChoices[screenSize][1]);
  // background color
  var bgColor = $("#background-color").val();
  var bgColorReduce = reduceColor(bgColor, 2);
  // font settings
  var fontColor = $("#font-color").val();
  var fontColorReduce = reduceColor(fontColor, 1);
  var fontFamily = $("#select-font-family").val();  // still to be implemented
  // select button settings
  var buttonColorStart = $("#button-color").val();
  var buttonColorEnd = reduceColor(buttonColorStart,1);
  var buttonSelectedColorStart = $("#button-selected-color").val();
  var buttonSelectedColorEnd = reduceColor(buttonSelectedColorStart,1);
  var buttonBorderColor = $("#button-border-color").val();
  var buttonRadius = $("#button-radius").val();
  var buttonHeight = $("#button-height").val();
  var buttonTextSize = $("#button-text-size").val();
  var buttonTextColor = $("#button-text-color").val();
  // navbar settings
  var navbarBackgroundColorStart = $("#navbar-background-color").val();
  var navbarBackgroundColorEnd = reduceColor(navbarBackgroundColorStart, 2);
  var navbarFontColor = $("#navbar-font-color").val();
  var navbarButtonColorStart= $("#navbar-button-color").val();
  var navbarButtonColorEnd = reduceColor(navbarButtonColorStart, 1);
  var navbarButtonSelectedColor= $("#navbar-button-selected-color").val();
  var navbarButtonSelectedColorEnd = reduceColor(navbarButtonSelectedColor, 1);
  // other button settings
  var otherButtonTextColor = $("#other-button-text-color").val();
  var otherButtonColorStart = $("#other-button-color").val();
  var otherButtonColorEnd = reduceColor(otherButtonColorStart,1);
  var otherButtonSelectedColorStart = $("#other-button-selected-color").val();
  var otherButtonSelectedColorEnd = reduceColor(otherButtonSelectedColorStart, 1);
  var otherButtonBorderColor = $("#other-button-border-color").val();
  var otherButtonRadius = $("#other-button-radius").val();
  var otherButtonHeight = $("#other-button-height").val();
  var otherButtonTextSize = $("#other-button-text-size").val();
  // calculates the margin for button text so that it always stays centered in the button
  var buttonOffset = (parseInt(buttonHeight.substr(0, buttonHeight.length -2)) - parseInt(buttonTextSize.substr(0,buttonTextSize.length - 2)))/2 + "px";
  
  // updates customStyles.template.css with all the new settings
  var styles = window.customStyle.replace(/{{background-color}}/g,bgColor)
  styles = styles.replace(/{{font-color}}/g,fontColor)
  styles = styles.replace(/{{font-family}}/g, fontFamily);
  styles = styles.replace(/{{button-text-color}}/g, buttonTextColor);
  styles = styles.replace(/{{button-color-start}}/g, buttonColorStart);
  styles = styles.replace(/{{button-color-end}}/g, buttonColorEnd);
  styles = styles.replace(/{{button-selected-color-start}}/g, buttonSelectedColorStart);
  styles = styles.replace(/{{button-selected-color-end}}/g, buttonSelectedColorEnd);  
  styles = styles.replace(/{{button-border-color}}/g, buttonBorderColor);
  styles = styles.replace(/{{background-color}}/g, bgColor);
  styles = styles.replace(/{{background-color-reduce}}/g, bgColorReduce);
  styles = styles.replace(/{{button-radius}}/g, buttonRadius);
  styles = styles.replace(/{{button-text-size}}/g, buttonTextSize);
  styles = styles.replace(/{{button-height}}/g, buttonHeight);
  styles = styles.replace(/{{button-offset}}/g, buttonOffset);
  styles = styles.replace(/{{navbar-button-color-start}}/g, navbarButtonColorStart);
  styles = styles.replace(/{{navbar-button-color-end}}/g, navbarButtonColorEnd);
  styles = styles.replace(/{{navbar-font-color}}/g, navbarFontColor);
  styles = styles.replace(/{{navbar-background-color-start}}/g, navbarBackgroundColorStart);
  styles = styles.replace(/{{navbar-background-color-end}}/g, navbarBackgroundColorEnd);
  styles = styles.replace(/{{navbar-button-selected-color}}/g, navbarButtonSelectedColor);
  styles = styles.replace(/{{navbar-button-selected-color-end}}/g, navbarButtonSelectedColorEnd);
  styles = styles.replace(/{{font-shadow}}/g, fontColorReduce);
  styles = styles.replace(/{{other-button-text-color}}/g, otherButtonTextColor);
  styles = styles.replace(/{{other-button-color-start}}/g, otherButtonColorStart);
  styles = styles.replace(/{{other-button-color-end}}/g, otherButtonColorEnd);
  styles = styles.replace(/{{other-button-color-selected-color-start}}/g, otherButtonSelectedColorStart);
  styles = styles.replace(/{{other-button-color-selected-color-end}}/g, otherButtonSelectedColorEnd);
  styles = styles.replace(/{{other-button-border-color-start}}/g, otherButtonBorderColor);  
  styles = styles.replace(/{{other-button-radius}}/g, otherButtonRadius);
  styles = styles.replace(/{{other-button-height}}/g, otherButtonHeight);
  styles = styles.replace(/{{other-button-text-size}}/g, otherButtonTextSize);
  return styles;
}

// adds the updated themes and styles to the iframe
function addToIFrame(customStyle){
  for (var i = 0; i <= pageStack.length; i++) {
    var oldStyles = frames[i].document.getElementById("customStyle");
    if (oldStyles)
      oldStyles.remove();

    var newStyles = $("<style id='customStyle'>" + customStyle + "</style>")[0];
    frames[i].document.body.appendChild(newStyles); 
   }
}

// chooses the appropriate font family. still to be implemented
function selectFontFamily(){
  
}

// takes in a hex color and returns a slightly reduced version. Is used to create button gradients.
// param start is the starting color, and factor is the factor to reduce it by (1 would subtract 080808)
function reduceColor(start, factor) {
  if (start.substring(0,1) == "#") {
    var red = start.substring(1, 3);
    var green = start.substring(3, 5);
    var blue = start.substring(5, 7);
    if (start.length < 5) {
      red = start.substring(1,2);
      green = start.substring(2,3);
      blue = start.substring(3,4);
    } 
    red = Math.max(parseInt(red, 16) - 16*factor, 0).toString(16);
    if (red.length < 2) {
      red = "0" + red;
    }
    blue = Math.max(parseInt(blue, 16) - 16*factor, 0).toString(16);
    if (blue.length < 2) {
      blue = "0" + blue;
    }
    green = Math.max(parseInt(green, 16) - 16*factor, 0).toString(16);
      if (green.length < 2) {
      green = "0" + green;
    }
    return "#" + red + green + blue;
  } else if (start == "black") {
    return "#191616";
  } else if (start == "white") {
    return "#f5f5f5";
  } else {
    return start;
  }
  

}
