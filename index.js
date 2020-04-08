const puppeteer = require('puppeteer');

// Updatable list in Object format but maybe look into CSV pull in or something
const urlList = [
    {
        name : 'Homepage',
        url : 'https://www.google.com/',
        triggerPolicy : true
    },
    {
        name : 'Landing Page',
        url : 'https://www.google.com/search?q=jawesome'
    }  
];

async function asyncForEach(array, callback) {
    for (let index=0; index < array.length; index++) {
        await callback (array[index], index, array);
    }
}

async function run() {
    let browser = await puppeteer.launch({ headless: false });

    //could look into running multiple tabs/instances to speed up process https://github.com/thomasdondorf/puppeteer-cluster
    await asyncForEach(urlList, async (item) => {
        let page = await browser.newPage();        
        await page.setViewport({ width:1280, height:1024 });
        console.log(item.url);

        await page.goto(item.url, { timeout: 20000, waitUntil: 'networkidle2' });

        if (item.triggerPolicy) {
            // yeah temperamental but decent for my needs so far - wait out time for the common popups and overlays to show then close them out
            await page.waitFor(1000);
            // Run through and trigger needed buttons for overlays to get them out of the way
            // Do note this errors out if they don't exist and will be custom for each site
            // await page.click('#cookiescript_accept');
        }
        // give the page some time to cool down in case there are animations from closing out the policies, etc.
        await page.waitFor(500);
        await page.screenshot({ path: `./images/${item.name}-screenshot-desktop-1280.jpg`, type: 'jpeg' });
        
        // Can be tried out but technically is not true 400% zoom at 1280x1024 and I have seen discrepencies
        // await page.setViewport({
        //     width: 320,
        //     height: 256,
        //     deviceScaleFactor: 4
        // });
        // Setting the device scale definitely requires a reload
        // await page.reload();
        // await page.waitFor(1000);

        await page.emulate(puppeteer.devices['iPhone 8']);
        // haven't tested differences but assume emulate might work best once reloaded
        await page.reload();
        await page.waitFor(1000);
        //commenting out zoom since it doesn't seem like it is good enough but can dive deeper
        //await page.screenshot({ path: `./images/${item.name}-400-zoom.jpg`, type: 'jpeg' });
        await page.screenshot({ path: `./images/${item.name}-screenshot-iphone8.jpg`, type: 'jpeg' });
        await page.close();
    });
    await browser.close();
}

run();