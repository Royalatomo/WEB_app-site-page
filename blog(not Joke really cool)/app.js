// jshint esversion: 6


// Importing all needed Packages ---
const express = require("express"); // web server
const bodyParser = require("body-parser"); // parsing user post text data
const mongoose = require("mongoose"); // connecting to database
const multer = require('multer'); // parsing user post image data
const fs = require('fs'); // file system CRUD operations
const session = require('express-session'); // creating sessions on login
const passport = require('passport'); // authentication
const passportLocalMongoose = require('passport-local-mongoose'); //  user registeration
const { v4: uuidv4 } = require('uuid'); // create new random ID's


// Admin Account Mail
const adminMail = ["admin@rawats.com"];


// Connecting to the database
mongoose.connect('mongodb://localhost:27017/personalBlogDb', { useNewUrlParser: true, useUnifiedTopology: true });


// Initializing Imported Packages
const app = express();
app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false); // depriciation warning
mongoose.set('useCreateIndex', true); // depriciation warning
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // making folder "Public" static


// Initializing Session
app.use(session({
    secret: "goIjrXJUHPmDFetQUwDA",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// Saving Post image data to dest folder..
const upload = multer({ dest: 'public/img/blogs/' });



// Making Mongoose Schemas ---------

// Initializing Blog Schema
const blogItemSchema = new mongoose.Schema({
    _id: String,
    img: String,
    title: String,
    normalContent: String,
    content: String,
    author: String,
    time: String,
    authorMail: String
});

// Initializing Authentication Schema
const authItemSchema = new mongoose.Schema({
    username: String,
    pass: String,
    secret: String
});

// Initializing User Data Schema
const userDataSchema = new mongoose.Schema({
    name: String,
    photo: String,
    mail: String
});

// Initializing Verified Email Schema
const verifiedSchema = new mongoose.Schema({
    email: String
});

authItemSchema.plugin(passportLocalMongoose); // Initializing PassportLocalMongoose


// Creating Mongoose Models -----

// Creating Blog Collection (blogs)
const blog = mongoose.model('blogs', blogItemSchema);

// Creating Authentication Collection (authentications)
const auth = mongoose.model('authentication', authItemSchema);

// Creating UserData Collection (userdatas)
const userData = mongoose.model('userData', userDataSchema);

// Creating Verified Email Collection (verifieds)
const verified = mongoose.model('verified', verifiedSchema);


// Initializing passport authentication
passport.use(auth.createStrategy());
passport.serializeUser(auth.serializeUser());
passport.deserializeUser(auth.deserializeUser());

let dataReturn = ''; // stores value from linkToBlog() result



// Functions Used ------

// Converts A Specific Blog Into A Specific Link
let blogLink = (link, id) => {

    // Only take first 60char of blog title
    link = link.slice(0, 60);
    // Remove space in end
    if (link[link.length - 1] == " ") {
        link = link.slice(0, [link.length - 1]);
    }
    // All Confusing words which will be removed
    let rmWords = ["~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", "=", "|", "\\", "}", "]", "{", "[", ":", ";", '"', "'", ">", ".", "<", ",", "?", "/", "=", "  "];

    // Convert all char to lowercase
    link = link.toLowerCase();
    // Remove confusing words from blog title
    for (let i of (rmWords)) {
        link = link.split(i).join('');
    }

    // Convert Spaces to +
    link = link.split(' ').join('+');
    link = `${link}+${id}`; // attache id in the end of the blog link
    return link; // return converted link with id
};


// Converts A Specific Blog Link Into A Specific Blog Page
function linkToBlog(link) {

    let realLink = link; // stores link
    link = link.split('+'); // sperates words based of +
    id = link[link.length - 1]; // stores blog id
    // All Confusing words which will be removed
    let rmWords = ["~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", "=", "|", "\\", "}", "]", "{", "[", ":", ";", '"', "'", ">", ".", "<", ",", "?", "/", "=", '  '];

    // Find Blog By Id From database
    blog.findById(id, (err, data) => {

        if (data === null) {
            // if No blog exists with same id
            dataReturn = data;
        } else {
            realLink = realLink.split('+').join(' '); // Convert + to spaces
            realLink = realLink.split(data._id).join(''); // remove id from link
            realLink = realLink.slice(0, realLink.length - 1); // grabs all link words(without id)

            // Convert blog title from database to lowercase
            dataTitle = String(data.title).toLowerCase();

            // Remove all the confusing words from blog title returned by database
            for (let i of (rmWords)) {
                dataTitle = dataTitle.split(i).join('');
            }
            // get first 40 words of the title
            dataTitle = dataTitle.slice(0, 40);

            // Check if the last word is space
            if (dataTitle[dataTitle.length - 1] == " ") {
                // if it is then remove last word
                dataTitle = dataTitle.slice(0, [dataTitle.length - 1]);
            }
            // If Link Given And Custom made like matches
            if (realLink == dataTitle) {
                // return data of the blog
                dataReturn = data;
            }
        }
    });
}


// Setting All Get Routes -----

// Root Route
app.get('/', (req, res) => {
    // Get All Blogs
    blog.find({}, (err, data) => {
        let blogLinkArray = []; // blog array
        // Add blog title and id to array
        for (let i of data) {
            blogLinkArray.push(blogLink(i.title, i._id));
        }

        // Give Time to set the blog array
        setTimeout(() => {
            // If User Is Logged In
            if (req.isAuthenticated()) {
                // Find user in database
                userData.find({}, (err, userdata) => {
                    for (let i of userdata) {
                        // Fetch data of logged in user
                        if (i.mail === req.user.username) {

                            let isVerified = false; // stores value is user has verification tick

                            // Find Is User has verification tick
                            verified.find({}, (err, veriData) => {
                                for (let j of veriData) {
                                    // If User Email matches in verified email database
                                    if (j.email === req.user.username) {
                                        isVerified = true; // set user to verified

                                        // render home.ejs page with verification tick, blogs, user name, user profile
                                        res.render('home', { userLogin: true, blogsArray: data, blogLinks: blogLinkArray, userName: i.name, userImg: i.photo, verified: true });
                                    }
                                }
                            });

                            // Give Time To Check if user is verified process complete
                            setTimeout(() => {
                                // if user is not verified but logged in
                                if (!isVerified) {
                                    // render home.ejs page with blogs, user name, user profile
                                    res.render('home', { userLogin: true, blogsArray: data, blogLinks: blogLinkArray, userName: i.name, userImg: i.photo, verified: false });
                                }
                            }, 100);

                        }
                    }
                });

            } else {
                // If User Is Not Logged In
                // render home.ejs page with blogs, Log Now (name), login profile
                res.render('home', { userLogin: false, blogsArray: data, blogLinks: blogLinkArray, userName: "Login Now", userImg: "/img/login-user.jpg", verified: false });
            }
        }, 100);
    });
});

// Blog Link Route
app.get('/blog/:title', (req, res) => {
    // Convert blog link to specific blog data from database
    linkToBlog(req.params.title);

    // give time to convert blog link to blog data
    setTimeout(() => {
        if (dataReturn === null) {
            // If No Data is present with blog link
            res.send('<h1>404! Blog Not Found</h1><p>Please Recheck The Link There Must Be A Typo Or The Blog has been deleted!</p>');
        } else {

            // if user is logged in
            if (req.isAuthenticated()) {
                // find user in database
                userData.find({}, (err, userdata) => {
                    for (let i of userdata) {
                        // fetch user data from database who wrote the blog
                        if (i.mail === dataReturn.authorMail) {

                            let isVerified = false; // stores if blog author is verified
                            // Check if author is verified
                            verified.find({}, (err, veriData) => {
                                for (let j of veriData) {
                                    // if author is verified
                                    if (j.email === dataReturn.authorMail) {
                                        isVerified = true;  // set author to verified

                                        let isAdmin = false;

                                        // if the logged in user is the author or user is admin
                                        for (let admin of adminMail) {
                                            if (i.mail == req.user.username || req.user.username === admin) {
                                                res.render('blog', { askedBlog: dataReturn, showTrash: true, userLogin: true, userName: `${i.name} (You)`, userImg: i.photo, verified: true });
                                                isAdmin = true;
                                            }
                                        }
                                        setTimeout(() => {
                                            if (!isAdmin) {
                                                // if the logged in user is not the author
                                                res.render('blog', { askedBlog: dataReturn, showTrash: false, userLogin: true, userName: i.name, userImg: i.photo, verified: true });
                                            }
                                        }, 100);
                                    }
                                }
                            });

                            // Give time to check if author is verified
                            setTimeout(() => {
                                // if author is not verified
                                if (!isVerified) {

                                    let isAdmin = false;
                                    // if the logged in user is the author or user is admin
                                    for (let admin of adminMail) {
                                        if (i.mail == req.user.username || req.user.username === admin) {
                                            res.render('blog', { askedBlog: dataReturn, showTrash: true, userLogin: true, userName: `${i.name} (You)`, userImg: i.photo, verified: false });
                                        }
                                        isAdmin = true;
                                    }
                                    setTimeout(() => {
                                        if (!isAdmin) {
                                            // if the logged in user is not the author
                                            res.render('blog', { askedBlog: dataReturn, showTrash: false, userLogin: true, userName: i.name, userImg: i.photo, verified: false });
                                        }
                                    }, 100);
                                }
                            }, 100);
                        }
                    }
                });
            } else {
                // if user is not logged in--
                userData.find({}, (err, userdata) => {
                    for (let i of userdata) {
                        // find blog author data from database
                        if (i.mail === dataReturn.authorMail) {
                            let isVerified = false; // stores is author is verified
                            // check if author is verified
                            verified.find({}, (err, veriData) => {
                                for (let j of veriData) {
                                    // if author is verified
                                    if (j.email === dataReturn.authorMail) {
                                        isVerified = true; // set author is verified
                                        res.render('blog', { askedBlog: dataReturn, userLogin: false, showTrash: false, userName: i.name, userImg: i.photo, verified: true });
                                    }
                                }
                            });

                            // Give time to check is author is verified
                            setTimeout(() => {
                                // if author is not verified
                                if (!isVerified) {
                                    res.render('blog', { askedBlog: dataReturn, showTrash: false, userLogin: false, userName: i.name, userImg: i.photo, verified: false });
                                }
                            }, 100);
                        }
                    }
                });
            }
        }
    }, 100);
});

// NewBlog Route
app.get('/newblog', (req, res) => {
    // If User Is Logged In
    if (req.isAuthenticated()) {
        // find user in database
        userData.find({}, (err, userdata) => {
            for (let i of userdata) {
                // fetch user data
                if (i.mail === req.user.username) {
                    let isVerified = false; // store user is verified
                    // Check if user is verified
                    verified.find({}, (err, veriData) => {
                        for (let j of veriData) {
                            // if user is verified
                            if (j.email === req.user.username) {
                                isVerified = true; // set user is verified
                                res.render('newblog', { userName: i.name, userImg: i.photo, verified: true });
                            }
                        }
                    });

                    // Give time to check if user is verified
                    setTimeout(() => {
                        // if user is not verified
                        if (!isVerified) {
                            res.render('newblog', { userName: i.name, userImg: i.photo, verified: false });
                        }
                    }, 100);
                }
            }
        });
    } else {
        // if user is not logged in
        res.send("<h1>Authentication Error!</h1><p>You Are Not Authorized To Add New Blogs.. Login First</p>");
    }
});

// Login Form Route
app.get('/login', (req, res) => {
    res.render('login', { userNumber: String(Math.floor(Math.random() * 8)) });
});

// SignUp Form Route
app.get('/signup', (req, res) => {
    // genrates random value between 0-8
    let userImageNumber = String(Math.floor(Math.random() * 9));
    res.render('signup', { userNumber: userImageNumber });
});

// Logout Get Route
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


// Setting All Post Routes -----

// Compose route (post blog)
app.post('/compose', upload.single("img"), (req, res) => {

    // if user is logged in
    if (req.isAuthenticated()) {
        // if user submitted all inputs
        if (req.body.title !== '' && String(req.file) !== "undefined" && req.body.realContent !== "") {

            let id = uuidv4(); // creates a unique id
            let title = req.body.title.slice(0, 40); // take first 40char of title
            let extention = req.file.originalname.split('.'); // split name based on "."
            extention = extention[extention.length - 1]; // get the last element

            // if extention is "png" or "jpg" or "jpeg"
            if (extention === "png" || extention === "jpg" || extention === "jpeg") {
                // rename file with id + extention(given by user)
                fs.rename(req.file.path, req.file.destination + `/${id}.${extention}`, () => { });
                // remove the default saved image
                fs.unlink(req.file.path, (err) => { });


                // Converts customs received tags to html tags
                makeCustomToHtml = (content) => {

                    let txt = []; // Storing FormatedTxt

                    let html = content;
                    // Convert New line to <br> tags
                    html = html.split('\n').join('<br>');

                    // Removing < and / so that user cannot add his own html tags (Security)
                    for (let i = 0; i < html.length; i++) {

                        // Removing <
                        if (html[i] == "<") {
                            if (html.slice(i, i + 4) == "<br>") {
                                txt.push(html[i]);
                            }
                        }
                        // Removing /
                        else if (html[i] !== "/") {
                            txt.push(html[i]);
                        }
                    }

                    html = txt.join('');

                    // Chaning custom tags to html tags
                    html = html.split('+b-').join('<span class="bold">'); // Bold
                    html = html.split('+i-').join('<span class="italic">'); // Italic
                    html = html.split('+u-').join('<span class="underline">'); // underline
                    html = html.split('+l-').join('<div class="text-left">'); // left align
                    html = html.split('+c-').join('<div class="text-center">'); // center align
                    html = html.split('+r-').join('<div class="text-right">'); // right align

                    // Getting Number between 1-10
                    for (let i = 0; i < "1234567890".length; i++) {
                        // Adding Font-Size Tags if any custom tag present(FormatedTxt)
                        html = html.split(`$${i + 1}$`).join(`<span style="font-size: ${i + 1}vh">`);
                    }

                    // Chaning custom Ending tags to html Ending tags
                    html = html.split('+\\-').join('</span>');
                    html = html.split('+\\\\-').join('</div>');
                    html = html.split(`$\\$`).join('</span>');

                    return html;
                };


                // find user in database
                userData.find({}, (err, data) => {
                    for (let i of data) {
                        // fetch user's data
                        if (i.mail == req.user.username) {
                            let date = new Date(); // date and time

                            // Making new blog model
                            let blogToSave = new blog({
                                _id: id,
                                title: title,
                                normalContent: req.body.normalContent,
                                content: makeCustomToHtml(req.body.realContent),
                                img: `/img/blogs/${id}.${extention}`,
                                author: i.name,
                                authorMail: req.user.username,
                                time: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${(date.getMinutes()) < 10 ? "0" + String(date.getMinutes()) : date.getMinutes()}`
                            });

                            // saving the blog in database
                            blogToSave.save();

                            // Give time to complete above processes
                            setTimeout(() => {
                                // redirect user to homepage
                                res.redirect('/');
                            }, 200);
                        }
                    }
                });
            } else {
                // if user send a file with unknown extention                
                // remove file
                fs.unlink(req.file.path, (err) => { });
                // send error message
                res.send("<h1>Extention Mismatch</h1> <p>Sorry But You Can't Upload This File. <br><em><strong>Extention Supported: </strong>Png, Jpg, Jpeg</em></p>");
            }
        } else {
            // if user didn't provided value to all fields
            res.send("<h1>Missing Values!</h1><p>Fill All the fields.</p>");

            // if user did send a file but not other data
            if (String(req.file) !== "undefined") {
                // remove file
                fs.unlink(req.file.path, (err) => { });
            }
        }
    } else {
        // if user is not logged in
        res.send("<h1>Authentication Error!</h1><p>You Are Not Authorized To Post This Blog On Site... Please Login First!</p>");
    }
});

// Remove Route (remove blog)
app.post('/remove', (req, res) => {

    // if user is logged in
    if (req.isAuthenticated()) {
        // find blog by id
        blog.findById(req.body.id, (err, data) => {
            // if user is blog author or the user is admin

            let isAdmin = false;

            for (let admin of adminMail) {
                if (data.authorMail === req.user.username || req.user.username === admin) {

                    // find the blog's image location
                    blog.findById(req.body.id, (err, data) => {
                        // remove the image
                        fs.unlink(`public${data.img}`, (err) => { });
                    });
                    // find the blog by id and remove it
                    blog.findByIdAndRemove(req.body.id, (err) => { });
                    setTimeout(() => {
                        // send user to home screen
                        res.redirect('/');
                    }, 100);
                    isAdmin = true;
                }
            }

            setTimeout(() => {
                if(!isAdmin) {
                    // if user is logged in user is not admin or author of the blog
                    res.send('<h1>Authentication Error!</h1><p>You Are Not Authorize To Remove This Post!</p>');
                }
            }, 100);

        });

    } else {
        // if user is not logged in
        res.send('<h1>Authentication Error!</h1><p>Please Login First Before Deleting this post!</p>');
    }
});

// Login Route (login account)
app.post('/login', (req, res) => {
    // Create a structer to check login info
    const user = new auth({
        username: req.body.username,
        password: req.body.password
    });

    // Validate the login credentials
    req.login(user, (err) => {

        if (err) {
            // if user is any error occurs
            res.send("Some Error Occured");

        } else {
            // if no error occured
            passport.authenticate('local')(req, res, () => {
                // if credentials are correct
                res.redirect('/');
            });

        }
    });
});

// Register Route (register a new account)
app.post('/register', upload.single("img"), (req, res) => {

    // Make sure the name is within 30char
    req.body["full-name"] = req.body["full-name"].slice(0, 30);

    // Getting the extention of the file send(user profile)
    let extention = req.file.originalname.split('.');
    extention = extention[extention.length - 1];

    // if extention is Png, Jpg, Jpeg
    if (extention === "png" || extention === "jpg" || extention === "jpeg") {

        // if name is not empty
        if (req.body["full-name"] !== '') {
            // if password and confirm-password matches
            if (req.body.password === req.body["confirm-password"]) {

                // passport register function(Register User with username and password)
                auth.register({ username: req.body.username }, req.body.password, function (err, user) {
                    if (err) {
                        // If There is some error give user some tips what went wrong?
                        res.send('<h1>Error Please Check Your Input</h1><p>Possibly: <b>You didn\'t specified email</b> or <b>the email is already in use</b> or <b>You didn\'t typed your password</b>!!</p>');
                        // remove user profile image send by user
                        fs.unlink(req.file.path, (err) => { });

                    } else {
                        // copy the image send by user to new folder and with "username"."extention" name
                        fs.copyFile(req.file.path, `public/img/profile/${req.body.username}.${extention}`, (err) => { });
                        // remove image from original location
                        fs.unlink(req.file.path, (err) => { });

                        // Create new userData to save user info to database
                        let newUser = new userData({
                            name: req.body["full-name"],
                            photo: `/img/profile/${req.body.username}.${extention}`,
                            mail: req.body.username
                        });
                        // save user info to database
                        newUser.save();

                        // Authenticate user if everything is ok
                        passport.authenticate('local')(req, res, () => {
                            // redirect user to home page after authentication
                            res.redirect('/');
                        });
                    }
                });
            } else {
                // if password and confirm-password doesn't match
                fs.unlink(req.file.path, (err) => { });
                res.send('<h1>Password Missmatch</h1><p>Sorry, But The Password and Confirm Password Does not Match.. If Don\'t Know What is going on then Contact Admin..</p>');
            }
        } else {
            // if no name is specified
            // remove the image send by user
            fs.unlink(req.file.path, (err) => { });
            res.send('<h1>Enter You Name</h1><p>No Name Specified In The Field</p>');
        }
    } else {
        // if user trys to put some file with unknown extention
        // remove the image send by user
        fs.unlink(req.file.path, (err) => { });
        res.send("<h1>File Extention Error</h1><p>Sorry, But The File You Submitted Is Not JPG, JPEG Or PNG.</p>");
    }
});

// Listing Started ---
app.listen(3000, () => console.log('Started Server On Port 3000'));