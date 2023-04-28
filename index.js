const PORT = process.env.PORT || 3000;
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const newspapers = [
    {
        name: 'BBC News',
        id: 'bbc',
        address: 'https://www.bbc.com/news/world-60525350',
        base: 'https://www.bbc.com'
    },
    {
        name: 'The Guardian',
        id: 'guardian',
        address: 'https://www.theguardian.com/international',
        base: ''
    },
    {
        name: 'Kyiv Independent',
        id: 'kyivindependent',
        address: 'https://kyivindependent.com/',
        base: 'https://kyivindependent.com'
    },
    {
        name: 'CNN',
        id: 'cnn',
        address: 'https://edition.cnn.com/world/europe/ukraine',
        base: 'https://edition.cnn.com'
    },
    {
        name: 'AlJazeera',
        id: 'aljazeera',
        address: 'https://www.aljazeera.com/tag/ukraine-russia-crisis/',
        base: 'https://www.aljazeera.com'
    },
]

const articles = [];

app.get("/", (req, res) => {
    res.json("Welcome to my Ukraine news Api")
});

function fetchArticles() {
    newspapers.forEach(newspaper => {
        axios.get(newspaper.address)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html)

                $('a:contains("Ukraine")', html).each(function () {
                    const title = $(this).text().replace(/\s+/g, " ").trim()
                    const url = $(this).attr('href')

                    const exists = articles.some((a) => a.url === newspaper.base + url)

                    if (!exists) {
                        articles.push({
                            title,
                            url: newspaper.base + url,
                            source: newspaper.name
                        })
                    }


                })
            }).catch(err => console.log(err))
    })
}

fetchArticles()


app.get("/news", (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId

    const newspaper = newspapers.filter(newspaper => newspaper.id === newspaperId)[0]


    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("Ukraine")', html).each(function () {
                const title = $(this).text().replace(/\s+/g, " ").trim()
                const url = $(this).attr('href')
                const exists = specificArticles.some((a) => a.url === newspaper.base + url)
                if (!exists) {
                    specificArticles.push({
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name
                    })
                }

            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => {
    console.log("server started on http://localhost:" + PORT)
})
