// jshint esversion:6

const express = require('express');
const twitterData = require('./api/helpers/twitter');

const app = express();

// Allowing Access to Cross  Origins
app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', "*");
    next();
});


app.get('/tweet', (req, res) => {
    const querry = req.query.q;
    const count = req.query.count;
    const max_id = req.query.max_id;
    
    twitterData(querry, count, max_id).then((response) => {
        res.send(response.data);
    }).catch((error) => {
        res.send(error);
    });

});

app.listen('3000', () => {console.log('Listening on port: 3000');});
