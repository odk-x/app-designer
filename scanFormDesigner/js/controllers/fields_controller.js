var devUtil = require('devenv-util');
var count = 1;
ODKScan.FieldsController = Ember.ArrayController.extend({
    isImageEditing: false,	// toggles app between field editing and image editing mode
    imgSelect: null,		// imgAreaSelect object used to crop images
    numPages: 1,			// number of pages
    pageStyle: "letter_portrait",	// the page style used by pages in the current Scan document
    selectedPageTab: null,	// metadata about the currently selected page tab (number, active/non-active, DOM reference)
    pages: [],			// list of JSON objects containing page tab metadata
    images: {},				// JSON containing references to image metadata (reference count, image src)
    selectedImageTab: null,	// metadata about the currently selected image tab (name, data, reference count)
    deletedFields: [],		// stores up to N deleted fields from an ODK Scan document
    imageList: function () {	// the image tab list
        var images = this.get("images");
        var image_list = [];
        for (img in images) {
            image_list.push(images[img]);
        }
        console.log(image_list);
        return image_list;
    }.property(),
    defaultImages: function () {
        /*  Creates JSON metadata for the default images that are loaded
            into every new Scan page.
        */

        // NOTE: the values div_top and top_left are both set by the function
        // addDefaultImages. These values depend on the size of the page they
        // are added to.

        // NOTE : If any default image gets changed, then we need to adjust
        // the orig_height and orig_width and also img_top and img_left
        // for each four images.
        var images = {};
        images.top_left = {
            img_name: "form",
            img_src: "default_images/top_left.jpg",
            img_height: 91,
            img_width: 91,
            orig_height: 310,
            orig_width: 310,
            img_top: 0,
            img_left: 0,
        };
        images.top_right = {
            img_name: "form",
            img_src: "default_images/top_right.jpg",
            img_height: 91,
            img_width: 91,
            orig_height: 310,
            orig_width: 310,
            img_top: 0,
            img_left: -2410
        };	// total width of orig_width - form_image width
        images.bottom_left = {
            img_name: "form",
            img_src: "default_images/bottom_left.jpg",
            img_height: 70,
            img_width: 91,
            orig_height: 231,
            orig_width: 300,
            img_top: -3289,  // total height of orig_height-form_image height
            img_left: 0
        };
        images.bottom_right = {
            img_name: "form",
            img_src: "default_images/bottom_right.jpg",
            img_height: 71,
            img_width: 200,
            orig_height: 250,
            orig_width: 704,
            img_top: -3270,  // total height of orig_height - form_image height
            img_left: -2016
        };  // total width of orig_width - form_image width
        return images;
    }.property(),
    init: function () {
        this._super();

        var controller = this;
        $(document).ready(function () {
            $(window).on('beforeunload', function () {
                return 'You are about to leave the ODK Scan application.'
            });

            // set default view in properties sidebar
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            /* 	imgAreaSelect field is initialized here,
                setting it as field allows the controller to
                access/modify the the selected image region
                based on interaction from the user.
            */
            var ias = $('#loaded_image').imgAreaSelect({
                instance: true,
                handles: true
            });
            controller.set('imgSelect', ias);

            /* 	Loading snippets images into a Scan doc requires storing the
                base64 data of the original source image. In order to load
                the default images into the page we have to extract the base64
                src of the image that they come from (default_images/form.jpg).
                This code loads that image and then stores it in the
                defaultFormSrc field of the controller.

                Code borrowed/modified from:
                http://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
            */
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                img = new Image;
            img.crossOrigin = 'Anonymous';
            img.src = "default_images/form.jpg";
            img.onload = function () {
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL('image/jpeg');
                controller.set("defaultFormSrc", dataURL);
                controller.send("newPage", controller.get("pageStyle"));
                controller.notifyPropertyChange("imageList");
                canvas = null;
            };
        });
    },
    actions: {
        /**
         *    Enables the image importing mode.
         */
        enableImageEdit: function () {
            $("#prop_sidebar").hide("slow");

            // unselect the current image tab
            var currSelectedImageTab = this.get("selectedImageTab");
            if (currSelectedImageTab != null) {
                Ember.set(currSelectedImageTab, "isActive", false);
            }

            this.set('isImageEditing', true);
        },
        /**
         *    Enables the field editing mode.
         */
        enableFieldEdit: function () {
            // remove the loaded image from the loaded_image container
            $("#loaded_image").attr("src", null);

            // cancel any currently selected image region
            var ias = this.get('imgSelect');
            ias.cancelSelection();

            // revert back to displaying the properties sidebar
            $("#prop_sidebar").show("slow");
            this.set('isImageEditing', false);
        },
        /**
         *    Opens the warning dialog when user attempts to
         *    change the page style (because all fields are
         *    deleted after changing the style).
         */
        openPageStyleDialog: function () {
            $("#page_style_warning_dialog").dialog("open");
        },
        /**
         *    A helper function which deletes all pages,
         *    fields, and controller page metadata.
         */
        deleteAllPages: function () {
            // delete all current pages, fields
            this.set("numPages", 1);
            this.set("pages", []);
            this.set("images", {});
            $(".img_div").remove();
            $(".field").remove();
            Ember.set(this.get('selectedPageTab'), 'isActive', false);
        },
        /**
         *    Sets the page to the style selected by the user
         *    in the page style dialog. Deletes all fields
         *    from the current pages, creates all new pages.
         */
        setPageStyle: function () {
            // delete all pages, update page style
            var num_pages = this.get("pages").length;
            this.send("deleteAllPages");
            this.set("pageStyle", $("#page_size").val());

            for (var i = 0; i < num_pages; i++) {
                this.send("newPage");
            }

            // re-select the current page
            if (num_pages > 0) {
                this.send("selectPageTab", this.get("pages")[0]);
            }
            $("#page_style_dialog").dialog("close");

            // add default images
            this.send("addDefaultImages");
        },
        /**
         *    Closes the page style dialog.
         */
        cancelPageStyleDialog: function () {
            $("#page_style_dialog").dialog("close");
        },
        /**
         *    Adds default images to the currenty selected page.
         */
        addDefaultImages: function () {
            var images = this.get("defaultImages");
            // calculate the positions for each respective
            // image snippet within the current page
            images.top_left.div_top = 0;
            images.top_left.div_left = 0;

            images.top_right.div_top = 0;
            images.top_right.div_left = $(".selected_page").width() - images.top_right.img_width;

            images.bottom_left.div_top = $(".selected_page").height() - images.bottom_left.img_height;
            images.bottom_left.div_left = 0;

            images.bottom_right.div_top = $(".selected_page").height() - images.bottom_right.img_height;
            images.bottom_right.div_left = $(".selected_page").width() - images.bottom_right.img_width;

            image_to_field(images.top_left);
            image_to_field(images.top_right);
            image_to_field(images.bottom_left);
            image_to_field(images.bottom_right);

            // update image ref count of the form
            var form_src = this.get("defaultFormSrc");
            this.send("addImageRef", "form", form_src);
            this.send("addImageRef", "form", form_src);
            this.send("addImageRef", "form", form_src);
            this.send("addImageRef", "form", form_src);
        },
        /**
         *    Responds to a user a selecting an image to upload,
         *    uploads the image onto the page.
         */
        loadUserImage: function () {
            // NOTE: 'event' argument is not listed as a parameter
            // but it is still possible to be accessed from within
            // this function, I am not sure how this is actually
            // possible.
            var selectedFile = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function (event) {
                // set properties of the image
                $("#loaded_image").attr('src', event.target.result);
                $("#loaded_image").data('filename', selectedFile.name);
            };
            reader.readAsDataURL(selectedFile);
        },
        /**
         *    Opens a file browser to allow the user to select
         *    an image to upload.
         */
        selectImage: function () {
            // cancel any currently selected image region
            var ias = this.get('imgSelect');
            ias.cancelSelection();

            // reset any previously chosen files
            $("#image_select").val("");

            /* 	NOTE: Pressing 'Select Image' triggers a hidden html
                file-input arrow #image_select. The arrow is hidden
                in order to override its appearance.
            */
            $("#image_select").click();
        },
        /**
         *    Responds to the user selecting an image tab, loads
         *    the corresponding image of the tab that they have
         *    selected.
         *    @param (image) JSON containing reference to the
         *        image referenced by the image tab.
         */
        selectImageTab: function (image) {
            // cancel any currently selected image region
            var ias = this.get('imgSelect');
            ias.cancelSelection();

            // unselect the current image tab
            var currSelectedImageTab = this.get("selectedImageTab");
            if (currSelectedImageTab != null) {
                Ember.set(currSelectedImageTab, "isActive", false);
            }

            // select the new image tab
            Ember.set(image, "isActive", true);
            this.set("selectedImageTab", image);

            // set the selected image
            $("#loaded_image").attr("src", image.data);
            $("#loaded_image").data("filename", image.name);
        },
        /**
         *    Opens up the image tab remove dialog.
         */
        openImageTabDialog: function () {
            $("#itab_remove_dialog").dialog("open");
        },
        /**
         *    Removes the currently selected image tab, also optionally
         *    removes all fields in the document that are associated
         *    with it.
         */
        removeImageTab: function () {
            if ($("#remove_itab_cb").prop("checked")) {
                // delete all referenced image snippets
                var img_name = this.get("selectedImageTab").name;
                $(".img_div").filter(function () {
                    return $(this).data("img_name") == img_name
                }).remove();

                delete this.get('images')[this.get("selectedImageTab").name];

                // notify the image tabs to update
                this.notifyPropertyChange("imageList");
            }

            // remove the currently selected image tab, reset other fields
            this.get("imageList").removeObject(this.get("selectedImageTab"));
            this.set("selectedImageTab", null);
            $("#loaded_image").attr("src", null);

            $("#itab_remove_dialog").dialog("close");
        },
        /**
         *    Stores new image into the controller and creates an
         *    image tab for it, if it does not already store an
         *    image with the same name.
         *    @param (image_name) The filename of the added image.
         *    @param (img_src) The base64 src of the added image.
         */
        addImage: function (image_name, img_src) {
            // add image_name to the images field
            var images = this.get('images');
            if (!images[image_name]) {
                // unselect the current image tab
                var currSelectedImageTab = this.get("selectedImageTab");
                if (currSelectedImageTab != null) {
                    Ember.set(currSelectedImageTab, "isActive", false);
                }

                // create, select new image tab
                var newImageTab = {ref_count: 0, isActive: false, data: img_src, name: image_name};
                this.set("selectedImageTab", newImageTab);
                Ember.set(images, image_name, newImageTab);

                // notify the image tabs to update
                this.notifyPropertyChange("imageList");
            }
        },
        /**
         *    Adds a reference to an image that it stored within
         *    the controller.
         *    @param (image_name) The filename of a stored image.
         *    @param (img_src) The base64 src of the stored image.
         */
        addImageRef: function (image_name, img_src) {
            // store the image if it is not already stored in the app
            this.send("addImage", image_name, img_src);

            // add a new reference to an image
            var image = this.get('images')[image_name];
            image.ref_count += 1;
        },
        /**
         *    Removes a reference to an image stored within the
         *    controller. If the reference count reaches zero then
         *    the image will be removed from the stored images, and
         *    its respective image tab will be removed as well.
         *    @param (image_name) The filename of the image which
         *        the deleted image snippet came from.
         */
        removeImageRef: function (image_name) {
            // remove a reference to an image
            var image = this.get('images')[image_name];
            image.ref_count -= 1;
            if (image.ref_count == 0) {
                // no more image snippets are referencing this
                // image, it can be deleted from the controller
                delete this.get('images')[image_name];
                // notify the image tabs to update
                this.notifyPropertyChange("imageList");
            }
        },
        /**
         *    Adds the currently selected image region into the currently
         *    selected page.
         */
        addSelection: function () {
            var ias = this.get('imgSelect');
            var reg = ias.getSelection();
            // check that a region is currently selected,
            // if not then don't do anything
            if (reg.width == 0 || reg.height == 0) {
                return;
            }

            // extract metadata about the selected image region
            var img_src = $("#loaded_image").attr('src');
            var image = {
                img_src: img_src,
                img_height: reg.height,
                img_width: reg.width,
                top_pos: -reg.y1,
                left_pos: -reg.x1
            };
            var $img_container = crop_image(image);

            // add the selected image region
            // to the selected page
            var controller = this;
            html2canvas($img_container, {
                logging: true,
                onrendered: function (canvas) {
                    var cropped_img_src = canvas.toDataURL("image/jpeg");
                    var img_basename = $("#loaded_image").data('filename').split(".")[0];
                    var cropped_image
                        = {
                        img_name: img_basename,
                        img_src: cropped_img_src,
                        img_height: reg.height,
                        img_width: reg.width,
                        orig_height: reg.height,
                        orig_width: reg.width,
                        img_top: -reg.y1,
                        img_left: -reg.x1,
                        div_top: 0,
                        div_left: 0
                    };
                    var $new_img_div = image_to_field(cropped_image);
                    // update the image references
                    controller.send("addImageRef", img_basename, $("#loaded_image").attr("src"));
                    $("#processed_images").children().remove();
                }
            });
        },
        /**
         *    Deletes the currently selected field, adds it to a buffer
         *    of deleted fields.
         */
        deleteField: function () {
            var $curr_field = $(".selected_field");
            if ($curr_field.length != 0) {
                // Deleted fields are stored in an 'undo' JSON object.
                // An 'undo' object stores a reference to the field
                // that was deleted as well as a list of references
                // to any images that the field contained.
                var undo = {$deleted_field: null, img_ref_list: []};
                undo.$deleted_field = $curr_field;
                undo.$page = $(".selected_page");

                // get fields which contain images
                var img_field_list = [];
                if ($curr_field.hasClass("img_div")) {
                    img_field_list.push($curr_field);
                } else if ($curr_field.children(".img_div").length != 0) {
                    img_field_list.push($curr_field.children(".img_div"));
                }

                // store references to all deleted images snippets
                for (var i = 0; i < img_field_list.length; i++) {
                    var image_name = img_field_list[i].data("img_name");
                    var img_src = this.get("images")[image_name].data;
                    undo.img_ref_list.push({
                        img_name: image_name,
                        img_src: img_src
                    });

                    // decrement the image reference count for
                    // the image which this image snippet was from
                    this.send("removeImageRef", image_name);
                }

                var deletedFields = this.get("deletedFields");
                deletedFields.push(undo);
                // remove the field from the current page
                // but don't delete the event handlers and data
                // associated with it
                $curr_field.detach();

                // only store up to 8 fields at a time
                if (deletedFields.length > 8) {
                    var undo = deletedFields.shift();
                    undo.$deleted_field.remove();
                }

                // update view in the field properties sidebar
                ODKScan.FieldContainer.popObject();
                ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            }
        },
        /**
         *    Restores the last deleted field.
         */
        undoDeleteField: function () {
            var deletedFields = this.get("deletedFields");
            if (deletedFields.length > 0) {
                var undo = deletedFields.pop();

                // restore the image reference count
                for (var i = 0; i < undo.img_ref_list.length; i++) {
                    var img_ref = undo.img_ref_list[i];
                    this.send("addImageRef", img_ref.img_name, img_ref.img_src);
                }

                $(".selected_field").removeClass("selected_field");
                // restore the deleted field to its respective page
                undo.$page.append(undo.$deleted_field);
            }
        },
        /**
         *    Triggers the FieldViewController (which EmptyBoxView extends)
         *    to open the dialog for creating a new box. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createBox: function () {
            this.set('newFieldType', 'string');  // before it was empty_box
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.EmptyBoxContainer.pushObject(ODKScan.EmptyBoxView);
            $(".selected_field").removeClass("selected_field");

        },
        /**
         *    Triggers the FieldViewController (which QrCodeView extends)
         *    to open the dialog for creating new qr code boxes. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createCode: function () {
            this.set('newFieldType', 'qr_code');  // before it was empty_box
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.QrCodeContainer.pushObject(ODKScan.QrCodeView);
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Triggers the FieldViewController (which CheckboxView extends)
         *    to open the dialog for creating new checkboxes. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createCheckbox: function () {
            this.set('newFieldType', 'checkbox');
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.CheckboxContainer.pushObject(ODKScan.CheckboxView);
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Triggers the FieldViewController (which BubblesView extends)
         *    to open the dialog for creating new fill-in bubbles. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createBubbles: function () {
            this.set('newFieldType', 'bubble');
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.BubbleContainer.pushObject(ODKScan.BubblesView);
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Triggers the FieldViewController (which SegNumView extends)
         *    to open the dialog for creating new segmented numbers. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createNumbers: function () {
            this.set('newFieldType', 'seg_num');
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.SegNumContainer.pushObject(ODKScan.SegNumView);
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Triggers the FieldViewController (which TextBoxView extends)
         *    to open the dialog for creating new texboxes. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createText: function () {
            this.set('newFieldType', 'text_box');
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.TextBoxContainer.pushObject(ODKScan.TextBoxView);
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Triggers the FieldViewController (which FormNumView extends)
         *    to open the dialog for creating new formatted numbers. The dialog is not
         *    opened directly here because its content is being added to
         *    dialog page and therefore has not loaded yet.
         */
        createFormattedNumber: function () {
            this.set('newFieldType', 'form_num');
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            ODKScan.FormNumContainer.pushObject(ODKScan.FormNumView);
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Updates the currently selected field to use the properties
         *    that the user has specified in the properties sidebar.
         */
        updateField: function () {
            if ($(".selected_field").length == 0) {
                return;
            }

            if (is_name_valid()) {
                var field_name = $("#field_name").val();
                var $orig_field = $(".selected_field");
                var $field_parent = $orig_field.parent();

                // remove selected field from group, update field,
                // create new group for it
                if ($field_parent.hasClass("field_group")) {
                    var $field_group = $field_parent.data("obj");

                    // store positions of group and selected field
                    var orig_left = parseFloat($orig_field.css("left"));
                    var orig_top = parseFloat($orig_field.css("top"));
                    var group_left = parseFloat($field_parent.css("left"));
                    var group_top = parseFloat($field_parent.css("top"));

                    // remove the selected field from the group, otherwise
                    // it will be added twice to the new group
                    $field_group.removeSelected();
                    var $grouped_fields = $field_group.ungroupFields();

                    // create a new updated field, delete the old one
                    $(".selected_field").data("obj").updateProperties();
                    $orig_field.remove();


                    // add the selected field back to the group
                    $grouped_fields = $grouped_fields.add($(".selected_field")[0]);
                    // offset the field position of the selected field
                    $(".selected_field").css("left", rem(orig_left + group_left));
                    $(".selected_field").css("top", rem(orig_top + group_top));

                    // create a new group
                    var $new_group = new FieldGroup($grouped_fields);
                } else {
                    $(".selected_field").data("obj").updateProperties();
                    $orig_field.remove();
                }
            }
        },
        /**
         *    Copies the currently selected image/field.
         */
        copySelected: function () {
            //var copyNo = 1;
            // if there is not a selected field then do nothing
            if ($(".selected_field").length == 0) {
                return;
            }

            if (!$(".selected_field").hasClass("img_div")) {
                var selected_field = $(".selected_field").data('obj');
                selected_field.copyField();
                var $new_field = $(".selected_field");
                if ($new_field.hasClass('field_group')) {
                    $new_field.removeClass('original'); //Remove the original class from new field.
                } else {
                    var name = $new_field.data('obj').name;  // get the name of the field
                    $new_field.data('obj').name = this._actions.getCopyName(name);
                }
                // load properties of the new field into
                // the properties sidebar
                $new_field.click();
            } else {
                var $img_div = $(".selected_field");
                var $img = $img_div.children("img");

                var image = {
                    img_name: $(".selected_field").data("img_name"),
                    img_src: $img.attr('src'),
                    img_height: $img_div.height(),
                    img_width: $img_div.width(),
                    orig_height: $img.data('orig_height'),
                    orig_width: $img.data('orig_width'),
                    img_top: $img.data('top'),
                    img_left: $img.data('left'),
                    div_top: rem(0),
                    div_left: rem(0)
                };
                var $new_img_div = image_to_field(image);

                // update the image references
                this.send("addImageRef", image.img_name);
            }
        },
        /*
        params:
        name: name to find the similar name list
        return:
        returns a list of name that is similar as given name
        */

        filterFields: function (name) {
            var all_fields = $(".field");
            var all_names = [];
            for (var j = 0; j < all_fields.length; j++) {
                var $curr_field = $(all_fields[j]);
                var fieldObj = $curr_field.data("obj");
                all_names.push(fieldObj.name);
            }
            var name_list = [];

            var numbers = name.match("[0-9]+");
            var index;
            var sub_name;
            if (numbers != null) {
                //console.log(numbers);
                index = name.indexOf(numbers[0]);
                sub_name = name.substring(0, index);
            } else {
                sub_name = name;
            }

            for (var j = 0; j < all_names.length; j++) {
                var number = all_names[j].match("[0-9]+");
                var ind;
                var sub_match_name;
                if (number != null) {
                    ind = all_names[j].indexOf(number[0]);
                    sub_match_name = all_names[j].substring(0, ind);
                } else {
                    sub_match_name = all_names[j];
                }

                if (sub_name == sub_match_name) {
                    name_list.push(all_names[j]);
                    console.log("names " + j + " " + all_names[j]);
                }
            }
            return name_list;
        },
        /*
        returns a name with a number at the end which
        params: a name to format
        */
        getCopyName: function (name) {
            var lists = ODKScan.runGlobal('filterFields')(name);
            var max = 0;
            var numbering;
            var indexing;
            var copyNos; // parsing the number
            for (var i = 0; i < lists.length; i++) {
                numbering = lists[i].match("[0-9]+");
                if (numbering != null) {
                    indexing = lists[i].indexOf(numbering[0]);
                    copyNos = parseInt(numbering[0]); // parsing the number
                    console.log("copyNO " + copyNos);
                } else {
                    copyNos = 0;
                }
                if (copyNos > max) {
                    max = copyNos;
                }
            }
            max = max + 1;

            if (name.match("[0-9]+") == null) {
                return name.substring(0, name.length) + "" + max;
            } else {
                var numbers = name.match("[0-9]+");
                var index = name.indexOf(numbers[0]);
                return name.substring(0, index) + "" + max;
            }

        },

        /**
         *    Moves the currently selected field backward.
         */
        sendBackward: function () {
            var $selected_field = $(".selected_field");

            // field must be selected
            if ($selected_field.length == 0) {
                return;
            }

            // field must not be at the bottom layer
            if ($selected_field.zIndex() != globZIndex.getBottomZ()) {
                var selected_zIndex = $selected_field.zIndex();

                // elevate all fields directly below the current one
                $(".selected_page .field, .selected_page .img_div").each(function () {
                    if ($(this).zIndex() == selected_zIndex - 1) {
                        $(this).zIndex(selected_zIndex);
                    }
                });

                // decrease current field's zIndex
                $selected_field.zIndex(selected_zIndex - 1);
            }
        },
        /**
         *    Moves the currently selected field to the bottom-most
         *    layer of the page.
         */
        sendToBack: function () {
            var $selected_field = $(".selected_field");

            // field must be selected
            if ($selected_field.length == 0) {
                return;
            }

            // field must not be at the bottom layer
            if ($selected_field.zIndex() != globZIndex.getBottomZ()) {
                var selected_zIndex = $selected_field.zIndex();
                // elevate all fields below the selected field
                $(".selected_page .field, .selected_page .img_div").each(function () {
                    if ($(this).zIndex() < selected_zIndex) {
                        $(this).zIndex($(this).zIndex() + 1);
                    }
                });

                $selected_field.zIndex(globZIndex.getBottomZ());
            }
        },
        /**
         *    Moves the currently selected field forward.
         */
        sendForward: function () {
            var $selected_field = $(".selected_field");

            // field must be selected
            if ($selected_field.length == 0) {
                return;
            }

            // field must not be at the top layer
            if ($selected_field.zIndex() != globZIndex.getTopZ()) {
                var selected_zIndex = $selected_field.zIndex();

                // lower all fields directly above the current one
                $(".selected_page .field, .selected_page .img_div").each(function () {
                    if ($(this).zIndex() == selected_zIndex + 1) {
                        $(this).zIndex(selected_zIndex);
                    }
                });

                // increase current field's zIndex
                $selected_field.zIndex(selected_zIndex + 1);
            }
        },
        /**
         *    Moves the currently selected field to the top-most
         *    layer of the page.
         */
        sendToFront: function () {
            var $selected_field = $(".selected_field");

            // field must be selected
            if ($selected_field.length == 0) {
                return;
            }

            // field must not be at the top layer
            if ($selected_field.zIndex() != globZIndex.getTopZ()) {
                var selected_zIndex = $selected_field.zIndex();
                // lower all fields above the selected field
                $(".selected_page .field, .selected_page .img_div").each(function () {
                    if ($(this).zIndex() > selected_zIndex) {
                        $(this).zIndex($(this).zIndex() - 1);
                    }
                });

                // elevate the selected field to the front
                $selected_field.zIndex(globZIndex.getTopZ());
            }
        },
        /**
         *    Aligns all fields in the current page with the
         *    left-most field.
         */
        alignFieldLeft: function () {
            // get the left most field position
            var $fields = $(".selected_page .group_field");
            var min_left = FieldGroup.minLeft($fields);

            // set new left position for all fields
            $fields.css("left", rem(min_left));
        },
        /**
         *    Aligns all fields in the current page with the
         *    horizontal center of the page.
         */
        alignFieldCenter: function () {
            // compute page's horizontal center point
            var center_val = parseFloat($(".selected_page").css("width")) / 2;

            // set new left position for all fields
            $(".selected_page .group_field").each(function () {
                var curr_width = parseFloat($(this).css('width'));
                $(this).css('left', rem(center_val - (curr_width / 2)));
            });
        },
        /**
         *    Aligns all fields in the current page with the
         *    right-most field.
         */
        alignFieldRight: function () {
            // get the left most field position
            var $fields = $(".selected_page .group_field");
            var max_right = FieldGroup.maxRight($fields);

            // set new left position for all fields
            $fields.each(function () {
                var curr_width = parseFloat($(this).css('width'));
                $(this).css('left', rem(max_right - curr_width));
            });
        },
        /**
         *    Aligns all fields in the current page with the
         *    top-most field.
         */
        alignFieldTop: function () {
            // get the top most field position
            var $fields = $(".selected_page .group_field");
            var min_top = FieldGroup.minTop($fields);

            // set new top position for all fields
            $fields.css("top", rem(min_top));
        },
        /**
         *    Aligns all fields in the current page with the
         *    vertical center of the page.
         */
        alignFieldMiddle: function () {
            // compute page's vertical center point
            var center_val = parseFloat($(".selected_page").css("height")) / 2;

            // set new left position for all fields
            $(".selected_page .group_field").each(function () {
                var curr_height = parseFloat($(this).css('height'));
                $(this).css('top', rem(center_val - (curr_height / 2)));
            });
        },
        /**
         *    Aligns all fields in the current page with the
         *    bottom-most field.
         */
        alignFieldBottom: function () {
            // get the bottom most field position
            var $fields = $(".selected_page .group_field");
            var max_bottom = FieldGroup.maxBottom($fields);

            // set new left position for all fields
            $fields.each(function () {
                var curr_height = parseFloat($(this).css('height'));
                $(this).css('top', rem(max_bottom - curr_height));
            });
        },
        /**
         *    Groups together the currently selected fields.
         */
        groupFields: function () {
            $("#subform_dialog").dialog("open");
            var fGroup = new FieldGroup($(".selected_page .group_field"));
        },
        /**
         *    Ungroups the fields within the selected field group.
         */
        ungroupFields: function () {
            var $field = $(".selected_field");
            if ($field.hasClass("field_group")) {
                $field.data("obj").ungroupFields();
            }
        },
        /**
         *    Cancles the cancel the subform dialog.
         */
        cancelSubform: function () {
            $("#subform_dialog").dialog("close");

        },
        /**
         *    opens a new dialog to get the subform name
         */
        makeSubform: function () {
            $("#subname_dialog").dialog("open");
            $("#subform_dialog").dialog("close");
        },
        /**
         *    Cancles the sub form name dialog.
         */

        saveSubFormName: function () {
            $("#subname_dialog").dialog("close");
            var group = $('.selected_page .field_group').last();
            var sub_form = $("#sub_form_name").val() || "subform"
            group.data('name', sub_form);
            group.addClass('original');

        },
        /**
         *    Opens up the new page dialog if there are no fields
         *    within the document, otherwise it first prompts
         *    the user to save their work.
         */
        openNewDocDialog: function () {
            var $all_pages = $(".scan_page");
            if ($all_pages.children(".field").length == 0
                && $all_pages.children(".img_div").length == 0) {
                $("#new_doc_dialog").dialog("open");
            } else {
                $("#save_check_dialog").dialog("open");
            }
        },
        /**
         *    Creates a new document with a single page.
         */
        createNewDoc: function () {
            // delete all current pages, fields
            this.send("deleteAllPages");

            // create a single page
            this.set("pageStyle", $("#doc_size").val());
            this.send("newPage", this.get("pageStyle"));

            $("#new_doc_dialog").dialog("close");
        },
        /**
         *    Close the new document dialog.
         */
        closeNewDocDialog: function () {
            $("#new_doc_dialog").dialog("close");
        },
        /**
         *    Closes the save check dialog and then
         *    opens up new document dialog.
         */
        saveCheckDialogNoSave: function () {
            $("#save_check_dialog").dialog("close");
            $("#new_doc_dialog").dialog("open");
        },
        /**
         *    Close the save check dialog, saves the document,
         *    and then opens up the new page dialog.
         */
        saveCheckDialogSave: function () {
            $("#save_check_dialog").dialog("close");
            // the anonymous function runs after the document
            // has been saved, it opens up the new document dialog
            this.send("saveDoc", function () {
                $("#new_doc_dialog").dialog("open");
            });
        },
        /**
         *    Close the save check dialog.
         */
        saveCheckDialogCancel: function () {
            $("#save_check_dialog").dialog("close");
        },
        /**
         *    Creates a single new page.
         *    page_size is an optional parameter that specifies
         *    the format of the new page.
         *
         *    load_from_zip is a boolean that is used to determine
         *    if default images should be added to the new page.
         */
        newPage: function (page_size, load_from_zip) {
            // cancel any currently selected image region
            var ias = this.get('imgSelect');
            ias.cancelSelection();

            // create new page div
            $(".selected_page").removeClass("selected_page");
            var $new_page = $("<div/>");
            $new_page.addClass("scan_page selected_page");

            // set page style
            if (page_size) { // check if passed a page size argument
                $new_page.addClass(page_size);
            } else {
                // use the current page size
                $new_page.addClass(this.get("pageStyle"));
            }

            $("#page_container").append($new_page);
            globZIndex.registerPage();

            var currSelectedPageTab = this.get("selectedPageTab");
            if (currSelectedPageTab != null) {
                // deselect current page tab
                Ember.set(currSelectedPageTab, "isActive", false);
            }

            // create new page tab
            var new_page_num = this.get('numPages');
            this.set('numPages', new_page_num + 1);
            var new_page_tab = {pageNum: new_page_num, isActive: true, pageDiv: $new_page};

            // store the new page tab in the controller
            this.set("selectedPageTab", new_page_tab);
            var page_arr = this.get('pages');
            page_arr.pushObject(new_page_tab);

            if (!load_from_zip) {
                // add default images
                this.send("addDefaultImages");
            }
        },
        /**
         *    Opens up the remove page dialog.
         */
        openRemovePageDialog: function () {
            $("#remove_page_dialog").dialog("open");
        },
        /**
         *    Cancels the remove page dialog.
         */
        cancelPageRemove: function () {
            $("#remove_page_dialog").dialog("close");
        },
        /**
         *    Removes the currently selected page.
         */
        removePage: function () {
            // cancel any currently selected image region
            var ias = this.get('imgSelect');
            ias.cancelSelection();

            // remove all image references from the deleted page
            var controller = this;
            $(".selected_page .img_div").each(function () {
                controller.send("removeImageRef", $(this).data("img_name"));
            });

            var page_arr = this.get('pages');
            var selected_page = this.get("selectedPageTab");
            var selected_page_num = selected_page.pageNum;
            selected_page.pageDiv.remove();
            page_arr.removeObject(selected_page);

            // renumber existing pages
            page_arr.forEach(function (page) {
                if (page.pageNum > selected_page_num) {
                    Ember.set(page, "pageNum", page.pageNum - 1);
                }
            });

            // decrement page count
            this.set("numPages", this.get("numPages") - 1);

            if (page_arr.length > 0) {
                // set the first page to be the selected page
                // after a page removal
                this.send('selectPageTab', page_arr[0]);
            }

            $("#remove_page_dialog").dialog("close");
        },
        /**
         *    Responds the user selecting a page tab, loads the
         *    corresponding page.
         */
        selectPageTab: function (page) {
            // cancel any currently selected image region
            var ias = this.get('imgSelect');
            ias.cancelSelection();

            // deselect current page tab
            Ember.set(this.get('selectedPageTab'), 'isActive', false);

            // select new page tab
            Ember.set(page, 'isActive', true);
            this.set('selectedPageTab', page);

            $(".selected_page").removeClass("selected_page");
            page.pageDiv.addClass("selected_page");
            // reset the view in the properties sidebar
            ODKScan.FieldContainer.popObject();
            ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
            // unselect any selected field
            $(".selected_field").removeClass("selected_field");
        },
        /**
         *    Opens up the document load dialog.
         */
        openLoadDialog: function () {
            // reset any previously uploaded file
            $("#uploaded_zip").val("");
            $("#load_dialog").dialog("open");
        },
        /**
         *    Cancels the document load dialog.
         */
        cancelLoad: function () {
            $("#load_dialog").dialog("close");
        },
        /**
         *    Cancels the document export dialog.
         */
        cancelExport: function () {
            $("#export_dialog").dialog("close");
        },
        /**
         *    Cancels the document save dialog.
         */
        cancelSaveToFileSystem: function () {
            $("#saveToFileSystem_dialog").dialog("close");
        },
        /**
         *    Loads images for a particular page into the document from
         *    a zip file.
         *    @param (images) A list of JSON objects containing image metadata.
         *    @param (curr_index) The index within the the list of images.
         *    @param (curr_directory) String containing the path to the current
         *        directory in the zip file.
         *    @param (zip) The zip file containing the document being loaded.
         */
        loadImages: function (images, curr_index, curr_directory, zip) {
            // loads all image snippets into the current page
            if (curr_index == images.length) {
                // base case
                // remove all temporary image snippets that were
                // loaded into the DOM, load the next page
                $("#processed_images").children().remove();
                this.send("loadPage", curr_directory + "nextPage/", zip);
            } else {
                // recursive case, load next image for the page
                var img_json = images[curr_index];

                // load the image source
                var that = this;
                zip.file("images/" + img_json.img_name).async("base64").then(function (img_data) {
                    //console.log(img_data);

                    var img_src = "data:image/jpeg;base64," + img_data;
                    // console.log(img_src);
                    var image = {
                        img_src: img_src,
                        img_height: img_json.orig_height,
                        img_width: img_json.orig_width,
                        top_pos: img_json.img_top,
                        left_pos: img_json.img_left
                    };


                    // check if the current zIndex should be updated
                    if (img_json.zIndex > globZIndex.getTopZ()) {
                        globZIndex.setZ(img_json.zIndex + 1);
                    }

                    // load the image into the dom
                    var $img_container = crop_image(image);
                    //console.log($img_container);
                    var controller = that;
                    html2canvas($img_container, {
                        logging: true,
                        onrendered: function (canvas) {
                            var cropped_img_src = canvas.toDataURL("image/jpeg");
                            var cropped_image = {
                                img_name: img_json.img_name,
                                img_src: cropped_img_src,
                                img_height: img_json.height,
                                img_width: img_json.width,
                                orig_height: img_json.orig_height,
                                orig_width: img_json.orig_width,
                                img_top: img_json.img_top,
                                img_left: img_json.img_left,
                                div_top: img_json.div_top,
                                div_left: img_json.div_left
                            };
                            var $new_img_div = image_to_field(cropped_image, img_json.zIndex);
                            //console.log(cropped_image);
                            // store a reference to the image that was loaded
                            controller.send("addImageRef", img_json.img_name, img_src);
                            controller.send("loadImages", images, curr_index + 1, curr_directory, zip);
                        }

                    });
                })

            }
        },
        /**
         *    Loads the next page from the zip file into the document.
         *    @param (curr_directory) String containing the path to the current
         *        directory in the zip file.
         *    @param (zip) The zip file containing the document being loaded.
         */
        loadPage: function (curr_directory, zip) {
            // loads the next page in the zip file
            if (zip.folder(new RegExp(curr_directory)).length == 0) {
                // base case, there's no additional nextPage subdirectories

                // load the image tabs
                var that = this;
                var imageList = [];
                var itab_files = zip.folder("image_tabs").file(new RegExp(".*"));
                for (var i = 0; i < itab_files.length; i++) {
                    var file = itab_files[i];
                    file.async("string").then(function (fileJson) {
                        var itab_json = JSON.parse(fileJson);
                        imageList.push(itab_json);

                        that.set("imageList", imageList);
                    })
                }

                // unselect the current image tab
                var currSelectedImageTab = that.get("selectedImageTab");
                if (currSelectedImageTab != null) {
                    Ember.set(currSelectedImageTab, "isActive", false);
                }

            } else {
                // recursive case, load the next page
                //var json_file = new RegExp(curr_directory + "page.json");
                var json_file = "page.json";

                var that = this;
                zip.file(json_file).async("string").then(function (content) {
                    var page_json = JSON.parse(content);
                    // create a new page
                    that.send("newPage", page_json.doc_info.page_size, true);

                    // maps groups to sets of fields that they contain
                    var field_groups = {};

                    // add all of the fields to the page
                    var fields = page_json.fields;
                    for (var i = 0; i < fields.length; i++) {
                        var f_json = fields[i];

                        // check if the current zIndex should be updated
                        if (f_json.zIndex > globZIndex.getTopZ()) {
                            globZIndex.setZ((f_json.zIndex + 1));
                        }

                        if (f_json.field_type == 'checkbox') {
                            var cb_field = new CheckboxField(f_json);
                            cb_field.constructGrid();
                        } else if (f_json.field_type == 'bubble') {
                            var bubb_field = new BubbleField(f_json);
                            bubb_field.constructGrid();
                        } else if (f_json.field_type == 'int') {
                            var seg_num_field = new SegNumField(f_json);
                            seg_num_field.constructGrid();
                        } else if (f_json.field_type == 'string') {  // before it was empty_box
                            var empty_box = new EmptyBox(f_json);
                            empty_box.constructBox();

                        } else if (f_json.field_type == 'qr_code') {
                            var qr_code = new QrCode(f_json);
                            qr_code.constructBox();
                        } else if (f_json.field_type == 'text_box') {
                            var text_box = new TextBox(f_json);
                            text_box.constructBox();
                        } else if (f_json.field_type == 'form_num') {
                            var form_num_field = new FormNumField(f_json);
                            form_num_field.constructGrid();
                        } else {
                            console.log("unsupported field");
                        }

                        // check if field should be added to a group
                        //=======================================================================================
                        // Note that group id is arbitrary. The id read from JSON is only used
                        // locally and will be replaced in the FieldGroup constructor.
                        if (f_json.group_id != null) {
                            // check if a new field list should be created
                            if (field_groups[f_json.group_id] == null) {
                                field_groups[f_json.group_id] = [];
                            }

                            field_groups[f_json.group_id].push($(".selected_field")[0]);
                        }
                        //======================================================================================
                    }

                    //Check For Subform
                    if (page_json.sub_forms) { // groups in this json are subforms
                        $("#sub_form_name").val(page_json.sub_forms[0].name);
                    }

                    // The convention is for the first subform listed to be the template to base
                    // all the other subforms on, particularly relating to field names.
                    // NOTE: This should be improved as a hard fast rule instead of a convention
                    var originalSet = false;

                    // create all of the groups
                    for (var id in field_groups) {
                        if (field_groups.hasOwnProperty(id)) {
                            var position = page_json.group_positions[id];
                            var field_group = new FieldGroup($(field_groups[id]),
                                position.top,
                                position.left);
                            if (!originalSet) {
                                field_group.$group_div.addClass('original');
                                originalSet = true;
                            }
                        }
                    }

                    // unhighlight groups and other fields which were just added
                    // to the page
                    $(".highlighted_group").addClass("unhighlighted_group");
                    $(".highlighted_group").removeClass("highlighted_group");
                    $(".selected_field").removeClass("selected_field");

                    // load all of the images for the current page
                    that.send("loadImages", page_json.images, 0, curr_directory, zip);
                })

            }
        },
        /**
         *    Loads user's zip file into the browser, attaches
         *    the zip file content to the uploaded_zip div.
         */
        zipFileUploaded: function () {
            // NOTE: 'event' argument is not listed as a parameter
            // but it is still possible to be accessed from within
            // this function, I am not sure how this is actually
            // possible.
            var selectedFile = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function (event) {
                $("#uploaded_zip").data("zip", event.target.result);
            };
            reader.readAsDataURL(selectedFile);
        },
        /**
         *    Loads the document from a zip file.
         */
        loadZip: function () {
            // delete all current pages, fields
            this.send("deleteAllPages");

            if (!$("#uploaded_zip").data("zip")) {
                alert("Please choose a zip file to load.");
            } else {
                // unzip the zipped file
                var zip = new JSZip();

                /* 	Need to extract the base64 from the zip file string.
                    the string is in the form: "data:application/x-zip-compressed;base64,..."
                    Where '...' is the actual base64.
                */
                var that = this;
                var uploadData = $("#uploaded_zip").data("zip").split(",")[1];
                zip.loadAsync(uploadData, {base64: true}).then(function (content) {
                    // begin loading pages starting from the root directory
                    // of the loaded zip file
                    that.send("loadPage", "", content);
                    $("#load_dialog").dialog("close");
                });
            }


        },
        /**
         *    Saves the document to a zip file.
         *    @param (func_callback) Optional callback executed after the
         *    user closes the save dialog.
         */
        saveDoc: function (func_callback) {
            var zip = new JSZip();
            var pages = this.get('pages');

            var curr_directory = "";
            for (var i = 0; i < pages.length; i++) {
                // make page visible, set Scan doc properties
                this.send('selectPageTab', pages[i]);
                var $page_div = Ember.get(pages[i], 'pageDiv');
                var savedDoc = {};
                savedDoc.doc_info = {};
                savedDoc.images = [];
                savedDoc.fields = [];

                // 'selected_page' class designation should not be
                // stored in the JSON output
                $page_div.removeClass("selected_page");

                // save metadata about the page
                savedDoc.doc_info.page_size = $page_div.attr("class");

                var save_image = function () {
                    var img_div = {};
                    img_div.height = $(this).height();
                    img_div.width = $(this).width();
                    img_div.div_top = $(this).css('top');
                    img_div.div_left = $(this).css('left');
                    // NOTE: img position, original size stored in the img's data field
                    img_div.img_top = $(this).children("img").data('top');
                    img_div.img_left = $(this).children("img").data('left');
                    img_div.orig_height = $(this).children("img").data('orig_height');
                    img_div.orig_width = $(this).children("img").data('orig_width');
                    img_div.img_name = $(this).data('img_name');
                    img_div.zIndex = $(this).zIndex(); // just added negative sign
                    savedDoc.images.push(img_div);
                }

                // save metadata about all images
                $page_div.children(".img_div").each(save_image);
                $page_div.children(".field_group").children(".img_div").each(save_image);

                // create a new JSON object for each field
                $page_div.children(".field").each(function () {
                    var json = $(this).data("obj").saveJSON();
                    savedDoc.fields.push(json);
                });

                // store JSON for all grouped fields

                $page_div.children(".field_group").children(".field").each(function () {
                    var json = $(this).data("obj").saveJSON();
                    console.log($(this).parent());
                    json.group_id = $(this).parent().data("id");
                    savedDoc.fields.push(json);
                });

                // add group locations to the JSON output
                var count = 0;
                savedDoc.group_positions = {}
                $(".field_group").each(function () {
                    var top_pos = $(this).css("top");
                    var left_pos = $(this).css("left");
                    savedDoc.group_positions[$(this).data("id")] = {top: top_pos, left: left_pos};
                    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                    // TODO: NEED TO LOOK AT THIS LATER
                    // Trying to add the zIndex for big box in the json

                    //just added the zindex information
                    //var zindex = $(".field_group").zIndex();
                    //console.log("zindex is in controller ", zindex);
                    //savedDoc.group_positions["zIndex"]= {zIndex: zindex};
                    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                });

                //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                var groups = $page_div.children('.field_group');
                var subform_name = $("#sub_form_name").val();
                if (subform_name && groups.length > 0) { // if there is a subform
                    var sub_form = {
                        name: subform_name,
                        groups: [],
                        fields: {}
                    }

                    var original = $page_div.find('.field_group.original');
                    var original_fields = []; // store the order of original names
                    var controller = this;
                    // set sub_form.fields to orginial fields
                    original.find('.field').each(function (i, field) {
                        var data = $(field).data('obj');
                        if (data.field_type != 'text_box') {
                            sub_form.fields[data.name] = controller._actions.toODKType(data.type);
                        }
                        original_fields.push(data);
                    });

                    // preparing group field of the subform  for json
                    groups.each(function (g, group) {
                        var group_map = {};
                        $(group).children('.field').each(function (i, field) {
                            var data = $(field).data('obj');
                            // checking data.field_type !=  text_box because at this index we did not push
                            // anything as we dont want to output text on the json
                            if (data.field_type != "text_box") {
                                group_map[original_fields[i].name] = data.name;
                            }
                        });
                        sub_form.groups.push(group_map);
                    });

                    savedDoc.sub_forms = [sub_form];
                }
                //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


                var json_output = JSON.stringify(savedDoc, null, '\t');
                zip.file(curr_directory + "page.json", json_output);
                curr_directory += "nextPage/";
            }

            // add all images to the top-level images/ directory
            var images = this.get("images");
            for (image_name in images) {
                var img_info = images[image_name];
                if (img_info.ref_count > 0) {
                    var img_base64 = img_info.data.split(",")[1];
                    zip.file("images/" + image_name, img_base64, {base64: true});
                }
            }

            // save all image tabs, add them to top-level image_tabs/ directory
            var itab_folder = zip.folder("image_tabs");
            var image_tabs = this.get("imageList");
            for (var i = 0; i < image_tabs.length; i++) {
                var tab = image_tabs[i];
                tab.isActive = false; // make sure no tab is selected
                itab_folder.file(tab.name, JSON.stringify(tab));
            }

            // reset the current page tab to the first page
            this.send("selectPageTab", pages[0]);

            zip.generateAsync({type: "base64"}).then(function (zip_contents) {
                var scan_doc_zip = "data:application/zip;base64," + zip_contents;
                $("#scan_json_link").attr('href', scan_doc_zip);

                // perform optional callback after user exits the save dialog
                if (func_callback) {
                    $("#save_dialog").on("dialogclose", function () {
                        func_callback();

                        // remove this binded function
                        $("#save_dialog").off("dialogclose");
                    });
                }

                $("#save_dialog").dialog("open");
            });

        },


        /**
         *    Exports the document to a zip file (in a format that can be
         *    processed by the ODK Scan Android app).
         */
        exportZIPinit: function () {
            //$("#export_progress_dialog").dialog("open");
            $("#export_dialog").dialog("open");
            // unselect any selected field (don't want it to be highlighted in the image output)
            $(".selected_field").removeClass("selected_field");
            // remove all highlighting
            $(".unhighlighted_group").removeClass("unhighlighted_group");
            $(".highlighted_group").removeClass("highlighted_group");
            $(".group_field").removeClass("group_field");
        },

        /**
         *   Save to file system
         *
         */
        saveToFileSystemInit: function () {
            console.log("saveToFileSystemInit: called");
            $("#saveToFileSystem_dialog").dialog("open");
            // unselect any selected field (don't want it to be highlighted in the image output)
            $(".selected_field").removeClass("selected_field");
            // remove all highlighting
            $(".unhighlighted_group").removeClass("unhighlighted_group");
            $(".highlighted_group").removeClass("highlighted_group");
            $(".group_field").removeClass("group_field");
        },

        /**
         *    Instantiate and zip file and send it to the createExportZipFolder function
         *   to prepare all the documents to be in it and then export that zip file
         *   in a format that can be processed by the ODK Scan Android App.
         */
        exportZIP: function () {
            //instantiates a zip file
            var zip = new JSZip();

            var formName = $('#zip_name').val();
            var subformName = $("#sub_form_name").val();

            // calling createExportZipFolder to make all the documents such
            // such as template.json, user_given_name_main.xlsx and the image of
            // the form
            this.send('createExportZipFolder', this.get('pages'), 0, "", zip, formName, subformName);
        },

        /**
         *    Post the files to be saved to the system
         *   call postToFileSystem to post all necessary file to the file system
         */
        saveToFileSystem: function () {
            console.log("saveToFileSystem: called");

            var formName = $('#file_name').val();
            var subformName = $("#sub_form_name").val();

            // calling postToFileSystem to make all the documents such
            // such as template.json, user_given_name_main.xlsx and the image of
            // the form
            this.send('postToFileSystem', this.get('pages'), 0, "", formName, subformName);
        },

        /**
         *   Post the files to the file system
         */
        postToFileSystem: function (pages, curr_index, curr_directory, formName, subformName, xlsx_fields) {
            // Case for writing out formDef.json and
            // base case
            // Calling createXLSX to make xlsx file
            if (curr_index == pages.length) {
                var xlFile = this._actions.createXLSX(xlsx_fields, formName, subformName);
                var formDefJson = this._actions.createFormDefJSON(xlsx_fields, formName, subformName);
                var formDefString = JSON.stringify(formDefJson, 2, 2);

                // Create the definition.csv and properties.csv files from the formDef file
                var dtm = formDefJson.specification.dataTableModel;
                var defCsv = devUtil.createDefinitionCsvFromDataTableModel(dtm);
                var propCsv = devUtil.createPropertiesCsvFromDataTableModel(dtm, formDefJson);

                // get the user given name. if user does not provide with any name, append "default" to
                var name = formName || "download";
                var formId = "scan_" + name;
                var tableId = formId;
                var xlsxFileName = "scan_" + name + "_main.xlsx";

                xlPath =
                    'app/config/tables/' +
                    tableId +
                    '/forms/' +
                    formId +
                    '/' + xlsxFileName;
                console.log('going to write formDef to: ' + xlPath);


                devUtil.postBase64File(xlPath, xlFile.base64, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + xlPath);
                    }
                }, true);

                var path =
                    'app/config/tables/' + tableId + '/forms/' + formId +
                    '/formDef.json';
                console.log('going to write formDef to: ' + path);

                devUtil.postFile(path, formDefString, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + path);
                    }
                });

                // The formDef.json also has to be in the form_template directory
                var formDefStringInTemplateDir = "scan_" + name + "_main_formDef.json";
                var formTemplatePath =
                    'app/config/scan/form_templates/' + formName + '/' + formDefStringInTemplateDir;
                console.log('going to write formDef to: ' + path);

                devUtil.postFile(formTemplatePath, formDefString, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + formTemplatePath);
                    }
                });

                var defPath = 'app/config/tables/' + tableId + '/definition.csv';
                var defCsv = devUtil.createDefinitionCsvFromDataTableModel(dtm);
                devUtil.postFile(defPath, defCsv, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + defPath);
                    }
                });

                var propPath = 'app/config/tables/' + tableId + '/properties.csv';
                var propCsv = devUtil.createPropertiesCsvFromDataTableModel(dtm, formDefJson);
                devUtil.postFile(propPath, propCsv, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + propPath);
                    }
                });

                $("#saveToFileSystem_dialog").dialog("close");
                $(".field_group").addClass("unhighlighted_group");

                return;
            }

            // defining the fields argument
            xlsx_fields = xlsx_fields || [];
            var scanDoc = {};

            // make page visible, set Scan doc properties
            this.send('selectPageTab', pages[curr_index]);
            var $page_div = Ember.get(pages[curr_index], 'pageDiv');
            scanDoc.height = $page_div.height();
            scanDoc.width = $page_div.width();
            scanDoc.fields = [];

            // Add the fields, in the order specified
            var orderFields = function (fieldList) {
                var item, index;
                var orderedFields = [];
                var unorderedFields = [];
                var resultList = [];

                // Collect all fields into the order they are written
                for (var i = 0; i < fieldList.length; i++) {
                    item = $(fieldList[i]).data('obj');

                    if (item == null || item.field_type == 'text_box') {
                        continue;
                    }
                    index = Number(item.order);

                    // Any missing, invalid, or previously used orders are tacked
                    // on the back
                    if (item.order == "" || isNaN(index) || index < 0
                        || orderedFields[index]) {
                        unorderedFields.push(item.getFieldJSON());
                        continue;
                    }

                    orderedFields[index] = item.getFieldJSON();
                }

                // Remove any empty spaces
                for (var i = 0; i < orderedFields.length; i++) {
                    if (orderedFields[i]) {
                        resultList.push(orderedFields[i]);
                    }
                }

                return resultList.concat(unorderedFields);
            };

            scanDoc.fields = orderFields($page_div.find('.field'));
            xlsx_fields = orderFields($page_div.children('.field'));

            var groups = $page_div.children('.field_group');
            var subform_name = subformName;
            if (subform_name && groups.length > 0) { // if there is a subform
                var sub_form = {
                    name: subform_name,
                    groups: [],
                    fields: {}
                }

                var original = $page_div.find('.field_group.original');
                var original_fields = []; // store the order of original names
                var controller = this;
                // set sub_form.fields to orginial fields
                original.find('.field').each(function (i, field) {
                    var data = $(field).data('obj');
                    if (data.field_type != 'text_box') {
                        sub_form.fields[data.name] = controller._actions.toODKType(data.type);
                    }
                    original_fields.push(data);
                });

                // preparing group field of the subform  for json
                groups.each(function (g, group) {
                    var group_map = {};
                    $(group).children('.field').each(function (i, field) {
                        var data = $(field).data('obj');
                        // checking data.field_type !=  text_box because at this index we did not push
                        // anything as we dont want to output text on the json
                        if (data.field_type != "text_box") {
                            group_map[original_fields[i].name] = data.name;
                        }
                    });
                    sub_form.groups.push(group_map);
                });

                scanDoc.sub_forms = [sub_form];

                //add sub_form xlsx
                var subXlFile = this._actions.createXLSX(original_fields, formName, subformName);
                var subformId = "scan_" + sub_form.name;
                var subformTableId = subformId;
                var subFormXlFileName = "scan_" + sub_form.name + ".xlsx";

                var subformDefJson = this._actions.createFormDefJSON(original_fields, formName, subformName);
                var subformDefString = JSON.stringify(formDefJson, 2, 2);
                //var subFormDefJson = "scan_" + sub_form.name + "_formDef.json";

                // Create the definition.csv and properties.csv files from the formDef file
                var sub_dtm = subformDefJson.specification.dataTableModel;

                var subdefCsv = devUtil.createDefinitionCsvFromDataTableModel(sub_dtm);
                var subpropCsv = devUtil.createPropertiesCsvFromDataTableModel(sub_dtm, subformDefJson);

                var subXlPath =
                    'app/config/tables/' + subformTableId + '/forms/' + subformId +
                    '/' + subFormXlFileName;
                console.log('going to write formDef to: ' + subXlPath);


                devUtil.postBase64File(subXlPath, subXlFile.base64, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + subXlPath);
                    }
                }, true);

                var subformPath =
                    'app/config/tables/' + subformTableId + '/forms/' + subformId +
                    '/formDef.json';
                console.log('going to write formDef to: ' + subformPath);

                devUtil.postFile(subformPath, subformDefString, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + subformPath);
                    }
                });

                // The formDef.json also has to be in the form_template directory
                var subformDefStringInTemplateDir = subformId + "_formDef.json";
                var subformTemplatePath =
                    'app/config/scan/form_templates/' + formName + '/' + subformDefStringInTemplateDir;
                console.log('going to write subform formDef to: ' + subformTemplatePath);

                devUtil.postFile(subformTemplatePath, subformDefString, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + subformTemplatePath);
                    }
                });

                var subpropPath = 'app/config/tables/' + subformTableId + '/properties.csv';
                var subpropCsv = devUtil.createPropertiesCsvFromDataTableModel(sub_dtm, subformDefJson);
                devUtil.postFile(subpropPath, subpropCsv, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        alert(
                            'Something went wrong! Please save the file manually.');
                    } else {
                        alert('Saved the file to: ' + subpropPath);
                    }
                });
            }// end sub forms

            var json_output = JSON.stringify(scanDoc, null, '\t');
            var controller = this;
            // scale up the html element sizes
            $("html").css("font-size", "200%");
            html2canvas($(".selected_page"), {
                logging: true,
                onrendered: function (canvas) {
                    var img_src = canvas.toDataURL("image/jpeg", 1);
                    $("html").css("font-size", "62.5%");

                    /* 	Need to extract the base64 from the image source.
                        img_src is in the form: data:image/jpeg;base64,...
                        Where '...' is the actual base64.
                    */
                    var img_base64 = img_src.split(",")[1];

                    var formImgPath = 'app/config/scan/form_templates/' + formName + '/form.jpg';
                    devUtil.postBase64File(formImgPath, img_base64, function (err, response, body) {
                        if (err || response.statusCode !== 200) {
                            alert(
                                'Something went wrong! Please save the file manually.');
                        } else {
                            alert('Saved the file to: ' + formImgPath);
                        }
                    }, true);

                    var templatePath = 'app/config/scan/form_templates/' + formName + '/template.json';
                    devUtil.postFile(templatePath, json_output, function (err, response, body) {
                        if (err || response.statusCode !== 200) {
                            alert(
                                'Something went wrong! Please save the file manually.');
                        } else {
                            alert('Saved the file to: ' + templatePath);
                        }
                    });
                    controller.send('postToFileSystem', pages, curr_index + 1, curr_directory + "nextPage/", formName, subformName, xlsx_fields);
                }
            });
        },

        /**
         *    Creates a new subdirectory in the export zip file for the
         *    current page.
         *    @param (pages) A list of JSON objects which contain page metadata.
         *    @param (curr_index) The current index into the pages list.
         *    @param (curr_directory) String containing the path to the current
         *        directory in the zip file.
         *    @param (zip) The zip file being exported to.
         *   @param (xlsx_fields) array for recursivily storing JSON fields for XLSX output
         */
        createExportZipFolder: function (pages, curr_index, curr_directory, zip, formName, subformName, xlsx_fields) {
            // base case
            // Calling createXLSX to make xlsx file
            if (curr_index == pages.length) {
                var xlFile = this._actions.createXLSX(xlsx_fields, formName, subformName);
                var formDefJson = this._actions.createFormDefJSON(xlsx_fields, formName, subformName);
                var formDefString = JSON.stringify(formDefJson, 2, 2);

                // Create the definition.csv and properties.csv files from the formDef file
                var dtm = formDefJson.specification.dataTableModel;
                var defCsv = this._actions.createDefinitionCsvFromDataTableModel(this, dtm);
                var propCsv = this._actions.createPropertiesCsvFromDataTableModel(this, dtm, formDefJson);

                // get the user given name. if user does not provide with any name, append "default" to
                var name = $('#zip_name').val() || "download";
                var fileName = name + ".zip";
                zip.file("scan_" + name + "_main.xlsx", xlFile.base64, {base64: true});  // added xlFile to the zip

                zip.file("scan_" + name + "_main_formDef.json", formDefString);
                zip.file("definition.csv", defCsv);
                zip.file("properties.csv", propCsv);

                var content = zip.generateAsync({type: "blob"}).then(function (content) {
                    saveAs(content, fileName);

                    $("#export_dialog").dialog("close");
                    $(".field_group").addClass("unhighlighted_group");
                });


                return;
            }

            // defining the fields argument
            xlsx_fields = xlsx_fields || [];
            var scanDoc = {};

            // make page visible, set Scan doc properties
            this.send('selectPageTab', pages[curr_index]);
            var $page_div = Ember.get(pages[curr_index], 'pageDiv');
            scanDoc.height = $page_div.height();
            scanDoc.width = $page_div.width();
            scanDoc.fields = [];

            // Add the fields, in the order specified
            var orderFields = function (fieldList) {
                var item, index;
                var orderedFields = [];
                var unorderedFields = [];
                var resultList = [];

                // Collect all fields into the order they are written
                for (var i = 0; i < fieldList.length; i++) {
                    item = $(fieldList[i]).data('obj');

                    if (item == null || item.field_type == 'text_box') {
                        continue;
                    }
                    index = Number(item.order);

                    // Any missing, invalid, or previously used orders are tacked
                    // on the back
                    if (item.order == "" || isNaN(index) || index < 0
                        || orderedFields[index]) {
                        unorderedFields.push(item.getFieldJSON());
                        continue;
                    }

                    orderedFields[index] = item.getFieldJSON();
                }

                // Remove any empty spaces
                for (var i = 0; i < orderedFields.length; i++) {
                    if (orderedFields[i]) {
                        resultList.push(orderedFields[i]);
                    }
                }

                return resultList.concat(unorderedFields);
            };

            scanDoc.fields = orderFields($page_div.find('.field'));
            xlsx_fields = orderFields($page_div.children('.field'));

            var groups = $page_div.children('.field_group');
            var subform_name = $("#sub_form_name").val();
            if (subform_name && groups.length > 0) { // if there is a subform
                var sub_form = {
                    name: subform_name,
                    groups: [],
                    fields: {}
                }

                var original = $page_div.find('.field_group.original');
                var original_fields = []; // store the order of original names
                var controller = this;
                // set sub_form.fields to orginial fields
                original.find('.field').each(function (i, field) {
                    var data = $(field).data('obj');
                    if (data.field_type != 'text_box') {
                        sub_form.fields[data.name] = controller._actions.toODKType(data.type);
                    }
                    original_fields.push(data);
                });

                // preparing group field of the subform  for json
                groups.each(function (g, group) {
                    var group_map = {};
                    $(group).children('.field').each(function (i, field) {
                        var data = $(field).data('obj');
                        // checking data.field_type !=  text_box because at this index we did not push
                        // anything as we dont want to output text on the json
                        if (data.field_type != "text_box") {
                            group_map[original_fields[i].name] = data.name;
                        }
                    });
                    sub_form.groups.push(group_map);
                });

                scanDoc.sub_forms = [sub_form];

                //add sub_form xlsx
                var xlFile = this._actions.createXLSX(original_fields, formName, subformName);
                zip.file("scan_" + sub_form.name + ".xlsx", xlFile.base64, {base64: true});  // added xlFile to the zip
                var formDefJson = this._actions.createFormDefJSON(original_fields, formName, subformName);
                var formDefString = JSON.stringify(formDefJson, 2, 2);
                zip.file("scan_" + sub_form.name + "_formDef.json", formDefString);  // added xlFile to the zip

                // Create the definition.csv and properties.csv files from the formDef file
                var dtm = formDefJson.specification.dataTableModel;

                var defCsv = this._actions.createDefinitionCsvFromDataTableModel(this, dtm);
                var propCsv = this._actions.createPropertiesCsvFromDataTableModel(this, dtm, formDefJson);

                zip.file("definition.csv", defCsv);
                zip.file("properties.csv", propCsv);
            }// end sub forms

            var json_output = JSON.stringify(scanDoc, null, '\t');
            var controller = this;
            // scale up the html element sizes
            $("html").css("font-size", "200%");
            html2canvas($(".selected_page"), {
                logging: true,
                onrendered: function (canvas) {
                    var img_src = canvas.toDataURL("image/jpeg", 1);
                    $("html").css("font-size", "62.5%");

                    /* 	Need to extract the base64 from the image source.
                        img_src is in the form: data:image/jpeg;base64,...
                        Where '...' is the actual base64.
                    */
                    var img_base64 = img_src.split(",")[1];

                    // add img and json to zip file
                    zip.file(curr_directory + "form.jpg", img_base64, {base64: true});
                    zip.file(curr_directory + "template.json", json_output);
                    controller.send('createExportZipFolder', pages, curr_index + 1, curr_directory + "nextPage/", zip, formName, subformName, xlsx_fields);
                }
            });
        },
        /**
         *    @param (fields) array containing all the properites for the json
         *   creates xlsx file with this this fields
         *   reads this xlsx file and makes formdef.json
         *   returns a json formatted stirng containing all the required properties of a
         *   field required for json file
         */
        createFormDefJSON: function (fields, formName, subformName) {
            var removeEmptyStrings = function (rObjArr) {
                var outArr = [];
                _.each(rObjArr, function (row) {
                    var outRow = Object.create(row.__proto__);
                    _.each(row, function (value, key) {
                        if (_.isString(value) && value.trim() === "") {
                            return;
                        } else if (!_.isString(value) && isNaN(value)) {
                            return;
                        } else if ((_.isString(value)) && (value === "NaN")) {
                            return;
                        }
                        outRow[key] = value;
                    });
                    if (_.keys(outRow).length > 0) {
                        outArr.push(outRow);
                    }
                });
                return outArr;
            }
            var xlFile = ODKScan.runGlobal('createXLSX')(fields, formName, subformName);
            var workbook = XLSX.read(xlFile.base64, {type: 'base64'});
            var result = {};
            _.each(workbook.SheetNames, function (sheetName) {
                var rObjArr = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                rObjArr = removeEmptyStrings(rObjArr);
                if (rObjArr.length > 0) {
                    result[sheetName] = rObjArr;
                }
            });
            var processedWorkbook = XLSXConverter.processJSONWorkbook(result);
            return processedWorkbook;
        },

        /**
         *  Create definition.csv from inverted the formDef.json
         * for XLSXConverter processing
         */
        createDefinitionCsvFromDataTableModel: function (context, dataTableModel) {
            var definitions = [];
            var jsonDefn;

            // and now traverse the dataTableModel making sure all the
            // elementSet: 'data' values have columnDefinitions entries.
            //
            for (var dbColumnName in dataTableModel) {
                // the XLSXconverter already handles expanding complex types
                // such as geopoint into their underlying storage representation.
                jsonDefn = dataTableModel[dbColumnName];

                if (jsonDefn.elementSet === 'data' && !jsonDefn.isSessionVariable) {
                    var surveyElementName = jsonDefn.elementName;

                    // Make sure that the listChildElementKeys have extra quotes
                    // This breaks the RFC4180CsvReader otherwise
                    var listChildElem = null;
                    if (jsonDefn.listChildElementKeys !== undefined && jsonDefn.listChildElementKeys !== null && jsonDefn.listChildElementKeys.length !== 0) {
                        listChildElem = jsonDefn.listChildElementKeys;
                        listChildElem = context._actions.doubleQuoteString(JSON.stringify(listChildElem));
                    }

                    definitions.push({
                        _element_key: dbColumnName,
                        _element_name: jsonDefn.elementName,
                        _element_type: (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType),
                        _list_child_element_keys: (listChildElem === undefined || listChildElem === null ? JSON.stringify([]) : listChildElem)
                    });
                }
            }

            // Now sort the _column_definitions
            definitions = _.sortBy(definitions, function (o) {
                return o._element_key;
            });

            // Now write the definitions in CSV format
            var defCsv = "_element_key,_element_name,_element_type,_list_child_element_keys\r\n";
            definitions.forEach(function (colDef) {
                var dataString = colDef._element_key + ",";
                dataString += colDef._element_name + ",";
                dataString += colDef._element_type + ",";
                dataString += colDef._list_child_element_keys + "\r\n";
                defCsv += dataString;
            });
            return defCsv;
        },

        /**
         *  Create properties.csv from inverted the formDef.json
         * for XLSXConverter processing
         */
        createPropertiesCsvFromDataTableModel: function (context, dataTableModel, formDef) {
            var properties = formDef.specification.properties;

            // Now write the properties in CSV format
            var propCsv = "_partition,_aspect,_key,_type,_value\r\n";
            properties.forEach(function (prop) {
                var dataString = prop._partition + ",";
                dataString += prop._aspect + ",";
                dataString += prop._key + ",";
                dataString += prop._type + ",";
                dataString += context._actions.doubleQuoteString(prop._value) + "\r\n";
                propCsv += dataString;
            });

            return propCsv;
        },

        doubleQuoteString: function (str) {
            if (str !== null) {
                if (str.length === 0 ||
                    str.indexOf("\r") !== -1 ||
                    str.indexOf("\n") !== -1 ||
                    str.indexOf("\"") !== -1) {

                    str = str.replace(/"/g, "\"\"");
                    str = "\"" + str + "\"";
                    return str;
                } else {
                    return str;
                }
            }
        },

        /**
         *    Creates a xlsx filewhich is going to be in the export zip file for the
         *    current page.
         *    @param (fields) Array of JSON objects which contain page metadata.
         */
        createXLSX: function (fields, formName, subformName) {
            // for servey sheet
            // filling out the initial values
            var survey = new Array();
            survey[0] = new Array();
            survey[0][0] = "clause";
            survey[0][1] = "type";
            survey[0][2] = "name";
            survey[0][3] = "display.prompt.text";

            // for model sheet
            // filling out the initial values
            var model = new Array();
            model[0] = new Array();
            model[1] = new Array();
            model[2] = new Array();
            // For the model, fill in the column names
            model[0][0] = "name";
            model[0][1] = "type";

            // Include the model values that will be uploaded to aggregate
            model[1][0] = "scan_output_directory";
            model[1][1] = "string";

            model[2][0] = "raw";
            model[2][1] = "json";

            // for the choice sheet
            // filling out the initial values
            var choices = new Array();
            choices[0] = new Array();
            choices[0][0] = "choice_list_name";
            choices[0][1] = "data_value";
            choices[0][2] = "display.text";

            // for setting sheet
            // filling out the initial values
            var setting = new Array();
            setting[0] = new Array();
            setting[0][0] = "setting_name";
            setting[0][1] = "value";
            setting[0][2] = "display.title.text";
            // intiallinzing row 1 to 3 for setting sheet


            setting = ODKScan.runGlobal('intializeArray')(setting, 4);
            setting[1][0] = "form_id";
            setting[2][0] = "table_id";
            setting[3][0] = "form_version";
            setting[4][0] = "survey";

            // getting the curren date to add it to the value of form version
            // in the format of yyyymd
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            // formated the date in yyyymd format
            var formatted = year + "" + "" + month + "" + day;

            var form_name;

            if (fields.length == 0 || subformName == "") {
                form_name = formName || "download";
            } else {
                form_name = subformName || 'subform';
            }

            setting[1][1] = "scan_" + form_name;
            setting[1][2] = "";
            setting[2][1] = "scan_" + form_name;
            setting[2][2] = "";
            setting[3][1] = formatted;
            setting[3][2] = "";
            setting[4][1] = "";
            setting[4][2] = setting[1][1];
            // because for tally sheet we do not want choice sheet
            var is_not_tally = false;

            if (fields) {
                //console.log("subform name "+ fields[0]);
                var length = fields.length;
                if (length == 0) {
                    survey[1] = new Array();
                    survey[1][0] = "";
                    survey[1][1] = "note";
                    survey[1][2] = "";
                    survey[1][3] = "I am empty";
                }

                // making two dimensional array for servey sheet

                survey = ODKScan.runGlobal('intializeArray')(survey, length + length * 3);
                console.log("test length: " + survey.length);
                var cur_length = fields.length;
                var prev_survey_length = survey.length;
                var j = 1;
                for (var i = 0; i < cur_length; i++) {
                    survey[j][0] = "begin screen";

                    survey[j + 1][0] = "";
                    survey[j + 1][1] = "read_only_image";
                    survey[j + 1][2] = fields[i].name + "_image0";

                    j = j + 2;

                    survey[j][0] = "";
                    survey[j][1] = ODKScan.runGlobal('toODKType')(fields[i].type);

                    // if the type is select1 or select_many, we need to have choice sheet
                    // preparing choice sheet
                    if (fields[i].type == "select1" || fields[i].type == "select_many") {
                        is_not_tally = true;
                        var size = fields[i].grid_values.length;
                        var count = 1;
                        var index = 0;  // for the index of the fields[i].grid_values[index]
                        // for the index of the choices[temp] = new array
                        // as we may have multiple fields with type select_many and choice_list in
                        // choice sheet has to have them one after another
                        var temp = 1;
                        // adding values_list column in the survey sheet
                        survey[0][4] = "values_list";
                        // inserting the value_list for the current row
                        survey[j][4] = fields[i].name + "_grid_values";

                        // adding "clear" button to deselect all options
                        survey[0][5] = "display.deselect";
                        survey[j][5] = "CLEAR";

                        // if it is first time preparing choice sheet
                        if (choices.length == 1) {
                            count = 1;
                        } else {  // otherwise we need to insert value of choice_list after previous choice_list value
                            count = choices.length;
                            temp = count;
                        }
                        // making two dimensional array for choice sheet
                        for (var m = 1; m <= fields[i].grid_values.length; m++) {
                            choices[temp] = new Array();
                            temp++  // updating temp to have the length of the choices array
                        }

                        // filling the out the choice sheet array with the expected value
                        for (var k = 0; k < fields[i].grid_values.length; k++) {
                            choices[count][0] = fields[i].name + "_grid_values";
                            choices[count][1] = fields[i].grid_values[index];
                            choices[count][2] = fields[i].grid_values[index];
                            count++;  // updating the count for the row of the choices array
                            index++;  // updating the index vlaue
                        }
                    }
                    // filling out the rest of the survey sheet array with the expected value
                    survey[j][2] = fields[i].name;
                    //====================================================================
                    // TODO: we need to fix this on survey, survey gives us strange error when it
                    // is int
                    // if the user gives display text as number in the xlsx we put in "given_number" format
                    // otherwise it will be as it is
                    var temp = fields[i].displayText;
                    if (fields[i].type == "int") {
                        var reg = new RegExp("[A-z]+");

                        if (!reg.test(fields[i].displayText)) {
                            console.log("Am I here??????");
                            temp = "\"" + fields[i].displayText + "\"";
                        }
                        survey[j][3] = temp || fields[i].name;
                    } else {
                        survey[j][3] = fields[i].displayText || fields[i].name;
                    }
                    survey[j + 1][0] = "end screen";
                    j = j + 2;
                }


                // reading two dimensional array and return an array containing the contents of the array
                var readTable = function (tableid, name) {
                    var sheet = [];
                    sheet.name = name;
                    for (var i = 0; i < tableid.length; i++) {
                        // getting the index of the current row
                        var r = sheet.push([]) - 1;
                        // inserting the content of each row of tableid[i]
                        for (var j = 0; j < tableid[i].length; j++) {
                            sheet[r].push(tableid[i][j])
                        }
                    }
                    return sheet;
                }

                var file = {
                    worksheets: [], // worksheets has one empty worksheet (array)
                    activeWorksheet: 0
                };

                var wb = XLSX.utils.book_new();

                // making a worksheet with the content of survey array
                ws = XLSX.utils.aoa_to_sheet(readTable(survey, "survey"));
                XLSX.utils.book_append_sheet(wb, ws, "survey");

                // if the type is not tally we will have choice sheet
                if (is_not_tally) {
                    // making a worksheet with the content of the choices array
                    ws = XLSX.utils.aoa_to_sheet(readTable(choices, "choices"));
                    XLSX.utils.book_append_sheet(wb, ws, "choices");
                }

                // making a worksheet with the content of the model array
                ws = XLSX.utils.aoa_to_sheet(readTable(model, "model"));
                XLSX.utils.book_append_sheet(wb, ws, "model");

                // making a worksheet with the content of the setting array
                ws = XLSX.utils.aoa_to_sheet(readTable(setting, "settings"));
                XLSX.utils.book_append_sheet(wb, ws, "settings");

                var wopts = {bookType: 'xlsx', bookSST: false, type: 'base64'};

                var wbout = [];
                wbout["base64"] = XLSX.write(wb, wopts);
                return wbout;
            }// end if fields

        }, //end createXLSX
        /**
         *    @param (type) type of a specicfic filed
         *   returns a required field type for xlsx file
         */
        toODKType: function (type) {
            if (type == "qrcode") {
                return "string";
            } else if (type == "select1") {  // if it is select1, changing it to select_one
                return "select_one";
            } else if (type == "select_many") {  // if it is select_many, changing it to select_many
                return "select_multiple";
            } else if (type == "tally") {  // if it is tally, changing it to integer
                return "integer";
            } else if (type == "int") {  // if it is int, changing it to integer
                return "integer";
            } else {  // else it is going to be the same type as it is
                return type;
            }
        },
        /**
         *    @param (array) to initialize
         *   @param (length) up to this length to initialize
         *   returns a required field type for xlsx file
         */
        intializeArray: function (array, length) {
            for (var i = 1; i <= length; i++) {
                array[i] = new Array();
            }
            return array;
        },


    }// end actions
});
