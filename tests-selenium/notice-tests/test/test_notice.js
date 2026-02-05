const { Builder, Browser, until, By } = require("selenium-webdriver");
const { describe, it, beforeEach, afterEach } = require("mocha");
const addContext = require("mochawesome/addContext");
const fs = require("fs");
const assert = require("assert");
const chai = require("chai").should();
const { login, readData, waitAndClick } = require("../../utils/functions");

describe("Regression Test", function () {
  beforeEach(function () {
    console.log("This is before each test - Regression Test Suite");
  });

  afterEach(function () {
    console.log("End of test");
  });

  it("Tc001[8] - Get all notices", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let noticeTcData = await readData("tc008");
    let data = await noticeTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);
      
      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.noticeOptionXPath));

      await driver.wait(until.urlContains("notice"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.noticeHeadingXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.noticeHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedText);

      const noticeShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Notices shown successfully",
        value: "data:image/png;base64," + noticeShot,
      });
    } finally {
      await driver.quit();
    }
  });
});
