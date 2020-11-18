const express 				= require('express'),
	  app					= express(),
	//   helmet				= require('helmet'),
	//   search   				= require('./routes/search'),
	  files	    			= require('./routes/files');
// app.use(helmet());

// var http, options, proxy, url;
// http = require("http");
// url = require("url");

// proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
// target  = url.parse("http://ip.quotaguard.com/");

// options = {
//   hostname: proxy.hostname,
//   port: proxy.port || 80,
//   path: target.href,
//   headers: {
//     "Proxy-Authorization": "Basic " + (new Buffer(proxy.auth).toString("base64")),
//     "Host" : target.hostname
//   }
// };

// http.get(options, function(res) {
//   res.pipe(process.stdout);
//   return console.log("status code", res.statusCode);
// });

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    // res.redirect('/search');
    res.send("HT Music Library")
});

// app.use("/files", files);
// app.use("/search", search);

var port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Our app is running on http://localhost:${port}`));