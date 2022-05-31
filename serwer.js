const express = require('express')
const path = require('path')
const axios = require('axios')
const bodyParser = require('body-parser')
const { json } = require('express/lib/response')
const PORT = process.env.PORT || 3000

const app = express()
const siteRegex = /https?:\/\/(www.)?[-a-zA-Z0-9+@:%.~#()=]+.[a-zA-Z0-9]+([-a-zA-Z0-9()@:%\/\/_=+.~#?&]*)/g;
const mailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi

app.use(bodyParser.text());
app.use(express.static("static"))
app.use((req, res, next) => {

    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'application/json');
    next();
});

app.listen(PORT, () => { });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})
app.get("/styles.css", (req, res) => {
    res.sendFile(path.join(__dirname, "styles.css"))
})
// res.set({
//     'Access-Control-Allow-Origin': ["*"],
//     'Access-Control-Allow-Headers': "*",
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'

// })


let nowSearch = ""
let myWebs = []
let myMails = []

const startSearch = async (site, recurention) => {

    const response = await axios.get(site)
    const data = await response.data
    //console.log(data)
    const websiteArray = []
    // console.log(recurention)

    console.log(nowSearch)
    // console.log("######################################################################################################################################################################");
    if (1 < recurention) {
        try {

            recurention--
            //console.log(data.match(siteRegex))

            if (data.match(siteRegex).length > 10) {
                for (let i = 0; i < 10; i++) {
                    websiteArray.push(data.match(siteRegex)[i])
                }

            } else {
                data.match(siteRegex).forEach((link) => {
                    websiteArray.push(link)
                })

            }

            for (let i = 0; i < websiteArray.length; i++) {
                if (!myWebs.includes(websiteArray[i])) {
                    myWebs.push(websiteArray[i])

                }
            }
            if (data.match(mailRegex) != null) {
                for (let i = 0; i < data.match(mailRegex).length; i++) {

                    if (!myMails
                        .includes(data.match(mailRegex)[i])) {
                        myMails
                            .push(data.match(mailRegex)[i])
                    }

                }
            }
            websiteArray.forEach(element => {
                startSearch(element, recurention)
            });
            // for (let i = 0; i < websiteArray.length; i++) {
            //     startSearch(data.match(siteRegex)[i], recurention)
            // }
        }
        catch (error) {
            //console.log(error);
        }
    }



}


// startSearch("https://www.onet.pl/", 2)

app.post("/postData", (req, res) => {

    myWebs = []
    myMails = []
    nowSearch = JSON.parse(req.body).content
    startSearch(JSON.parse(req.body).content, parseInt(JSON.parse(req.body).deph))

    // const data = {
    //     mails: "myMails",
    //     webs: "myWebs"
    // }
    // res.send(JSON.stringify(data))

})

app.get("/getData", (req, res) => {

    const data = {
        mails: myMails,
        webs: myWebs
    }
    res.send(JSON.stringify(data))

})