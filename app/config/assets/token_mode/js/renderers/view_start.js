function display() {
	$('#all').on('click', function() {
		odkTables.openTableToListView('deliveries', null, null
        , 'config/tables/deliveries/html/deliveries_list.html');
	});

	$('#search').on('click', function() {
		odkTables.launchHTML(null, 'config/assets/token_mode/delivery_search.html');
	});
}