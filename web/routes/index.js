var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var path = require('path');

msg = {
  "ip": "",
  "command": ""
};

router.post('/query', function(req, res, next) {
  console.log(req.body);
  msg.ip = req.body.ip;
  msg.command = req.body.command;

  console.log(msg);

  request.post('http://127.0.0.1:5000/',
      { json: msg },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
            fs.writeFile(path.join("public", "data", msg.ip + "-" + msg.command), JSON.stringify(body), err => { if (err) console.log(err); });
        }
      });
  res.send("OK");
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('status')
});

router.get('/status', function(req, res, next) {
  res.render('index', { title: "LxdMonitor", serverIP: msg.ip });
});

router.get('/data/:id', function(req, res, next) {
    let options = {
        root: __dirname + '/../public/data/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    let filename = req.params.id;
    console.log(filename);

    res.sendFile(filename, options, function(err){
        if (err) {
            console.log(err);

        } else {
            console.log('Sent: ', filename);
        }
    });
});

router.get('/:query', function(req, res, next) {
  if (msg.ip === "" || msg.command === "") {
      res.redirect("status");
  }

  let data_url = "/data/" + msg.ip + "-" + msg.command;

  let datasheet = '<th data-field="id">ID</th>';
  if (req.params.query === "containers") {
      datasheet += '<th data-field="name">name</th>'
      datasheet += '<th data-field="status">status</th>'
      datasheet += '<th data-field="devices">devices</th>'
  } else if (req.params.query === "networks") {
      datasheet += '<th data-field="name">name</th>'
      datasheet += '<th data-field="type">type</th>'
      datasheet += '<th data-field="used_by">used_by</th>'
      datasheet += '<th data-field="config">config</th>'
  } else if (req.params.query === "images") {
      datasheet += '<th data-field="alias">alias</th>';
      datasheet += '<th data-field="fingerprint">fingerprint</th>';
      datasheet += '<th data-field="architecture">architecture</th>';
      datasheet += '<th data-field="uploaded_at">uploaded_at</th>';
      datasheet += '<th data-field="public">public</th>';
      datasheet += '<th data-field="size">size</th>';
  } else if (req.params.query === "profiles") {
      datasheet += '<th data-field="name">name</th>'
  }

  res.render('datasheet', { title: 'LxdMonitor', serverIP: msg.ip, data_url: data_url, datasheet: datasheet });
});

module.exports = router;
