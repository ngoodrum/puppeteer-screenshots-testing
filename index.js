const fs = require('fs');
const rimraf = require('rimraf');
const argv = require('minimist')(process.argv.slice(2));
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
// wherever you want them
const assetFolder = argv['dest'] || './images';
const file = argv['file'] || "demo.xlsx";

// Maybe if you don't want to do it CSV style
const localList = [
    {
        page : 'Homepage',
        URL : 'https://www.google.com/',
        triggers : 'input[autofocus], body'
    },
    {
        page : 'Landing Page',
        URL : 'https://www.google.com/search?q=jawesome'
    }
];

async function asyncForEach(array, callback) {
    for (let index=0; index < array.length; index++) {
        await callback (array[index], index, array);
    }
}

async function run(urlList) {
    let browser = await puppeteer.launch({ headless: false });

    //could look into running multiple tabs/instances to speed up process https://github.com/thomasdondorf/puppeteer-cluster
    await asyncForEach(urlList, async (item) => {
        let page = await browser.newPage();
        await page.setViewport({ width:1280, height:1024 });
        console.log(item.page, item.URL);

        await page.goto(item.URL, { timeout: 20000, waitUntil: 'networkidle2' });

        if (item.triggers) {
            // yeah temperamental but decent for my needs so far - wait out time for the common popups and overlays to show then close them out
            await page.waitFor(1000);
            // Run through and trigger needed buttons for overlays and the like to get them out of the way
            // Bypassing errors in case trigger selectors in html don't exist
            const triggers = item.triggers.split(',');

            await asyncForEach(triggers, async (trigger) => {
                await page.click(trigger).catch(()=>{});
            });
        }
        // give the page some time to cool down in case there are animations from load or closing out policies
        await page.waitFor(500);
        await page.screenshot({ path: `./images/${item.page}-screenshot-desktop-1280.jpg`, type: 'jpeg' });
        
        // Can be tried out but technically is not true 400% zoom at 1280x1024 and I have seen discrepencies
        // if (page.zoom) { //maybe have it be a flag?
        //     await page.setViewport({
        //         width: 320,
        //         height: 256,
        //         deviceScaleFactor: 4
        //     });
        //     Setting the device scale definitely requires a reload
        //     await page.reload();
        //     await page.waitFor(1000);
        //     commenting out zoom since it doesn't seem like it is good enough but can dive deeper
        //     await page.screenshot({ path: `./images/${item.name}-400-zoom.jpg`, type: 'jpeg' });
        // }

        await page.emulate(puppeteer.devices['iPhone 8']);
        // haven't tested differences but assume emulate might work best once reloaded
        await page.reload();
        await page.waitFor(500);
        await page.screenshot({ path: `./images/${item.page}-screenshot-iphone8.jpg`, type: 'jpeg' });
        await page.close();
    });
    await browser.close();
}

async function createListRun(xlsx){
    const workbook = XLSX.readFile(xlsx);
    let pageList = [];
    console.log(workbook.SheetNames);

    await asyncForEach(workbook.SheetNames, async (sheetName) => {
        console.log('doing',sheetName);
        const jsonArray = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        jsonArray.forEach( (item) => {
            item.page = `${sheetName} - ${item.page}`;
        });
        pageList.push(...jsonArray);
    });

    run(pageList);
}

// yeah syncronous - you want to fight about it?
if ( ! fs.existsSync(assetFolder) ) {
    fs.mkdirSync(assetFolder);
}
// keeping sync style for cleanup as well 
if ( argv['clean'] ) {
    rimraf.sync(assetFolder + '/*');
}

if ( fs.existsSync(file) && ! argv['nosheets']) {
    createListRun(file);
} else {
    run(localList);
}