const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");

(async () => {
  dotenv.config();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const homeDepotUrl =
    "https://www.homedepot.com/p/Schlage-Century-Matte-Black-Electronic-Encode-Plus-Smart-Wifi-Deadbolt-BE499WB-CEN-622/318246633";
  const lowesUrl = "https://www.lowes.com/pd/Schlage/5013345101";

  // Check if in stock at Home Depot
  await page.goto(homeDepotUrl);
  await page.waitForSelector(".buybox__card .bttn__content");
  const element = await page.$(".buybox__card .bttn__content");
  let value = await page.evaluate((el) => el.textContent, element);

  if (value === "Add to Cart") {
    sendEmail("Home Depot", homeDepotUrl);
  }

  // Check if in stock at Lowes
  await page.goto(lowesUrl);
  if (
    (await page.$("#atc > div.atc-buy-box > div > div > button > span")) !==
    null
  ) {
    sendEmail("Lowe's", lowesUrl);
  }

  await browser.close();
})();

const sendEmail = (store, url) => {
  sgMail.setApiKey(process.env.EMAIL_KEY);
  const msg = {
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: `Schlage Encode Plus is in stock at ${store}`,
    html: `
            <h1><strong></strong></h1>
            <a href="${url}">Buy it here before it goes out of stock!</a>
            <p>Regards,</p>
            <p>Max's "schlage-bot"</p>`,
  };
  sgMail.send(msg);
};
