define(['promptTypes', 'jquery', 'underscore', 'prompts'],
    function(promptTypes, $, _) {
        return {
          'send_sms': promptTypes.launch_intent.extend({
            type: 'send_sms',
            datatype: 'send_sms',
            buttonLabel: {
              'default': 'Send SMS'
            },
            intentString: 'vnd.android-dir/mms-sms',
            intentParameters: {
              extras: {
                sms_body: 'This is sent from Survey',
                address: '3604301468'
              }
            },
            extractDataValue: function(jsonObject) {
              console.log('Got returned intent from sms: ' + jsonObject);
            }
          })
        };
      });
