# Tiktok-crawler
Manual

General:

        This here is a tiktok scraper that retrieves data from a user's fyp, using tikAPI with any linked tiktokAccount. After retrieval, scraped posts are filtered based on:
                        
                        1. # of comments
                        2. # of plays
                        3. negative AFINN score in at least 1 of multiple languages chosen by you.
                        4. Keywords, which are an array of strings you choose. If one or more are found in post description, it will be SCRAPED!!!!
                        
        After scraping relevant posts will be stored in stringified JSON in the local file(a new file is generated upon each run), the file is named "scrape_#LOCALDATE_#LOCALTIME".
        "#LOCALTIME","#LOCALDATE" represent time and date of machine hosting scraper. Upon successful writing to file , post data is shown in terminal. 
        Upon Completion of first round of scraping, scraper waits and interval of time, set by you, then scrapes again, recursively, endlessly streaming posts.
Supported Languages:

        "af","am","ar","az","be","bg","bn","bs","ca","ceb","co","cs","cy","da","de","el","en","eo","es","et","eu","fa","fi",                                               
        "fr","fy","ga","gd","gl","gu","ha","haw","hi","hmn","hr","ht","hu","hy","id","ig","is","it","iw","ja","jw","ka","kk",         
        "km","kn","ko","ku","ky","la","lb","lo","lt","lv","mg","mi","mk","ml","mn","mr","ms","mt","my","ne","nl","no","ny", 
        "pa","pl","ps","pt","ro","ru","sd","si","sk","sl","sm","sn","so","sq","sr","st","su","sv","sw","ta","te","tg","th", 
        "tl","tr","uk","ur","uz","vi","xh","yi","yo","zh-tw","zh","zu"

Prerequisites: 

        1.Make sure you have node installed v>=10.
        2.Set up tikApi.io account as well as a tiktok account which you will link to the tikAPI console and use for scraping.
        3.Choose which AFINN language codes you will add for negative emotion filtering in said language.(go to Supported Languages)
        4. build an array of strings("keywords") you want to look for in post descriptions. 
        protip: u can use half a word to get multiple results("fem" will filter posts containing feminine,feminist,female)
        3.Set up configurations in config.json
                {
                    "TiKApiKey":#TIKAPI_KEY_LINKED_TO_TIKAPI_ACCOUNT,
                    "TiKAccountKey":#TIKTOK_ACCOUNT_KEY_FOUND_IN_TIK_API_DEV_CONSOLE_AT_LINKED_ACCOUNTS,
                    "scrapeFrequency":#TIME_BETWEEN_SCRAPES,
                    "keywords":[#ARRAY_OF_KEYWORDS],
                    "languages":[#ARRAY__OF_LANGUAGES],
                    "minimumComments":#MINIMUM_NUMBER_OF_COMMENTS_FOR_SCRAPED_POSTS,
                    "minimumPlays":#MINIMUM_NUMBER_OF_PLAYS_FOR_SCRAPED_POSTS
                }
        
        You're all set!

How to use:

        1.to install dependencies, from terminal:
                "npm install"
        2.to run:
                "npm start"
        3. to stop, in terminal:
                CTRL+C
 
