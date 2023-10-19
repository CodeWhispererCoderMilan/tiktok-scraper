//import configurations
var CONFIG = require('./config.json');

//connect tikAPI scrapeAPI & specific user
const TikAPI = require('tikapi').default;
const api = TikAPI(CONFIG.TiKApiKey);
const User = new api.user({
    accountKey: CONFIG.TiKAccountKey
});

//***********


//init AFFIN testing using npm package sentiment
const Sentiment = require('sentiment');
const sentiment = new Sentiment();
//***********


//connect firebase admin SDK & database using npm package firebase-admin
var admin = require("firebase-admin");

var serviceAccount = require(CONFIG.PathToFirebaseCredentials);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: CONFIG.firebaseDbUrl
});
var db = admin.database();

//***********


/*
Declare async function scrape that uses tikAPI to scrape tik tok For You page posts of specified user
an return data
*/
async function scrape() {
    try {
        //call tikAPI to return For You post from User with account key specified earler
        let response = await User.posts.explore();
        //data is used as a temporary variable to store all relevant posts from scraping
        var data = new Array();
        /*
        iterate thtough succsesfuly retrieved data filtering content based on
         AFINN score (must be negative, also working on multiple languages) and
         popularity (times played and ammount of comments)
         */
        for (var index = 0; index < response?.json.itemList.length; index++) {
            const AFINNscoreEnglish = sentiment.analyze(response?.json.itemList[index].desc, 'en').score;
            //const AFINNscoreArabic = sentiment.analyze(JSON.stringify(response?.json.itemList[index].desc),'ara').score;
            //const AFINNscorePersian = sentiment.analyze(JSON.stringify(response?.json.itemList[index].desc),'fa').score;
            if (
                (Number(JSON.stringify(response?.json.itemList[index].stats.commentCount)) > 10) &&
                (Number(JSON.stringify(response?.json.itemList[index].stats.playCount)) > 20) &&
                ((AFINNscoreEnglish < 0)/*||(AFINNscorePersian < 0)||(AFINNscoreArabic < 0)*/)

            ) {
                //convert UNIX date to local date and time
                var date = new Date((response?.json.itemList[index].createTime)*1000);
                //push relevant scraped data to data array declared earlier
                data.push({
                    author: JSON.stringify(response?.json.itemList[index].author.uniqueId),
                    authorLink: 'https://www.tiktok.com/' + response?.json.itemList[index].author.uniqueId,
                    commentsCount: JSON.stringify(response?.json.itemList[index].stats.commentCount),
                    createdAt: JSON.stringify(date.toLocaleDateString("default")+'  '+ date.toLocaleTimeString("default") + ' local time'),
                    description: JSON.stringify(response?.json.itemList[index].desc),
                    enriched: false,
                    imageURL: JSON.stringify(response?.json.itemList[index].video.cover),
                    likesCount: JSON.stringify(response?.json.itemList[index].stats.diggCount),
                    location: '',
                    socialMedia: 'tiktok',
                    type: 'post',
                    uid: JSON.stringify(response?.json.itemList[index].author.uniqueId),
                    url: 'https://www.tiktok.com/' + response?.json.itemList[index].author.uniqueId + '/' + response?.json.itemList[index].id,
                    videoUrl: 'https://www.tiktok.com/' + response?.json.itemList[index].author.uniqueId + '/' + response?.json.itemList[index].id,
                })
            }
        }
        //after filtering of all scraped data through iteration is complete return relevant posts
        return data;
    }
    //catch returns relevant error, interrupting process and returning relevant error data
    catch (err) {
        return (err?.statusCode, err?.message, err?.json);
    }
};


/*
Declare async recursive function scraper to scrape periodically, and, once scrape is complete, push data returned by scrape to
firebase db
*/

function scraper() {
        //attempt scraping, wait for completion, then send returned result to firebase DB one by one through update method
        try{
        scrape()
            .then((result) => {
                var failIndex=0;
                var successIndex=0;
                var postQuant=result.length;
                for (var index = 0; index < result.length; index++){
                    db.ref('/posts').push(result[index])
                    .then((success)=>{
                        console.log('posts sussessfuly scraped: '+ successIndex.toString());
                        successIndex++;
                        postQuant--;
                        if(postQuant<=0){console.log('scrape complete, scraping again in 5 minutes..')};
                    })
                    .catch((err)=>{
                        console.log('posts failed to retrieve: '+failIndex.toString()+' latest error: ' + JSON.stringify(err));
                        failIndex++;
                        postQuant--;
                        if(postQuant<=0){console.log('scrape complete, scraping again in 5 minutes..')};
                    })
                    ;
                }


            })
        }
            catch(err){
                console.log('scraping failed with err:'+JSON.stringify(err));
                console.log('scraping again in 5 min...');
            };

    //After scrape wait  base on scrapeFrequency from configurations recursively repeat function
    setTimeout(scraper, CONFIG.scrapeFrequency);
};

//run infinetely looping scraper function
scraper();