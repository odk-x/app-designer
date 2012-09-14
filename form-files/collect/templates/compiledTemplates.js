(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['audio'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <img width=\"200\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></img>\r\n        ";
  return buffer;}

  buffer += "<ul class=\"odk\">\r\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <li>\r\n        <input class=\"odk\" type=\"text\" name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" value=\"";
  foundHelper = helpers.mediaPath;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mediaPath; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" disabled=\"true\" />\r\n    </li>\r\n    <li><button class=\"whiteButton\">Capture Audio</button></li>\r\n    <li><div class=\"mediaContainer\">\r\n        ";
  stack1 = depth0.uriValue;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div></li>\r\n</ul>";
  return buffer;});
templates['dropdownSelect'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <option \r\n                ";
  stack1 = depth0.selected;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                value=\"";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">\r\n                ";
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\r\n            </option>\r\n        ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "\r\n                    selected\r\n                ";}

  buffer += "<form>\r\n    <label>";
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</label>\r\n    <select name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">        \r\n        ";
  stack1 = depth0.choices;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </select>\r\n</form>";
  return buffer;});
templates['finalize'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\n	<center>\n        <img src=\"";
  foundHelper = helpers.headerImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.headerImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n            width=\"50%\"/>\n		<div>You have completed \"";
  foundHelper = helpers.formName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.formName; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\".</div>\n        <div>\n            <label for=\"instanceName\">Enter instance name:</label>\n            <input class=\"odk\" name=\"instanceName\" value=\"";
  foundHelper = helpers.instanceName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instanceName; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></input>\n        </div>\n		<button class=\"odk-big-btn\" style=\"width: 80%\">Save as Incomplete</button>\n		<button class=\"odk-big-btn\" style=\"width: 80%\">Finalize</button>\n	</center>\n</div>\n";
  return buffer;});
templates['hierarchy'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n                ";
  stack1 = depth0.hideInHierarchy;
  stack1 = helpers.unless.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            ";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n                    <li>\r\n                        <a href=\"#";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</a>\r\n                    </li>\r\n                ";
  return buffer;}

function program4(depth0,data) {
  
  
  return "\r\n                <li><span>No prompts</span></li>\r\n            ";}

  buffer += "<table>\r\n    <tr><td align=\"center\">\r\n        <ol>\r\n            ";
  stack1 = depth0.prompts;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        </ol>\r\n    </td></tr>\r\n</table>";
  return buffer;});
templates['image'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <img width=\"200\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></img>\r\n        ";
  return buffer;}

  buffer += "<ul class=\"odk\">\r\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <li>\r\n        <input class=\"odk\" type=\"text\" name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" value=\"";
  foundHelper = helpers.mediaPath;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mediaPath; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" disabled=\"true\" />\r\n    </li>\r\n    <li><button class=\"whiteButton\">Take Picture</button></li>\r\n    <li><div class=\"mediaContainer\">\r\n        ";
  stack1 = depth0.uriValue;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div></li>\r\n</ul>";
  return buffer;});
templates['inputType'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "odk-hidden";}

function program3(depth0,data) {
  
  
  return "\r\n            style=\"background-color:lightgray;\"\r\n            disabled=\"true\"\r\n        ";}

function program5(depth0,data) {
  
  
  return "\r\n            <p>invalid</p>\r\n        ";}

  buffer += "<div class=\"";
  stack1 = depth0.hide;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <input\r\n        class=\"odk\"\r\n        type=\"text\" \r\n        name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n        value=\"";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n        ";
  stack1 = depth0.disabled;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        />\r\n        ";
  stack1 = depth0.invalid;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div>";
  return buffer;});
templates['instances'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n        <li class=\"inline separated\">\r\n            <ul class=\"odk\">\r\n                <li><b>Instance Name:</b> ";
  foundHelper = helpers.instanceName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instanceName; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</li>\r\n                <li><b>Last Save Date:</b> ";
  foundHelper = helpers.last_saved_timestamp;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.last_saved_timestamp; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</li>\r\n                <li><b>Finalized:</b> ";
  foundHelper = helpers.saved_status;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.saved_status; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</li>\r\n            </ul>\r\n            <div class=\"odk btn-group\">\r\n                <button id=\"";
  foundHelper = helpers.instance_id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instance_id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"odk openInstance\">edit</button>\r\n                <button id=\"";
  foundHelper = helpers.instance_id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instance_id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"odk deleteInstance\">delete</button>\r\n            </div>\r\n        </li>\r\n    ";
  return buffer;}

function program3(depth0,data) {
  
  
  return "\r\n        <li>Unexpected absence of records.</li>\r\n    ";}

  buffer += "<ul class=\"odk\">\r\n    ";
  stack1 = depth0.instances;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</ul>";
  return buffer;});
templates['json'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<pre>JSON: ";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</pre>\r\n";
  return buffer;});
templates['labelHint'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n    <div>\r\n        ";
  foundHelper = helpers.substitute;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  else { stack1 = depth0.substitute; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.substitute) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(2, program2, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n";
  return buffer;}
function program2(depth0,data) {
  
  var stack1, foundHelper;
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  return escapeExpression(stack1);}

function program4(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n    <div>\r\n        <img width=\"100%\" src=\"";
  stack1 = depth0.image;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\"></img>\r\n    </div>\r\n";
  return buffer;}

function program6(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n    <div>\r\n        <audio controls=\"controls\">\r\n            <source src=\"";
  stack1 = depth0.audio;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\" type=\"audio/ogg\" />\r\n            Your browser does not support the audio element.\r\n        </audio>\r\n    </div>\r\n";
  return buffer;}

function program8(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n    <div>\r\n        <video controls=\"controls\">\r\n            <source src=\"";
  stack1 = depth0.video;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\" type=\"video/ogg\" />\r\n            Your browser does not support the video element.\r\n        </video>\r\n    </div>\r\n";
  return buffer;}

function program10(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n    <p class=\"odk-hint\">";
  foundHelper = helpers.substitute;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},inverse:self.noop,fn:self.program(11, program11, data)}); }
  else { stack1 = depth0.substitute; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  if (!helpers.substitute) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(11, program11, data)}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</p>\r\n";
  return buffer;}
function program11(depth0,data) {
  
  var stack1, foundHelper;
  stack1 = depth0.hint;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  return escapeExpression(stack1);}

  stack1 = depth0.label;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = depth0.image;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(4, program4, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = depth0.audio;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(6, program6, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = depth0.video;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(8, program8, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n";
  stack1 = depth0.hint;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(10, program10, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  return buffer;});
templates['media'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\r\n            disabled=\"true\"\r\n        ";}

function program3(depth0,data) {
  
  
  return "\r\n        <p>invalid</p>\r\n    ";}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <img width=\"200\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></img>\r\n        ";
  return buffer;}

  buffer += "<div>\r\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <input type=\"text\" name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" value=\"";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n        ";
  stack1 = depth0.disabled;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        />\r\n    ";
  stack1 = depth0.invalid;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <button>Take Picture</button>\r\n    <div class=\"mediaContainer\">\r\n        ";
  stack1 = depth0.uriValue;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n<div>";
  return buffer;});
templates['opening'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\n    <center>\n        <img src=\"";
  foundHelper = helpers.headerImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.headerImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" width=\"50%\"/>\n        <p>You are at the start of \"";
  foundHelper = helpers.formName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.formName; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\". Swipe the screen as shown below to begin.</p>\n        <div>\n            <span style=\"float:left;\">\n                <img src=\"";
  foundHelper = helpers.backupImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.backupImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"/>\n                <p>previous prompt</p>\n            </span>\n            <span style=\"float:right;\">\n                <img src=\"";
  foundHelper = helpers.advanceImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.advanceImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"/>\n                <p>next prompt</p>\n            </span>\n        </div>\n        <div style=\"clear:both;\">\n            <label for=\"instanceName\">Enter instance name:</label>\n            <input class=\"odk\" name=\"instanceName\" value=\"";
  foundHelper = helpers.instanceName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instanceName; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></input>\n        </div>\n        <button class=\"odk-big-btn editInstances\">Edit Saved Instances</button>\n    </center>\n</div>";
  return buffer;});
templates['repeat'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n                <tr class=\"tableGrid\">\r\n                    <td class=\"tableGrid\"><span>";
  foundHelper = helpers.last_saved_timestamp;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.last_saved_timestamp; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span></td>\r\n                    <td class=\"tableGrid\">\r\n                        <button id=\"";
  foundHelper = helpers.instance_id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instance_id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"whiteButton openInstance\">";
  foundHelper = helpers.instanceName;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instanceName; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</button>\r\n                    </td>\r\n                    <td class=\"tableGrid\"><span>";
  foundHelper = helpers.version;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.version; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span></td>\r\n                    <td class=\"tableGrid\"><span>";
  foundHelper = helpers.saved_status;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.saved_status; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</span></td>\r\n                    <td class=\"tableGrid\">\r\n                        <button id=\"";
  foundHelper = helpers.instance_id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.instance_id; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"whiteButton deleteInstance\">delete</button>\r\n                    </td></tr>\r\n                </tr>\r\n            ";
  return buffer;}

function program3(depth0,data) {
  
  
  return "\r\n                <span>No instances</span>\r\n            ";}

  buffer += "<table>\r\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <tr><td align=\"center\">\r\n        <table class=\"tableGrid\">\r\n            <tr class=\"tableGrid\">\r\n                <th class=\"tableGrid\">Last Save Date</th>\r\n                <th class=\"tableGrid\">Instance Name</th>\r\n                <th class=\"tableGrid\">Version</th>\r\n                <th class=\"tableGrid\">Finalized</th>\r\n                <th class=\"tableGrid\"></th>\r\n            </tr>\r\n            ";
  stack1 = depth0.instances;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            <button class=\"whiteButton addInstance\">Add an instance</button>\r\n        </table>\r\n    </td></tr>\r\n</table>";
  return buffer;});
templates['screen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "swipeForwardEnabled";}

function program3(depth0,data) {
  
  
  return "swipeBackEnabled";}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n        <div class=\"odk-toolbar\">";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\r\n    ";
  return buffer;}

function program7(depth0,data) {
  
  
  return "\r\n        <div data-role=\"page\">Please wait...</div>\r\n    ";}

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\r\n    <div class=\"odk-nav\" data-role=\"controlgroup\" data-type=\"horizontal\">\r\n        ";
  stack1 = depth0.enableBackNavigation;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(10, program10, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        ";
  stack1 = depth0.enableForwardNavigation;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(12, program12, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n    ";
  return buffer;}
function program10(depth0,data) {
  
  
  return "\r\n            <a class=\"odk-prev-btn\" data-role=\"button\">◄ back</a>\r\n        ";}

function program12(depth0,data) {
  
  
  return "\r\n            <a class=\"odk-next-btn\" data-role=\"button\">next ►</a>\r\n        ";}

  buffer += "<div class=\"odk-screen ";
  stack1 = depth0.enableForwardNavigation;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = depth0.enableBackNavigation;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\r\n    ";
  stack1 = depth0.showHeader;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <div class=\"odk-scroll odk-container\">\r\n    ";
  stack1 = depth0.loading;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(7, program7, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n    ";
  stack1 = depth0.showFooter;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(9, program9, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div>";
  return buffer;});
templates['select'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <input\r\n                ";
  stack1 = depth1.selectOne;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                ";
  stack1 = depth0.checked;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(6, program6, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n                id=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n                value=\"";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\r\n            <label for=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</label>\r\n            \r\n        ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "\r\n                    type=\"radio\"\r\n                ";}

function program4(depth0,data) {
  
  
  return "\r\n                    type=\"checkbox\"\r\n                ";}

function program6(depth0,data) {
  
  
  return "\r\n                    checked\r\n                ";}

function program8(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n\r\n                <input\r\n                    ";
  stack1 = depth0.selectOne;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                    ";
  stack1 = depth0.checked;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(13, program13, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                    name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n                    value=\"";
  foundHelper = helpers.otherValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.otherValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" />\r\n                <input\r\n                    name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "OtherValue\"\r\n                    value=\"";
  foundHelper = helpers.otherValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.otherValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" \r\n                    ";
  stack1 = depth0.other;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.selected;
  stack1 = helpers.unless.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(15, program15, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " />\r\n\r\n        ";
  return buffer;}
function program9(depth0,data) {
  
  
  return "\r\n                        type=\"radio\"\r\n                    ";}

function program11(depth0,data) {
  
  
  return "\r\n                        type=\"checkbox\"\r\n                    ";}

function program13(depth0,data) {
  
  
  return "\r\n                        checked\r\n                    ";}

function program15(depth0,data) {
  
  
  return "\r\n                        disabled=\"true\"\r\n                    ";}

  buffer += "<form>\r\n    <fieldset>\r\n        <legend>";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</legend>\r\n        ";
  stack1 = depth0.choices;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(program1, data, depth0)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        ";
  stack1 = depth0.orOther;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(8, program8, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </fieldset>\r\n</form>";
  return buffer;});
templates['video'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\r\n            disabled=\"true\"\r\n        ";}

function program3(depth0,data) {
  
  
  return "\r\n        <p>invalid</p>\r\n    ";}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <video src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" controls=\"controls\">\r\n            </video>\r\n        ";
  return buffer;}

  buffer += "<div>\r\n    ";
  stack1 = depth0;
  stack1 = self.invokePartial(partials.labelHint, 'labelHint', stack1, helpers, partials);;
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <input type=\"text\" name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" value=\"";
  foundHelper = helpers.mediaPath;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mediaPath; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n        ";
  stack1 = depth0.disabled;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        />\r\n    ";
  stack1 = depth0.invalid;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <button>Take Video</button>\r\n    <div class=\"mediaContainer\">\r\n        ";
  stack1 = depth0.uriValue;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div>\r\n<div>";
  return buffer;});
})();