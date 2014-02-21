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
  var fontColor = $("#font-color").val();
  var buttonColor = $("#button-color").val();
  var buttonSelectedColor = $("#button-selected-color").val();
  var navbarColor = $("#navbar-background-color").val();
  var navbarFontColor = $("#navbar-font-color").val();
  var navbarButtonColor= $("#navbar-button-color").val();
  var navbarButtonSelectedColor= $("#navbar-button-selected-color").val();
  var buttonBorderColor = $("#button-border-color").val();
  var buttonRadius = $("#button-radius").val();
  var buttonHeight = $("#button-height").val();
  var buttonTextSize = $("#button-text-size").val();
  var buttonOffset = (parseInt(buttonHeight.substr(0, buttonHeight.length -2)) - parseInt(buttonTextSize.substr(0,buttonTextSize.length - 2)))/2 + "px";
  var themes = window.customTheme.replace(/{{button-color}}/g, buttonColor);
  themes = themes.replace(/{{button-selected-color}}/g, buttonSelectedColor);
  themes = themes.replace(/{{button-border-color}}/g, buttonBorderColor);
  themes = themes.replace(/{{background-color}}/g, bgColor);
  themes = themes.replace(/{{font-color}}/g, fontColor);
  themes = themes.replace(/{{navbar-color}}/g, navbarColor);
  themes = themes.replace(/{{navbar-font-color}}/g, navbarFontColor);
  themes = themes.replace(/{{navbar-button-color}}/g, navbarButtonColor);
  themes = themes.replace(/{{navbar-button-selected-color}}/g, navbarButtonSelectedColor);
  themes = themes.replace(/{{button-radius}}/g, buttonRadius);
  themes = themes.replace(/{{button-text-size}}/g, buttonTextSize);
  themes = themes.replace(/{{button-height}}/g, buttonHeight);
  themes = themes.replace(/{{button-offset}}/g, buttonOffset);
  themes = themes.replace(/{{iframe-width}}/g, screenSizeChoices[screenSize][0]);
  themes = themes.replace(/{{iframe-height}}/g, screenSizeChoices[screenSize][1]);
  return themes;
}

function generateCustomStyles(){
  var bgColor = $("#background-color").val();
  var fontColor = $("#font-color").val();
  var buttonTextColor = $("#button-text-color").val();
  var fontFamily = $("#select-font-family").val();
  var styles = window.customStyle.replace(/{{background-color}}/g,bgColor)
  styles = styles.replace(/{{font-color}}/g,fontColor)
  styles = styles.replace(/{{font-family}}/g, fontFamily);
  styles = styles.replace(/{{button-text-color}}/g, buttonTextColor);
  return styles;
}

function addToIFrame(customStyle, customTheme){
  var oldStyles = frames[0].document.getElementById("customStyle");
  if (oldStyles)
    oldStyles.remove();

  var newStyles = $("<style id='customStyle'>" + customStyle + "</style>")[0];
  frames[0].document.body.appendChild(newStyles); 

  oldStyles = frames[0].document.getElementById("customTheme");
  if (oldStyles)
    oldStyles.remove();

  newStyles = $("<style id='customTheme'>" + customTheme + "</style>")[0];
  frames[0].document.body.appendChild(newStyles); 
}

function selectFontFamily(){
  
}
