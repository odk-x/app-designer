define(['promptTypes', 'jquery', 'underscore', 'prompts'],
    function(promptTypes, $, _, prompts) {
        return {
          'send_sms': promptTypes.launch_intent.extend({
            type: 'send_sms',
            datatype: 'send_sms',
            buttonLabel: {
              'default': 'Send SMS'
            },
            // this has access to the saved value. the "that" function here
            // will have access to saved data. have to leave the other stuff
            // here, which I got from a launch_intent prompt in prompts.js, to
            // ensure that current functionality is maintained.
            configureRenderContext:
              function(ctxt) {
                var that = this;
                var value = that.getValue();
                that.intentParameters.extras.sms_body =
                    'Name is : ' +
                    that.database.getDataValue('subject_name');
                that.intentParameters.uri =
                  'sms:' + 
                  that.database.getDataValue('phone_number');
                that.renderContext.value = value;
                that.renderContext.buttonLabel = that.buttonLabel;
                ctxt.success();
              },
            intentString: 'android.intent.action.VIEW',
            intentParameters: {
              type: 'vnd.android-dir/mms-sms',
              extras: {
                sms_body: 'Default message'
              }
            },
            extractDataValue: function(jsonObject) {
              console.log('Got returned intent from sms: ' + jsonObject);
            }
          })
        };
      });
