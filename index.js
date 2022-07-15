const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


let wordpressThemePage="https://plugintheme.net/product-category/wordpress-themes/";

const cookies = [
    {
        'name': 'wordpress_logged_in_6e6b7bea34744ce4fa04edb11e766e6c',
        'value': 'oneurself200%40gmail.com%7C1658735874%7Cm8pO3dxG2ttN9HoLDEJRcLekNX9MhE30lGB2lpEucJR%7Cb5789e1ea1d6ab52384bcfd4cd91ebebcfb26f4a5a467dd9758d6bd92da3c904',
        'domain': 'plugintheme.net',
        'path': '/'
    }
];


let allData = [];
var page;

initAll();



async function initAll() {
    const browser = await puppeteer.launch({
        headless: false ,
        product: 'chrome',
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 700 });
    await page.setCookie(...cookies);

    await startScrapping();
}

async function startScrapping() {

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
        pageInfo[i].demoLink = info.demoLink;
        pageInfo[i].downloadLink = info.downloadLink;
        pageInfo[i].shortDescription = info.shortDescription;
        pageInfo[i].lognDescription = info.lognDescription;
      }
    }
    console.log(pageInfo);
    if (pageInfo[pageInfo.length - 1].status) {
      wordpressThemePage = pageInfo[pageInfo.length - 1].link;
      startScrapping();
      // await startScrapping();
      return;
    }

    console.log(`total data size is:- ${allData.length}========================================================`);
    console.log(`total data size is:- ${allData.length}========================================================`);
    console.log(`total data size is:- ${allData.length}========================================================`);
    writeDataToCsv(allData);
    
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
    let demoLink = "";
    let downloadLink = "";
    let lognDescription = "";
    try {
      shortTitle = document.querySelector(".product-title").innerText;
      shortDescription = document.querySelector(".product-short-description ul").outerHTML;
      demoLink = document.querySelector(".product-short-description a.grey-link").href;
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
      demoLink: demoLink ? demoLink : "",
      downloadLink: downloadLink ? downloadLink : "",
      lognDescription: lognDescription ? lognDescription : "",
    };

    return details;
  });

  return pageInfo;
}






function writeDataToCsv(targetData) {
  const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
      {id: 'category', title: 'Category'},
      {id: 'imageUrl', title: 'ImageUrl'},
      {id: 'productDetailsUrl', title: 'ProductDetailsUrl'},
      {id: 'title', title: 'Title'},
      {id: 'originalPrice', title: 'OriginalPrice'},
      {id: 'discountedPrice', title: 'DiscountedPrice'},
      {id: 'shortTitle', title: 'ShortTitle'},
      {id: 'demoLink', title: 'DemoLink'},
      {id: 'downloadLink', title: 'DownloadLink'},
      {id: 'shortDescription', title: 'ShortDescription'},
      {id: 'lognDescription', title: 'LognDescription'},
    ]
  });

  const data = [targetData];

  csvWriter.writeRecords(targetData).then(()=> console.log('The CSV file was written successfully'));

}




