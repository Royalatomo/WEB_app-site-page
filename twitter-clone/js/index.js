// jshint esversion:6

const URL = "http://localhost:3000/tweet";
let nextPageUrl = null;

const onEnter = (event) => {
    if(String(event.key) === "Enter"){
        getTwitterData();
    }
};

function getTwitterData(){
    
    let querry = document.getElementById('search-input-box').value;
    if (!querry){return;}

    let mainContainer = document.getElementsByClassName('tweets-list')[0];
    while (mainContainer.firstChild){
        mainContainer.removeChild(mainContainer.childNodes[0]);
    }
    
    const encodedQuerry = encodeURIComponent(querry);
    let count = 20;
    let url = URL + `?q=${encodedQuerry}&count=${count}`;
    fetch(url).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data);
        saveNextPage(data.search_metadata);
        nextPageButton(data.search_metadata);
        data.statuses.map((tweet) => {

            const createdDate = moment(tweet.created_at).fromNow();
            let mainContainer = document.getElementsByClassName('tweets-list')[0];

            let tweetContainer = document.createElement('div');
            tweetContainer.setAttribute('class', `tweet-container`);
            tweetContainer.innerHTML = 
            
            `<div class="tweet-user-info">
                <div style="background-image: url(${tweet.user.profile_image_url})" class="profile tweet-profile"></div>
                <div class="user-info">
                    <h4>${tweet.user.name}</h4>
                    <h3>@${tweet.user.screen_name}</h3>
                </div>
            </div>
            <div class="tweet-media-content">` +
                `${makeImage(tweet)}
                ${makeVideo(tweet)}` +
            `</div>
            </div>
            <div class="tweet-text-content">${tweet.text} <a target="_blank" href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str.split('"').join('').split("'").join('')}">Read More</a>"</div>
            <div class="tweet-post-time">${createdDate}</div></div>`;

            mainContainer.appendChild(tweetContainer);
            console.log(tweet.id);

        });
    });
}


makeImage = (data) => {
    if(data.extended_entities){
        if (data.extended_entities.media && data.extended_entities.media.length > 0){
            let returnData = `<div class="images">`;
            
            data.extended_entities.media.map((media) => {
                if (media.type == "photo"){
                    returnData += `<a target="_blank" class="readMore" href="${media.media_url_https}"><div class="tweet-image" style="background-image: url(${media.media_url_https})"></div></a>`;
                }
            });
            returnData += '</div>';
            return returnData;
        }
    }
    return '';
};

makeVideo = (data) => {

    if(data.extended_entities){
        if (data.extended_entities.media && data.extended_entities.media.length > 0){
            let returnData = `<div class="video">`;
            
            data.extended_entities.media.map((media) => {
                if (media.type == "animated_gif"){
                    if (media.video_info.variants.length > 0){
                        for (let i of media.video_info.variants){
                            const videoVarient = media.video_info.variants.find((variant) => variant.content_type=="video/mp4");
                            returnData += `<video class="tweet-video" src="${videoVarient.url}" loop autoplay></video>`;
                            
                        }
                    }
                }else if(media.type == "video"){
                    if (media.video_info.variants.length > 0){
                        const videoVarient = media.video_info.variants.find((variant) => variant.content_type=="video/mp4");
                        returnData += `<video class="tweet-video" src=${videoVarient.url} controls></video>`;
                    }
                }
            });
            returnData += '</div>';
            return returnData;
        }
    }
    return '';
};

searchTag = (tag) =>{
    document.getElementById('search-input-box').value = tag;
    getTwitterData();
};

saveNextPage = (data) => {
    if (data.next_results){
        nextPageUrl = `${URL}${data.next_results}`;
    }else{
        nextPageUrl = null;
    }
};

loadNextPage = () => {
    if (nextPageUrl){
        fetch(nextPageUrl).then((response) => {
            return response.json();
        }).then((data) => {
            console.log(data);
            saveNextPage(data.search_metadata);
            data.statuses.map((tweet) => {

                const createdDate = moment(tweet.created_at).fromNow();
                let mainContainer = document.getElementsByClassName('tweets-list')[0];
    
                let tweetContainer = document.createElement('div');
                tweetContainer.setAttribute('class', `tweet-container`);
                tweetContainer.innerHTML += 
                
                `<div class="tweet-user-info">
                    <div style="background-image: url(${tweet.user.profile_image_url})" class="profile tweet-profile"></div>
                    <div class="user-info">
                        <h4>${tweet.user.name}</h4>
                        <h3>@${tweet.user.screen_name}</h3>
                    </div>
                </div>
                <div class="tweet-media-content">` +
                    `${makeImage(tweet)}
                    ${makeVideo(tweet)}` +
                `</div>
                </div>
                <div class="tweet-text-content">${tweet.text} <a target="_blank" href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str.split('"').join('').split("'").join('')}">Read More</a>"</div>
                <div class="tweet-post-time">${createdDate}</div></div>`;
    
                mainContainer.appendChild(tweetContainer);
                console.log(tweet.id);
    
            });
        });        
    }
};

nextPageButton = (data) => {
    if(data.next_results){
        document.querySelector('.next-page-container').setAttribute('style', 'display: initial');
    }else{
        document.querySelector('.next-page-container').setAttribute('style', 'display: none');
    }
};
