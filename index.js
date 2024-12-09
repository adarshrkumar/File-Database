const express = require('express')
const path = require('path')
const multer = require('multer')
const ejs = require('ejs')
const app = express()
const fs = require('fs')
var fName = ''
	
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
	
// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it
	
var storage = multer.diskStorage({
	destination: function (req, file, cb) {

		// Uploads is the Upload_folder_name
		cb(null, "uploads")
	},
	filename: function (req, file, cb) {
	cb(null, file.originalname)
	}
})
	
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;
	
var upload = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb){
	
		// Set the filetypes, it is optional
//		var filetypes = /jpeg|jpg|png/;
		var mimetype = /*filetypes.test(*/file.mimetype/*)*/;

		var extname = /*filetypes.test(*/path.extname(
					file.originalname).toLowerCase()/*)*/;
		
		if (mimetype && extname) {
      fName = file.originalname
			return cb(null, true);
		}
	
		//cb("Error: File upload only supports the "
		//		+ "following filetypes - " + filetypes);
	}

// mypic is the name of file attribute
}).single("myfile");	

app.get("/",function(req,res){
	res.sendFile(`${__dirname}/index.html`);
})
	
app.post("/uploadFile",function (req, res, next) {
  var isAuthenticated = false
	// Error MiddleWare for multer file upload, so if any
	// error occurs, the image would not be uploaded!
  fs.readFile('./creds.json', 'utf8', (error, data) => {
     if (error){
        console.log(error);
        return;
     }
    else {
      data = JSON.parse(data)
      let uName = atob(req.query.uname)
      let passW = atob(req.query.passw)
      let isUrl = false
      data['authorized_urls'].forEach(u => {
        u = u.split('://')[1]
        if (req.hostname === u) isUrl = true
      })
      if (uName === data['uname'] && passW === data['passw'] && isUrl) {
        isAuthenticated = true;
      	upload(req,res,function(err) {
      		if(err) {
      			// ERROR occurred (here it can be occurred due
      			// to uploading image of size greater than
      			// 1MB or uploading different file type)
      			res.send(err)
      		}
      		else {
      			// SUCCESS, image successfully uploaded
      			res.send(`<script>location.href = '/uploads/${fName}'</script>`)
      		}
      	})
      }
      else {
        res.send(`ERROR: Unauthorized check creds.json in file browser for details.`)
      }
    }
   })
  if (isAuthenticated) {
  }
})
	
// Take any port number of your choice which
// is not taken by any other process
app.listen(8080,function(error) {
	if(error) throw error
		console.log("Server created Successfully on PORT 8080")
})

app.get('/uploads*', function(req, res) {
  let file = req.originalUrl
  if (file.includes('.') === false) {
    file = `${file}.html`
  }
  if (!!fs.existsSync(`${__dirname}/${file}`)) {
    if (file.endsWith('/')) {
      file = file.substring(0, file.split('').length - 1)
    }
  }
  else {
    file = '/404.html'
  }
  res.sendFile(`${__dirname}/${file}`)
})

app.get('*', function(req, res) {
  let file = req.originalUrl
  if (file.includes('.') === false) {
    file = `${file}.html`
  }
  if (!!fs.existsSync(`${__dirname}/${file}`)) {
    if (file.endsWith('/')) {
      file = file.substring(0, file.split('').length - 1)
    }
  }
  else {
    file = '/404.html'
  }
  res.sendFile(`${__dirname}/${file}`)
})