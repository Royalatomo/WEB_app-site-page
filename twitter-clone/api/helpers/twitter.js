// jshint esversion:6

const axios = require('axios');
require('dotenv').config();


function get(querry, count, max_id=null){
    
    const url = 'https://api.twitter.com/1.1/search/tweets.json';
    
    let returnData = '';
    
    if(max_id){
        returnData = axios.get(url, {
            params: {
                q: querry,
                count: count,
                truncated: false,
                max_id: max_id
                
            },
            headers: {
                "Authorization": `Bearer ${process.env.TWITTER_API_TOKEN}`
            }
        });
    }else{
        returnData = axios.get(url, {
            params: {
                q: querry,
                count: count,
                truncated: false,
            },
            headers: {
                "Authorization": `Bearer ${process.env.TWITTER_API_TOKEN}`
            }
        });
    }

    return returnData;
}

module.exports = get;