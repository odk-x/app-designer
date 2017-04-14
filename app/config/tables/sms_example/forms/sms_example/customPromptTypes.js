define(['promptTypes', 'jquery', 'underscore', 'prompts'],
    function(promptTypes, $, _, prompts) {
        return {
          'send_sms': promptTypes.launch_intent.extend({
            type: 'send_sms',
            datatype: 'send_sms',
            buttonLabel: {
              'default': 'Send an SMS'
            },
            // The bulk of this function was taken from a launch_intent prompt
            // in prompts.js. This is only needed if you need to access data
            // collected in the same form when sending an SMS. All the
            // statements except those beginning with that.intentParameters
            // need to remain in order to preserve normal functionality.
            configureRenderContext:
              function(ctxt) {
                var that = this;
                var value = that.getValue();
                // We'll overwrite the default message with our custom message.
                that.intentParameters.extras.message_body =
                    'Hello, ' +
                    that.database.getDataValue('name') +
                    '!';
                that.intentParameters.extras.phone_number =
                    that.database.getDataValue('phone_number');
                that.renderContext.value = value;
                that.renderContext.buttonLabel = that.buttonLabel;
                ctxt.success();
              },
            intentString: 'org.opendatakit.smsbridge.activity.SMSDispatcherActivity',
            intentParameters: {
              extras: {
                require_confirmation: true,
                message_body: 'Default message body',
              }
            }
          })
        };
      });
