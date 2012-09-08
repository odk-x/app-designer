(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['audio'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <img width=\"200\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></img>\r\n        ";
  return buffer;}

  buffer += "<ul>\r\n    <li><label for=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</label></li>\r\n    <li>\r\n        <input type=\"text\" name=\"";
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
  var buffer = "", stack1, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression;

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
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\r\n            </option>\r\n        ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "\r\n                    selected\r\n                ";}

  buffer += "<form>\r\n    <label>";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
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
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <img width=\"200\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></img>\r\n        ";
  return buffer;}

  buffer += "<ul>\r\n    <li><label for=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</label></li>\r\n    <li>\r\n        <input type=\"text\" name=\"";
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
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\r\n            disabled=\"true\"\r\n        ";}

function program3(depth0,data) {
  
  
  return "\r\n            <p>invalid</p>\r\n        ";}

  buffer += "<ul>\r\n    <li><label>";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</label></li>\r\n    <li><input type=\"text\" value=\"";
  foundHelper = helpers.value;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n        ";
  stack1 = depth0.disabled;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        />\r\n        ";
  stack1 = depth0.invalid;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </li>\r\n</ul>";
  return buffer;});
templates['instances'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

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
  
  
  return "\r\n                <span>Unexpected absence of records</span>\r\n            ";}

  buffer += "<table>\r\n    <tr>\r\n        <td align=\"center\" colspan=\"2\">\r\n            <img src=\"";
  foundHelper = helpers.baseDir;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.baseDir; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.headerImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.headerImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" height=\"216px\" width=\"344px\"/>\r\n        </td>\r\n    </tr>\r\n    <tr><td align=\"center\"><span>Select an instance to edit:</span></td></tr>\r\n    <tr><td align=\"center\">\r\n        <table class=\"tableGrid\">\r\n            <tr class=\"tableGrid\">\r\n                <th class=\"tableGrid\">Last Save Date</th>\r\n                <th class=\"tableGrid\">Instance Name</th>\r\n                <th class=\"tableGrid\">Version</th>\r\n                <th class=\"tableGrid\">Finalized</th>\r\n                <th class=\"tableGrid\"></th>\r\n            </tr>\r\n            ";
  stack1 = depth0.instances;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        </table>\r\n    </td></tr>\r\n</table>";
  return buffer;});
templates['media'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  return "\r\n            disabled=\"true\"\r\n        ";}

function program3(depth0,data) {
  
  
  return "\r\n            <p>invalid</p>\r\n        ";}

function program5(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <img width=\"200\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"></img>\r\n        ";
  return buffer;}

  buffer += "<ul>\r\n    <li><label for=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</label></li>\r\n    <li><input type=\"text\" name=\"";
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
  buffer += "\r\n        />\r\n        ";
  stack1 = depth0.invalid;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </li>\r\n    <li><button class=\"whiteButton\">Take Picture</button></li>\r\n    <li><div class=\"mediaContainer\">\r\n        ";
  stack1 = depth0.uriValue;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(5, program5, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div></li>\r\n</ul>";
  return buffer;});
templates['opening'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\n    <table>\n        <tr>\n            <td align=\"center\" colspan=\"2\">\n                <img src=\"";
  foundHelper = helpers.baseDir;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.baseDir; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.headerImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.headerImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" height=\"216px\" width=\"344px\"/>\n            </td>\n        </tr>\n        <tr>\n            <td align=\"center\" colspan=\"2\">\n                <span>You are at the start of \"Widgets\". Swipe the screen as shown below to begin.</span>\n            </td>\n        </tr>\n        <tr>\n            <td align=\"left\">\n                <img src=\"";
  foundHelper = helpers.baseDir;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.baseDir; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.backupImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.backupImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" height=\"81px\" width=\"145px\"/>\n            </td>\n            <td align=\"right\">\n                <img src=\"";
  foundHelper = helpers.baseDir;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.baseDir; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1);
  foundHelper = helpers.advanceImg;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.advanceImg; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" height=\"81px\" width=\"145px\"/>\n            </td>\n        </tr>\n        <tr>\n            <td align=\"left\">back to previous prompt</td>\n            <td align=\"right\">forward to next prompt</td>\n        </tr>\n        <tr>\n            <td align=\"center\" colspan=\"2\">\n                <button class=\"whiteButton editInstances\">Edit Saved Instances</button>\n            </td>\n        </tr>\n    </table>\n</div>";
  return buffer;});
templates['repeat'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
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

  buffer += "<table>\r\n    <tr><td align=\"center\">\r\n        <table class=\"tableGrid\">\r\n            <tr class=\"tableGrid\">\r\n                <th class=\"tableGrid\">Last Save Date</th>\r\n                <th class=\"tableGrid\">Instance Name</th>\r\n                <th class=\"tableGrid\">Version</th>\r\n                <th class=\"tableGrid\">Finalized</th>\r\n                <th class=\"tableGrid\"></th>\r\n            </tr>\r\n            ";
  stack1 = depth0.instances;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n            <button class=\"whiteButton addInstance\">Add an instance</button>\r\n        </table>\r\n    </td></tr>\r\n</table>";
  return buffer;});
templates['screen'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n        <div class=\"toolbar\">";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</div>\r\n    ";
  return buffer;}

function program3(depth0,data) {
  
  
  return "\r\n        <div class=\"info\">\r\n            <button class=\"whiteButton prev-btn\">backward</button>\r\n            <span>Powered by OpenDataKit</span>\r\n            <button class=\"whiteButton next-btn\">forward</button>\r\n        </div>\r\n    ";}

  buffer += "<div class=\"current\" data-role=\"page\">\r\n    ";
  stack1 = depth0.showHeader;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    <div class=\"scroll\"></div>\r\n    ";
  stack1 = depth0.showFooter;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n</div>";
  return buffer;});
templates['select'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, self=this, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data,depth1) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <li>\r\n                <input\r\n                    ";
  stack1 = depth1.selectOne;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                    ";
  stack1 = depth0.value;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(6, program6, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                    name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\r\n                    value=\"x\" />\r\n                ";
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\r\n            </li>\r\n        ";
  return buffer;}
function program2(depth0,data) {
  
  
  return "\r\n                        type=\"radio\"\r\n                    ";}

function program4(depth0,data) {
  
  
  return "\r\n                        type=\"checkbox\"\r\n                    ";}

function program6(depth0,data) {
  
  
  return "\r\n                        checked\r\n                    ";}

function program8(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <li>\r\n                <input\r\n                    ";
  stack1 = depth0.selectOne;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n                    ";
  stack1 = depth0.other;
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
  buffer += " />\r\n            </li>\r\n        ";
  return buffer;}
function program9(depth0,data) {
  
  
  return "\r\n                        type=\"radio\"\r\n                    ";}

function program11(depth0,data) {
  
  
  return "\r\n                        type=\"checkbox\"\r\n                    ";}

function program13(depth0,data) {
  
  
  return "\r\n                        checked\r\n                    ";}

function program15(depth0,data) {
  
  
  return "\r\n                        disabled=\"true\"\r\n                    ";}

  buffer += "<form>\r\n    <label>";
  stack1 = depth0.label;
  foundHelper = helpers.localize;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "localize", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</label>\r\n    <ul>        \r\n        ";
  stack1 = depth0.choices;
  stack1 = helpers.each.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.programWithDepth(program1, data, depth0)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n        ";
  stack1 = depth0.orOther;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(8, program8, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </ul>\r\n</form>";
  return buffer;});
templates['video'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\r\n            <video poster=\"";
  foundHelper = helpers.videoPoster;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.videoPoster; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" src=\"";
  foundHelper = helpers.uriValue;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uriValue; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" width=\"200\" controls=\"controls\" onclick=\"this.play()\">\r\n            </video>\r\n        ";
  return buffer;}

  buffer += "<ul>\r\n    <li><label for=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.label; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</label></li>\r\n    <li>\r\n        <input type=\"text\" name=\"";
  foundHelper = helpers.name;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" value=\"";
  foundHelper = helpers.mediaPath;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.mediaPath; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" disabled=\"true\" />\r\n    </li>\r\n    <li><button class=\"whiteButton\">Take Video</button></li>\r\n    <li><div class=\"mediaContainer\">\r\n        ";
  stack1 = depth0.uriValue;
  stack1 = helpers['if'].call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data)});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\r\n    </div></li>\r\n</ul>";
  return buffer;});
})();