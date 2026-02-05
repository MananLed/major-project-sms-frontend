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

  it("Tc001[6] - Get all feedbacks", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let feedbackTcData = await readData("tc006");
    let data = await feedbackTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);
      
      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.feedbackOptionXPath));

      await driver.wait(until.urlContains("feedback"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.feedbackHeadingXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.feedbackHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedText);

      const feedbackShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Feedbacks shown successfully",
        value: "data:image/png;base64," + feedbackShot,
      });
    } finally {
      await driver.quit();
    }
  });
});
