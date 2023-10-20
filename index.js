//file read/write API
const fs = require('fs');

//import configurations
var CONFIG = require('./config.json');

//time
const date= new Date();

//emojo library
const emoji = require('node-emoji');

//connect tikAPI scrapeAPI & specific user
const TikAPI = require('tikapi').default;
const api = TikAPI(CONFIG.TikApiKey);
const User = new api.user({
    accountKey: CONFIG.TikAccountKey
});

//***********

//scrape counter
var scrapeNr = 0;
//***********
//init AFFIN testing using npm package sentiment
const sentiment = require('multilang-sentiment');


//***********

//AFINN function for checking if text has negative emotion in any of multiple languages
function AFINN(text, languages){
    var bool = false;
    for (l in languages){
        const aux = bool || (sentiment(text, languages[l]).score<0);
        bool =aux;
    }
    return bool;
}

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
        iterate through succsesfuly retrieved data filtering content based on
         AFINN score (must be negative, also working on multiple languages) and
         popularity (times played and ammount of comments)
         */
        for (var index = 0; index < response?.json.itemList.length; index++) {
            const description = response?.json.itemList[index].desc;
            //boolean checking negative emotion in description
            const AFINNisNegative =AFINN(description,CONFIG.languages);
            //boolean check if post has at least one of these keywords
            const hasKeywords = CONFIG.keywords.some(word => description.includes(word));
            //if that filters posts that fulfill AGINN , keywords, commentcount, playcount
            if (
                (Number(response?.json.itemList[index].stats.commentCount) > CONFIG.minimumComments) &&
                (Number(response?.json.itemList[index].stats.playCount) > CONFIG.minimumPlays) &&
                AFINNisNegative && hasKeywords
            ) {
                //convert UNIX date to local date and time
                var date = new Date((response?.json.itemList[index].createTime)*1000);
                //push relevant scraped data to data array declared earlier
                data.push({
                    author: response?.json.itemList[index].author.uniqueId,
                    authorLink: 'https://www.tiktok.com/@' + response?.json.itemList[index].author.uniqueId,
                    commentsCount: response?.json.itemList[index].stats.commentCount,
                    createdAt: date.toLocaleDateString("default")+"  "+ date.toLocaleTimeString("default"),
                    description: description,
                    enriched: false,
                    imageURL: response?.json.itemList[index].video.cover,
                    likesCount: response?.json.itemList[index].stats.diggCount,
                    location: '',
                    socialMedia: 'tiktok',
                    type: 'post',
                    uid: response?.json.itemList[index].author.uniqueId,
                    url: 'https://www.tiktok.com/@' + response?.json.itemList[index].author.uniqueId + '/video/' + response?.json.itemList[index].id,
                    videoUrl: 'https://www.tiktok.com/@' + response?.json.itemList[index].author.uniqueId + '/video/' + response?.json.itemList[index].id,
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
/*
Declare async recursive function scraper to scrape periodically,
and, once scrape is complete, write data to a new file (created 
for each run) and show data in terminal

*/

async function  scraper() {
        
        try{
                scrapeNr++;
                var failIndex=0;
                var successIndex=0;
                var postNr=1;
                result = await scrape();
                var postQuant = result?.length;
                
                for (var index = 0; index < result?.length; index++){
                   
                    fs.appendFile((
                        "scrape_"+date.getDate()+
                        "-"+date.getMonth()+"-"+date.getFullYear()+
                        "_"+date.getHours()+"-"+date.getMinutes()
                        ),(
                        "scrape nr " +scrapeNr+" tiktok post nr "+(postNr++)+ 
                        " out of "+result?.length+"\n"+JSON.stringify(result[index]) +"\n"
                    ),(err) => { 
                        if (err) { 
                            console.log('posts failed to retrieve: '+failIndex.toString()+' latest error: ' + err);
                            failIndex++;
                            postQuant--;
                            if(postQuant<=0){
                                console.log('scrape nr '+scrapeNr+' complete, scraping again in ' +(CONFIG.scrapeFrequency/60000).toFixed(2)+ ' minutes...')
                            };
                        }else{
                            console.log("scrape nr "+scrapeNr+' posts successfuly scraped: '+ (successIndex+1).toString()+", latest post:\n");
                            console.log(
                                JSON.stringify(result[result.length-postQuant])+"\n\n"
                            )
                            successIndex++;
                            postQuant--;
                            if(postQuant<=0){
                                console.log('scrape nr '+scrapeNr+' complete, scraping again in ' +(CONFIG.scrapeFrequency/60000).toFixed(2)+ ' minutes...\n')
                            };
                        }
                    });
                }
            }catch(err){
                return (err?.statusCode, err?.message, err?.json);  
            } 


    //After scrape wait  based on scrapeFrequency from configurations recursively repeat function
    setTimeout(scraper, CONFIG.scrapeFrequency);
};

//run infinetely looping scraper function
scraper();