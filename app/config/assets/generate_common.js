window.odkCommonDefinitions = {_tokens: {}};
// used in both display and fake_translate, just stuff that the translatable object might be wrapped in
//var possible_wrapped = ["prompt", "title"];
window.possible_wrapped = ["prompt"]
var preferred_locale = null; // for caching

// Mocks translation, much faster than actual translation
window.fake_translate = function fake_translate(thing, optional_table, optional_form) {
	// Can't translate undefined
	if (thing === undefined || thing === null) return _t("Error translating ") + thing;

	// This will be hit eventually in a recursive call
	if (typeof(thing) == "string") return thing;
	if (typeof(thing) == "number") return thing;

	// A list of all the things the text might be wrapped in.
	// For real translation, we wouldn't do this, but for fake translation, attempt to automatically unwrap things like normal but also unwrap from the device default locale (sometimes "default", sometimes "_")
	var possible_wrapped_full = window.possible_wrapped.concat(["default", "_", "title"]);
	for (var i = 0; i < possible_wrapped_full.length; i++) {
		// if thing is like {"default": inner} then return fake_translate(inner)
		// but also do that for everything in possible_wrapped_full not just "default"
		if (thing[possible_wrapped_full[i]] !== undefined) {
			return fake_translate(thing[possible_wrapped_full[i]], optional_table, optional_form);
		}
	}

	// i18nFieldNames is usually ["text", "audio", "video", "image"]
	// Since an object might have multiple of these, like {"text": "Egret selected", "image": "media/egret.jpeg"}
	// and we want to extract all of them, let display_update_result concatenate them together into
	// "Egret selected<img src='media/egret.jpeg' />" for us, and run display_update_result once for each field type
	var result = "";
	for (var j = 0; j < odkCommon.i18nFieldNames.length; j++) {
		if (thing[odkCommon.i18nFieldNames[j]] !== undefined) {
			result = display_update_result(result, thing[odkCommon.i18nFieldNames[j]], odkCommon.i18nFieldNames[j], "default", optional_table, optional_form);
		}
	}

	// If we were able to find at least one of the four field types, we're good
	if (result.length > 0) {
		return result;
	}

	// Otherwise, we have no idea what kind of object this is. Sorry!
	return _t("Error fake translating ") + JSON.stringify(thing);
};

// Helper function for display and fake_translate
window.display_update_result = function display_update_result(result, this_result, field, selected_locale, table, form) {
	if (!result) result = "";
	if (this_result !== null && this_result !== undefined && (typeof(this_result) != "string" || this_result.trim().length > 0)) {
		if (field == "text") {
			while (typeof(this_result) == "string" && typeof(_data_wrapper) != "undefined" && this_result.indexOf("{{data.") > 0) {
				var idx = this_result.indexOf("{{data.");
				var beginning = this_result.substr(0, idx);
				var rest = this_result.substr(idx + "{{data.".length);
				var col = rest.substr(0, rest.indexOf("}}"))
				rest = rest.substr(rest.indexOf("}}") + "}}".length);
				this_result = beginning + _data_wrapper(col) + rest;
			}
			result += this_result;
		} else {
			var url = "";
			if (table && form) {
				var thing = {};
				thing[field] = this_result;
				url = odkCommon.localizeUrl(selected_locale, thing, field, "/" + appname + "/config/tables/" + table + "/forms/" + form + "/")
			} else {
				url = this_result;
			}
			if (field == "audio") {
				result += "<audio controls='controls'><source src='" + url + "' /></audio>";
			}
			if (field == "video") {
				result += "<video controls='controls'><source src='" + url + "' /></video>";
			}
			if (field == "image") {
				result += "<img src='" + url + "' />";
			}
		}
	}
	return result;
};

// This is an unfortunately named function, it should really be called translate, not display
// It also needs to be optimized. Nothing obvious to do, but it gets called a lot
window.display = function display(thing, table, optional_possible_wrapped, form) {
	var this_possible_wrapped = window.possible_wrapped;
	if (optional_possible_wrapped) this_possible_wrapped = optional_possible_wrapped;
	if (typeof(thing) == "string") return thing;
	if (typeof(thing) == "undefined") {
		// A recursive call on an error? What could possibly go wrong!
		return _t("Can't translate undefined!");
	}
	for (var i = 0; i < this_possible_wrapped.length; i++) {
		if (thing[this_possible_wrapped[i]] !== undefined) {
			return display(thing[this_possible_wrapped[i]], table, this_possible_wrapped, form);
		}
	}
	// if we get {text: "something"}, don't bother asking odkCommon to do it, just call fake_translate
	// however if we get {text: {default: "a", hindi: "b"}} we should continue with the real translation instead
	for (var j = 0; j < odkCommon.i18nFieldNames.length; j++) {
		var unwrapped = thing[odkCommon.i18nFieldNames[j]]
		if (typeof(unwrapped) == "string" || typeof(unwrapped) == "number") {
			return fake_translate(thing, table, form);
		}
	}

	// Insert it into odkCommonDefinitions so that we can pass it to localizeTokenField, which
	// only takes a key into odkCommonDefinitions because the whole translation system was designed poorly

	// i18nFieldNames is usually ["text", "audio", "video", "image"]
	// Since an object might have multiple of these, like {"text": "Egret selected", "image": "media/egret.jpeg"}
	// and we want to extract all of them, let display_update_result concatenate them together into
	// "Egret selected<img src='media/egret.jpeg' />" for us, and run display_update_result once for each field type
	var result = "";
	for (i = 0; i < odkCommon.i18nFieldNames.length; i++) {
		var field = odkCommon.i18nFieldNames[i];
		if (preferred_locale == null) {
			preferred_locale = odkCommon.getPreferredLocale();
		}
		this_result = odkCommon.localizeTokenField(preferred_locale, thing, field);
		if (this_result === true) return true; // used in __tr for passthrough translations
		result = display_update_result(result, this_result, field, preferred_locale, table, form);
	}
	return result;
};

// Helper function for newGuid
var S4 = function S4() {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
};
// does what it says on the box
window.newGuid = function newGuid() {
	return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
};

// At one time, all pages called these two functions to open a link. Then it was easy to quickly swap out browser-based
// navigation for activity/doAction based navigation. However, they aren't really used anymore
window.page_go = function page_go(location) {
	//document.location.href = location;
	odkTables.launchHTML({}, location);
};
// if this is called twice in the same webkit, tables hangs on all webkits and you have to force restart it.
// Some forms that override the `initial` section call it twice
var page_back_called = false;
window.page_back = function page_back() {
	if (page_back_called) {
		console.log("Already called close window, ignoring")
		return;
	}
	page_back_called = true;
	//window.history.back();
	odkCommon.closeWindow(-1, null);
};

// Javascript will refuse to parse json that uses single quotes instead of double quotes, 
window.jsonParse = function jsonParse(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		new_text = text.replace(/\'/g, '"');
		try {
			return JSON.parse(new_text);
		} catch (e) {
			new_text = text.replace(/\"/g, "\\\"")
			new_text = new_text.replace(/\'/g, '"');
			// This is a last-ditch effort to save the situation, and it might still fail. The basic idea is
			// {'text': 'He said "Ow"'} -> {'text': 'He said \"Ow\"'} -> {"text": "He said \"Ow\""}
			// THIS MAY STILL THROW AN EXCEPTION
			return JSON.parse(new_text)
		}
	}
};
// Tries to translate the given column name, and if there's no translation, at least it will make it look pretty
// Even in the default app, no columns have translations, so whatever
window.displayCol = function constructSimpleDisplayName(name, metadata, table, optional_form) {
	// Otherwise remove anything after the dot, if it's a group by column in a list view it may be in the form of table_id.column_id
	if (name.indexOf(".") > 0) {
		name = name.split(".", 2)[1]
	}
	// first check the translations we pulled from the db's kvs
	if (metadata) {
		var kvs = metadata.keyValueStoreList;
		var kvslen = kvs.length;
		for (var i = 0; i < kvslen; i++) {
			var entry = kvs[i];
			if (entry.partition == "Column" && entry.aspect == name && (entry.key == "displayName" || entry.key == "display_name")) {
				return display(jsonParse(entry.value), table, window.possible_wrapped, optional_form);
			}
		}
	}
	// if it's a special column, like _sync_state or _savepoint_type, just return it unchanged
	if (name[0] == "_") return name;
	// Pretty print it
	return pretty(name);
};
// Pretty prints stuff with underscores in them. First it replaces underscores with spaces, then capitalizes each word.
window.pretty = function pretty(name) {
	if (name === null || name === undefined) name = ""
	if (typeof(name) != "string") name = name.toString();
	name = name.replace(/_/g, " "); // can't just replace("_", " ") or it will only hit the first instance
	var sections = name.split(" ");
	var new_name = ""
	for (var i = 0; i < sections.length; i++) {
		if (sections[i].length > 0) {
			if (new_name.length > 0) new_name += " "
			new_name += sections[i][0].toUpperCase() + sections[i].substr(1);
		}
	}
	return new_name;
}
// Retrieves what should be displayed on screen for the given column name. First tries to pull it from
// optional_pair, which is supposedly an entry in allowed_group_bys, but if that's not set it tries to
// pull it from allowed_group_bys, and if that doesn't contain it it just returns the translated column name
window.get_from_allowed_group_bys = function get_from_allowed_group_bys(allowed_group_bys, colname, optional_pair, metadata, table) {
	// If we have no allowed_group_bys, always just translate the column name and leave it at that
	if (!allowed_group_bys) {
		optional_pair = [colname, true];
	}
	// If we weren't given an entry in allowed_group_bys, try and find the right entry
	if (!optional_pair) {
		for (var i = 0; i < allowed_group_bys.length; i++) {
			if (allowed_group_bys[i][0] == colname) {
				optional_pair = allowed_group_bys[i];
				break;
			}
		}
	}
	// If we couldn't find it in allowed_group_bys, just translate it normally
	if (!optional_pair) optional_pair = [colname, true]
	// For a full spec see README.md
	// if the user specified true, translate the column, if they specified false, return the exact column id
	// otherwise show the string the user specified
	if (optional_pair[1] === true) {
		return displayCol(optional_pair[0], metadata, table);
	} else if (optional_pair[1] === false) {
		return optional_pair[0];
	} else {
		return optional_pair[1];
	}
}
// helper function to get the relative path to where we are now. So if window.location.href
// is /coldchain/config/assets/refrigerators.html#refrigerator_type then it will
// return config/assets/refrigerators.html , which we can then add a hash to and pass to odkTables.launchHTML
var clean_href = function clean_href() {
	var href = window.location.href.split("#")[0]
	href = href.split(appname, 2)[1]
	return href;
}

// Don't use this function, use _t or _tu
var __tr = function __tr(s) {
	console.log("About to translate: " + s);
	var args = Array.prototype.slice.call(arguments, 1)
	if (s.length == 0) return ["ok",  ""]
	var found = formgen_specific_translations[s];
	var retVal = null;
	if (found != undefined) {
		var result = display(found, null);
		retVal = ["ok", result];
		if (result === true) retVal[1] = s;
	}
	found = user_translations[s];
	if (found != undefined) {
		var result = display(found, null);
		retVal = ["ok", result];
		if (result === true) retVal[1] = s;
	}
	if (retVal == null) return ["error", s];
	for (var i = 0; i < args.length; i++) {
		retVal[1] = retVal[1].replace("?", args[i])
	}
	return retVal;
}

// Try and translate something that's formgen specific, alert if we can't
window._t = function(s) {
	var result = __tr.apply(null, arguments);
	if (result[0] == "ok") return result[1];
	alert("_t could not translate " + s);
	return s;
}
// Try and translate something from the user specific translations, log a message if we can't
window._tu = function(s) {
	var result = __tr.apply(null, arguments);
	if (result[0] == "ok") return result[1];
	console.log("_tu could not translate " + s)
	return s;
}
// Try and translate a choice, this should be used for anything coming out of the database
window._tc = function(d, column, text) {
	/*
	if (d.getColumnChoicesList(column) == null) {
		// not a prompt type that needs choices
		return text;
	}
	var toTranslate = d.getColumnChoiceDataValueObject(column, text);
	if (toTranslate == null) {
		// user-entered other value in a select-one-with-other
		return text;
	}
	var result = display(toTranslate.display, d.getTableId());
	if (result == null) {
		// odkCommon shit the bed again
		return text;
	}
	return result;
	*/
	var table = d.getTableId();
	if (cols_that_need_choices[table] != undefined) {
		if (column in cols_that_need_choices[table]) {
			choice_list = cols_that_need_choices[table][column];
			var cs = all_choices[table];
			for (var i = 0; i < cs.length; i++) {
				if (cs[i]["choice_list_name"] == choice_list && cs[i]["data_value"] == text) {
					return display(cs[i]["display"], d.getTableId(), window.possible_wrapped.concat("title"));
				}
			}
			// other in a select one with other
			return text;
		}
		// wtf
		return text;
	}
	return text;
}
// Opens a map view for a where clause that only takes one argument, for anything else use STATIC
var open_simple_map = function open_map(table, where, args) {
	odkTables.openTableToMapView(null, table, where, args, list_views[table] + "#" + table + "/" + where + "/" + args[0]);
}

var formgen_specific_translations = {
	"Prompt for database column ": {"text": {
		"default": true,
		"es": "Prompt por la columna "
	}},
	" not found on the screen! Will be stored in the database as null!": {"text": {
		"default": true,
		"es": " no encontrado en el viento! Estará en el baso de datos como null!"
	}},
	"Unknown query type ": {"text": {
		"default": true,
		"es": "No conozco la forma de popular opciones: "
	}},
	"Failed to start cross-table query: ": {"text": {
		"default": true,
		"es": "No se pudo empezar el poblar de opciones de una tabla: "
	}},
	"Unexpected failure": {"text": {
		"default": true,
		"es": "Errór inesperado"
	}},
	"This shouldn't be possible, don't know how to update screen column ": {"text": {
		"default": true,
		"es": "Este no debe ser posible, no hay forma de cambiar el texto en el viento para la celuda "
	}},
	"Unexpected failure to save row": {"text": {
		"default": true,
		"es": "Inesperadamente no se puede salvar la fila"
	}},
	"Error saving row: ": {"text": {
		"default": true,
		"es": "Inesperadamente no se puede salvar la fila"
	}},
	"An error occurred while loading the page. ": {"text": {
		"default": true,
		"es": "Se ha occurido un error mientras cargando este viento. "
	}},
	"Error, location providers are disabled.": {"text": {
		"default": true,
		"es": "Error, provisor de ubicacion no está eneblado"
	}},
	"Unknown type in dispatch struct!": {"text": {
		"default": true,
		"es": "Tipo de pregunta en la estructura de envío no conocido"
	}},
	"Error translating ": {"text": {
		"default": true,
		"es": "Error al traducir "
	}},
	"Are you sure? All entered data will be deleted.": {"text": {
		"default": true,
		"es": "¿Está usted seguro? Todos los datos en este fila será perdido."
	}},
	"Unexpected error deleting row: ": {"text": {
		"default": true,
		"es": "Inesperadamente no se puede eliminar la fila"
	}},
	"Error launching ": {"text": {
		"default": true,
		"es": "Inesperadamente no se puede lanzar "
	}},
	"yes": {"text": {
		"default": true,
		"es": "sí"
	}},
	"no": {"text": {
		"default": true,
		"es": "no"
	}},
	"No row id in uri, beginning new instance with id ": {"text": {
		"default": true,
		"es": "No se puede hallar el id de la fila en el URL, empezando una fila nueva"
	}},
	"Save incomplete": {"text": {
		"default": true,
		"es": "Salvar como no completado"
	}},
	"Cancel": {"text": {
		"default": true,
		"es": "Cancelar"
	}},
	"Next": {"text": {
		"default": true,
		"es": "Adelante!"
	}},
	"Back": {"text": {
		"default": true,
		"es": "Retirarse"
	}},
	"Finalize": {"text": {
		"default": true,
		"es": "Finalizar"
	}},
	"Can't translate undefined!": {"text": {
		"default": true,
		"es": "¡No se puede traducir texto lo que no existe!"
	}},
	"Error fake translating ": {"text": {
		"default": true,
		"es": "Error al pretender a traducir "
	}},
	"Couldn't translate ": {"text": {
		"default": true,
		"es": "No se puede traducir "
	}},
	"Please confirm deletion of row ": {"text": {
		"default": true,
		"es": "Por favor confirme que quiere usted eliminar la fila "
	}},
	"Failed to _delete row - ": {"text": {
		"default": true,
		"es": "Inesperadamente no se puede _eliminar la fila "
	}},
	"Row not found!": {"text": {
		"default": true,
		"es": "¡Fila no encontrada!"
	}},
	"Error querying data: ": {"text": {
		"default": true,
		"es": "Error al pedir data: "
	}},
	"Delete Row": {"text": {
		"default": true,
		"es": "Eliminar fila"
	}},
	"Edit Row": {"text": {
		"default": true,
		"es": "Editar fila"
	}},
	"Edit": {"text": {
		"default": true,
		"es": "Editar"
	}},
	"Delete": {"text": {
		"default": true,
		"es": "Eliminar"
	}},
	"By ": {"text": {
		"default": true,
		"es": "En grupos de "
	}},
	"Unknown selector in query hash": {"text": {
		"default": true,
		"es": "El seleccionador encontrado en el URL es desconocido"
	}},
	"Couldn't guess instance col. Bailing out, you're on your own.": {"text": {
		"default": true,
		"es": "No se puede automáticamente detectar cual celda por demostrar, demostrando el id"
	}},
	"No table id! Please set it in customJsOl or pass it in the url hash": {"text": {
		"default": true,
		"es": "¡No hay ID de tabla! Por favor ponerlo en customJsOl o darla en el URL"
	}},
	"Unexpected error ": {"text": {
		"default": true,
		"es": "Error inesperado"
	}},
	"Could not get columns: ": {"text": {
		"default": true,
		"es": "No se puede obtener las columnas"
	}},
	"Simple search did not return any results, trying a more advanced search. This might take a minute...": {"text": {
		"default": true,
		"es": "Todavia buscando..."
	}},
	"No results": {"text": {
		"default": true,
		"es": "Sin resultos"
	}},
	"rows ": {"text": {
		"default": true,
		"es": "filas "
	}},
	"Showing ": {"text": {
		"default": true,
		"es": "Demostrando "
	}},
	" of ": {"text": {
		"default": true,
		"es": " de "
	}},
	" distinct values of ": {"text": {
		"default": true,
		"es": " valores unicos de "
	}},
	" rows where ": {"text": {
		"default": true,
		"es": " filas donde "
	}},
	" is ": {"text": {
		"default": true,
		"es": " está "
	}},
	"Add Row": {"text": {
		"default": true,
		"es": "Aggregar fila"
	}},
	"Group by": {"text": {
		"default": true,
		"es": "Ver in grupos de..."
	}},
	"Go": {"text": {
		"default": true,
		"es": "¡Ir!"
	}},
	"Previous Page": {"text": {
		"default": true,
		"es": "Previo"
	}},
	"Next Page": {"text": {
		"default": true,
		"es": "Siguiente"
	}},
	"Search": {"text": {
		"default": true,
		"es": "Buscar"
	}},
	"List of tables": {"text": {
		"default": true,
		"es": "Lista de tablas"
	}},
	"Failure! ": {"text": {
		"default": true,
		"es": "¡Error!"
	}},
	"Loading...": {"text": {
		"default": true,
		"es": "Cargando..."
	}},
	"Save incomplete": {"text": {
		"default": true,
		"es": "Guardar como no completado"
	}},
	"Cancel and delete row": {"text": {
		"default": true,
		"es": "Cancelar y eliminar fila"
	}},
	"Choose Picture": {"text": {
		"default": true,
		"es": "Elegir Foto"
	}},
	"Capture Picture": {"text": {
		"default": true,
		"es": "Grabar Foto"
	}},
	"Choose Audio": {"text": {
		"default": true,
		"es": "Elegir Audio"
	}},
	"Capture Audio": {"text": {
		"default": true,
		"es": "Grabar Audio"
	}},
	"Choose Video": {"text": {
		"default": true,
		"es": "Elegir Video"
	}},
	"Capture Video": {"text": {
		"default": true,
		"es": "Grabar Video"
	}},
	"Record location": {"text": {
		"default": true,
		"es": "Grabar Ubicación"
	}},
	"Required field": {"text": {
		"default": true,
		"es": "Dato requerido"
	}},
	"Column ? is required but no value was provided": {"text": {
		"default": true,
		"es": "Dato ? es requerido pero no tiene respuesta"
	}},
	"Delete row ??": {"text": {
		"default": true,
		"es": "¿Eliminar fila ??"
	}},
	"Saving...": {"text": {
		"default": true,
		"es": "Guardando..."
	}},
	"Finalizing...": {"text": {
		"default": true,
		"es": "Finalizando..."
	}},
	"Selected Marker": {"text": {
		"default": true,
		"es": "Seleccionado"
	}}
}
