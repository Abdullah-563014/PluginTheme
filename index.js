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


let allData = [];
var page;

startScrapping();

async function startScrapping() {
    const browser = await puppeteer.launch({
        headless: false ,
        product: 'chrome',
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 700 });
    await page.setCookie(...cookies);


    let pageInfo = await loadProductListingPageAndGetInfo(wordpressThemePage);

    console.log("==================================================");
    console.log("==================================================");
    console.log("==================================================");
    allData.push(...pageInfo);
    allData.pop();


    if(pageInfo.length) {
      for(let i =0; i <pageInfo.length-1; i++) {
        let info = await loadProductDetailsPageAndGetInfo(pageInfo[i].productDetailsUrl);
        pageInfo[i].shortTitle = info.shortTitle;
        pageInfo[i].downloadLink = info.downloadLink;
        pageInfo[i].shortDescription = info.shortDescription;
        pageInfo[i].lognDescription = info.lognDescription;
      }
    }
    console.log(pageInfo);

    // writeDataToCsv();
    
    await page.screenshot({
        path: "./screenshot.png",
        fullPage: true
    });
    // console.log(results);
    // await browser.close();
}


async function loadProductListingPageAndGetInfo(pageUrl) {
  
  await page.goto(pageUrl, {
      timeout: 900000,
      waitUntil: 'networkidle0',
  });

  const pageInfo = await page.evaluate(async () => {
    let allInfo = [];

    const products = document.querySelectorAll(".products .product-small+.product");
    for (let i = 0; i< products.length; i++) {
      const singleProduct = products[i];
      const category = singleProduct.querySelector(".category").innerText;
      const imageUrl = singleProduct.querySelector(".box-image img.attachment-woocommerce_thumbnail").src;
      const productDetailsUrl = singleProduct.querySelector(".box-image a").href;
      const title = singleProduct.querySelector("p.product-title a").innerText;
      let rating;
      let originalPrice;
      let discountedPrice;
      try {
        rating = singleProduct.querySelector(".price-wrapper .rating").innerText;
        const priceRoot = singleProduct.querySelectorAll(".price-wrapper .price .woocommerce-Price-amount");
        originalPrice = priceRoot[0].innerText;
        discountedPrice = priceRoot[1].innerText;
      } catch(e) {
        console.log(e.message);
      }
      const singleInfo = {
        category: category,
        imageUrl: imageUrl,
        productDetailsUrl: productDetailsUrl,
        title: title,
        rating: rating,
        originalPrice: originalPrice ? originalPrice : "0",
        discountedPrice: discountedPrice ? discountedPrice : "0"
      };
      allInfo.push(singleInfo);
    }

    
    let isAvailableNextPage = document.querySelector("a.next.page-number");
    if(isAvailableNextPage) {
      allInfo.push({
        status: true,
        link: isAvailableNextPage.href
      });
    } else {
      allInfo.push({
        status: false,
        link: ""
      });
    }

    return allInfo;
  });

  return pageInfo;
}


async function loadProductDetailsPageAndGetInfo(pageUrl) {
  
  await page.goto(pageUrl, {
      timeout: 900000,
      // waitUntil: 'networkidle0',
  });

  const pageInfo = await page.evaluate(async () => {

    let shortTitle = "";
    let shortDescription = "";
    let downloadLink = "";
    let lognDescription = "";
    try {
      shortTitle = document.querySelector(".product-title").innerText;
      shortDescription = document.querySelector(".product-short-description ul").outerHTML;
      downloadLink = document.querySelector(".product-short-description a.red-link").href;
      if(document.getElementById("tab-description")) {
        lognDescription = document.getElementById("tab-description").innerHTML;
      }
    } catch(e) {
      console.log(e.message);
    }
    const details = {
      shortTitle: shortTitle ? shortTitle : "",
      shortDescription: shortDescription ? shortDescription : "",
      downloadLink: downloadLink ? downloadLink : "",
      lognDescription: lognDescription ? lognDescription : "",
    };

    return details;
  });

  return pageInfo;
}






// function writeDataToCsv() {
//   const csvWriter = createCsvWriter({
//     path: 'out.csv',
//     header: [
//       {id: 'name', title: 'Name'},
//       {id: 'surname', title: 'Surname'},
//       {id: 'age', title: 'Age'},
//       {id: 'gender', title: 'Gender'},
//     ]
//   });

//   const data = [
//     {
//       name: 'John',
//       surname: 'Snow',
//       age: 26,
//       gender: 'M'
//     }, {
//       name: 'Clair',
//       surname: 'White',
//       age: 33,
//       gender: 'F',
//     }, {
//       name: 'Fancy',
//       surname: 'Brown',
//       age: 78,
//       gender: 'F'
//     }
//   ];

//   csvWriter.writeRecords(data).then(()=> console.log('The CSV file was written successfully'));

// }




