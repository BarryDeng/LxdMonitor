let query = function(cmd){
    let ip = $('#serverIP option:selected').text();
    let data = JSON.stringify({"ip": ip, "command": cmd});

    console.log();
    $.ajax({
        url: '/query',
        method: 'POST',
        data: data,
        contentType: 'application/json'
    })
};

