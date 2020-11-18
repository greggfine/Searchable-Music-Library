const express 				= require('express'),
	  app					= express(),
	  helmet				= require('helmet');
      search   				= require('./routes/search'),
	//   files	    			= require('./routes/files');
      app.use(helmet());
 

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// app.use("/files", files);
app.use("/search", search);

app.get('/', (req, res) => {
    res.redirect('/search');
});



var port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Our app is running on http://localhost:${port}`));