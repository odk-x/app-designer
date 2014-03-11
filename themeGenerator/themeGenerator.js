$(document).ready(function (){

  $(".colorpicker").spectrum({
    clickoutFiresChanges: true
  });   

  $("#toolbar-tabs").tabs();
  $(".accordion").accordion();

  $.get("./templates/customStyles.template.css", function(data){
    window.customStyle = data;
    $.get("./templates/customTheme.template.css", function(data){
      window.customTheme = data;
      $(".update-styles").bind('change',function(){
        addToIFrame(generateCustomStyles(), generateCustomTheme());
      });

      $("#generateTheme").click(function(){
        downloadSource("customTheme.css", generateCustomTheme());
      });
      $("#generateStyles").click(function(){
        downloadSource("customStyles.css", generateCustomStyles());
      });

      //wait a few seconds the load the initial CSS
      setTimeout(function(){
        addToIFrame(generateCustomStyles(), generateCustomTheme());
      },2000);
    });
  });

});

var numWindows = 0;

function showSource(text){ 
  var newWindow = window.open();
  newWindow.document.write(text);
}

function downloadSource(filename, contents){
  var blob = new Blob([contents], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename); 
}


function generateCustomTheme(){
  var screenSizeChoices = {
    Google_Nexus_5 : ["600px", "800px"],
    Google_Nexus_7 : ["800px", "1050px"],
    Samsung_Galaxy_S4 : ["300px", "550px"]
  }
  var screenSize = $("#select-screen-size").val();
  $("#odk_view").css("width", screenSizeChoices[screenSize][0]);
  $("#odk_view").css("height", screenSizeChoices[screenSize][1]);
  var bgColor = $("#background-color").val();
  var bgColorReduce = reduceColor(bgColor, 2);
  var fontColor = $("#font-color").val();
  var buttonTextColor = $("#button-text-color").val();
  var buttonColorStart = $("#button-color").val();
  var buttonColorEnd = reduceColor(buttonColorStart,1);
  var buttonSelectedColorStart = $("#button-selected-color").val();
  var buttonSelectedColorEnd = reduceColor(buttonSelectedColorStart, 1);
  var navbarBackgroundColorStart = $("#navbar-background-color").val();
  var navbarBackgroundColorEnd = reduceColor(navbarBackgroundColorStart, 2);
  var navbarFontColor = $("#navbar-font-color").val();
  var navbarButtonColorStart= $("#navbar-button-color").val();
  var navbarButtonColorEnd = reduceColor(navbarButtonColorStart, 1);
  var navbarButtonSelectedColor= $("#navbar-button-selected-color").val();
  var buttonBorderColor = $("#button-border-color").val();
  var buttonRadius = $("#button-radius").val();
  var buttonHeight = $("#button-height").val();
  var buttonTextSize = $("#button-text-size").val();

  var otherButtonTextColor = $("#other-button-text-color").val();
  var otherButtonColorStart = $("#other-button-color").val();
  var otherButtonColorEnd = reduceColor(otherButtonColorStart,1);
  var otherButtonSelectedColorStart = $("#other-button-selected-color").val();
  var otherButtonSelectedColorEnd = reduceColor(otherButtonSelectedColorStart, 1);
  var otherButtonBorderColor = $("#other-button-border-color").val();
  var otherButtonRadius = $("#other-button-radius").val();
  var otherButtonHeight = $("#other-button-height").val();
  var otherButtonTextSize = $("#other-button-text-size").val();

  var buttonOffset = (parseInt(buttonHeight.substr(0, buttonHeight.length -2)) - parseInt(buttonTextSize.substr(0,buttonTextSize.length - 2)))/2 + "px";
  var themes = window.customTheme.replace(/{{button-color-start}}/g, buttonColorStart);
  themes = themes.replace(/{{button-color-end}}/g, buttonColorEnd);
  themes = themes.replace(/{{button-selected-color-start}}/g, buttonSelectedColorStart);
  themes = themes.replace(/{{button-selected-color-end}}/g, buttonSelectedColorEnd);  
  themes = themes.replace(/{{button-border-color}}/g, buttonBorderColor);
  themes = themes.replace(/{{background-color}}/g, bgColor);
  themes = themes.replace(/{{button-text-color}}/g, buttonTextColor);
  themes = themes.replace(/{{background-color-reduce}}/g, bgColorReduce);
  themes = themes.replace(/{{font-color}}/g, fontColor);
  themes = themes.replace(/{{navbar-button-color-start}}/g, navbarButtonColorStart);
  themes = themes.replace(/{{navbar-button-color-end}}/g, navbarButtonColorEnd);
  themes = themes.replace(/{{navbar-font-color}}/g, navbarFontColor);
  themes = themes.replace(/{{navbar-background-color-start}}/g, navbarBackgroundColorStart);
  themes = themes.replace(/{{navbar-background-color-end}}/g, navbarBackgroundColorEnd);
  themes = themes.replace(/{{navbar-button-selected-color}}/g, navbarButtonSelectedColor);
  themes = themes.replace(/{{button-radius}}/g, buttonRadius);
  themes = themes.replace(/{{button-text-size}}/g, buttonTextSize);
  themes = themes.replace(/{{button-height}}/g, buttonHeight);
  themes = themes.replace(/{{button-offset}}/g, buttonOffset);
  themes = themes.replace(/{{iframe-width}}/g, screenSizeChoices[screenSize][0]);
  themes = themes.replace(/{{iframe-height}}/g, screenSizeChoices[screenSize][1]);
  themes = themes.replace(/{{other-button-text-color}}/g, otherButtonTextColor);
  themes = themes.replace(/{{other-button-color-start}}/g, otherButtonColorStart);
  themes = themes.replace(/{{other-button-color-end}}/g, otherButtonColorEnd);
  themes = themes.replace(/{{other-button-color-selected-color-start}}/g, otherButtonSelectedColorStart);
  themes = themes.replace(/{{other-button-color-selected-color-end}}/g, otherButtonSelectedColorEnd);
  themes = themes.replace(/{{other-button-border-color-start}}/g, otherButtonBorderColor);  
  themes = themes.replace(/{{other-button-radius}}/g, otherButtonRadius);
  themes = themes.replace(/{{other-button-height}}/g, otherButtonHeight);
  themes = themes.replace(/{{other-button-text-size}}/g, otherButtonTextSize);
  return themes;
}

function generateCustomStyles(){
  var bgColor = $("#background-color").val();
  var bgColorReduce = reduceColor(bgColor, 2);
  var fontColor = $("#font-color").val();
  var buttonTextColor = $("#button-text-color").val();
  var fontFamily = $("#select-font-family").val();
  var buttonColorStart = $("#button-color").val();
  var buttonColorEnd = reduceColor(buttonColorStart,1);
  var buttonSelectedColorStart = $("#button-selected-color").val();
  var buttonSelectedColorEnd = reduceColor(buttonSelectedColorStart,1);
  var buttonBorderColor = $("#button-border-color").val();
  var buttonRadius = $("#button-radius").val();
  var buttonHeight = $("#button-height").val();
  var buttonTextSize = $("#button-text-size").val();
  var navbarBackgroundColorStart = $("#navbar-background-color").val();
  var navbarBackgroundColorEnd = reduceColor(navbarBackgroundColorStart, 2);
  var navbarFontColor = $("#navbar-font-color").val();
  var navbarButtonColorStart= $("#navbar-button-color").val();
  var navbarButtonColorEnd = reduceColor(navbarButtonColorStart, 1);
  var navbarButtonSelectedColor= $("#navbar-button-selected-color").val();
  var buttonOffset = (parseInt(buttonHeight.substr(0, buttonHeight.length -2)) - parseInt(buttonTextSize.substr(0,buttonTextSize.length - 2)))/2 + "px";
  
  var otherButtonTextColor = $("#other-button-text-color").val();
  var otherButtonColorStart = $("#other-button-color").val();
  var otherButtonColorEnd = reduceColor(otherButtonColorStart,1);
  var otherButtonSelectedColorStart = $("#other-button-selected-color").val();
  var otherButtonSelectedColorEnd = reduceColor(otherButtonSelectedColorStart, 1);
  var otherButtonBorderColor = $("#other-button-border-color").val();
  var otherButtonRadius = $("#other-button-radius").val();
  var otherButtonHeight = $("#other-button-height").val();
  var otherButtonTextSize = $("#other-button-text-size").val();

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

function addToIFrame(customStyle, customTheme){
  //var oldStyles = frames[0].document.getElementById("customStyle");
  for (var i = 0; i <= numWindows; i++) {
    var oldStyles = frames[i].document.getElementById("customStyle");
    if (oldStyles)
      oldStyles.remove();

    var newStyles = $("<style id='customStyle'>" + customStyle + "</style>")[0];
    frames[i].document.body.appendChild(newStyles); 

    oldStyles = frames[i].document.getElementById("customTheme");
    if (oldStyles)
      oldStyles.remove();

    newStyles = $("<style id='customTheme'>" + customTheme + "</style>")[0];
    frames[i].document.body.appendChild(newStyles); 
  }
}

function selectFontFamily(){
  
}

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
    return "#ede8e8";
  } else {
    return start;
  }
  

}
