
        var sqlWhereClause = null;
        var sqlSelectionArgs = null;
        var windowHeight = $(window).innerHeight();
        var search_font;
        function display() {
            odkData.query('deliveries', null, null, null, null, null, null, 
                                    null, null, null, populateSuccess, populateFailure);
        }

        function populateSuccess(result) {
            console.log('populateSuccess');
            var columns = result.getColumns();
            console.log(columns);
            for (var i = 0; i < columns.length; i++) {
                addField(columns[i]);
            }
            //columns.forEach(addField);
        }

        function populateFailure(error) {
            console.log('populateFailure with error: ' + error);
        }

        function addField(item) {
            console.log('adding column: ' + item);
            if (item.charAt(0) !=('_')) {
                $('#field').append($("<option/>").attr("value", item).text(item));
            } 
        }


        function search() {
            sqlWhereClause = document.getElementById('field').value +' = ?';
            sqlSelectionArgs = document.getElementById('value').value;
            odkData.query('deliveries', sqlWhereClause, [sqlSelectionArgs],
            null, null, null, null, null, null, null,
            successCallbackFn, failureCallbackFn);
        }

        function successCallbackFn(result) {
            document.getElementById('search_results').innerHTML = result.getCount() + ' deliveries match the given criteria';
            if (result.getCount() > 0) {
                document.getElementById('launch').style.display='block';
            } else {
                document.getElementById('launch').style.display='none';
            }
        }

        function failureCallbackFn(error) {
            document.getElementById('search_results').innerHTML = 'invalid field!';
            document.getElementById('launch').style.display='none';
        }

        function launch() {
            console.log(sqlWhereClause + ' ---- ' + sqlSelectionArgs);
                odkTables.openTableToListView('deliveries', sqlWhereClause,
                    [sqlSelectionArgs], 'config/tables/deliveries/html/deliveries_list.html');
        }

        $(window).resize(function() {
            helper('search', search_font, 'font-size');
            windowHeight = $(window).innerHeight(); 

        });

        function helper(name, value, attribute) {
           var viewportHeight = $(window).innerHeight();
            if (viewportHeight < windowHeight) {
                console.log('set ' + name + '\'s ' + attribute + ' to ' + value);
                if (attribute == 'height') {
                    $('#' + name).css({'height':value});
                } else {
                    $('#' + name).css({'font-size':value});
                }
            }
        }