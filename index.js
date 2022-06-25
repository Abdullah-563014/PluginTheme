const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const wordpressThemePage="https://plugintheme.net/product-category/wordpress-themes/";

const cookies = [
    {
        'name': 'wordpress_logged_in_6e6b7bea34744ce4fa04edb11e766e6c',
        'value': 'oneurself200%40gmail.com%7C1657360290%7Cbmy606TSCdw4tSVZHC14QKZGziqL2o2Oz1u4sQoQlI7%7Ca3d6aeca6004f9a83929e90f87fc4a2e4af54d7e9a9c7380f6205ceceea37ce5',
        'domain': 'plugintheme.net',
        'path': '/'
    }
];





async function main() {
    const browser = await puppeteer.launch({
         headless: false ,
         product: 'chrome',
        });
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 700 });
    await page.setCookie(...cookies);




    await page.goto(wordpressThemePage, {
        timeout: 900000,
        waitUntil: 'networkidle0',
    });








    const pageInfo = await page.evaluate(async () => {
        const products = document.querySelectorAll(".products .product-small+.product");

        

       

writeDataToCsv();



    });







    
    await page.screenshot({
        path: "./screenshot.png",
        fullPage: true
    });
    // console.log(results);
    // await browser.close();
}

// writeDataToCsv();
main();




function writeDataToCsv() {
const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [
    {id: 'name', title: 'Name'},
    {id: 'surname', title: 'Surname'},
    {id: 'age', title: 'Age'},
    {id: 'gender', title: 'Gender'},
  ]
});

const data = [
  {
    name: 'John',
    surname: 'Snow',
    age: 26,
    gender: 'M'
  }, {
    name: 'Clair',
    surname: 'White',
    age: 33,
    gender: 'F',
  }, {
    name: 'Fancy',
    surname: 'Brown',
    age: 78,
    gender: 'F'
  }
];

csvWriter.writeRecords(data).then(()=> console.log('The CSV file was written successfully'));

}




