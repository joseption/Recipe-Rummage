const request = require('request');
const cheerio = require('cheerio');

request('https://crawler-test.com/', (error, response, html) => {
    if(!error && response.statusCode == 200) {
        const $ = cheerio.load(html);

        const siteHeading = $('.panel');

        // console.log(siteHeading.html());
        // console.log(siteHeading.text());
        
        const output = siteHeading.find('h1').text();

        $('.panel').each(( index, element ) => {
            const item = $(element).text();
            const link = $(element).attr('href');

            console.log(link);
        });

    }


});