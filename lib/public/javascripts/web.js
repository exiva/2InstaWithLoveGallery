var socket = new io.Socket();

socket.on('message', function(update){ 
	console.log(update);
	// var data = $.parseJSON(update);
	// $(document).trigger(data);
});