const { Builder, Browser, until, By } = require("selenium-webdriver");
const { describe, it, beforeEach, afterEach } = require("mocha");
const addContext = require("mochawesome/addContext");
const fs = require("fs");
const assert = require("assert");
const chai = require("chai").should();
const {
  login,
  readData,
  waitAndClick,
  selectFromDropdown,
} = require("../../utils/functions");

describe("Regression Test", function () {
  beforeEach(function () {
    console.log("This is before each test - Regression Test Suite");
  });

  afterEach(function () {
    console.log("End of test");
  });

  it("Tc001[5] - Book a request", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let requestTcData = await readData("tc005");
    let xpaths = await requestTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await waitAndClick(driver, By.xpath(xpaths.requestOptionXPath));

      await waitAndClick(driver, By.xpath(xpaths.issueRequestButtonXPath));

      await selectFromDropdown(driver, By.xpath(xpaths.selectServiceTypeXPath));

      await selectFromDropdown(driver, By.xpath(xpaths.selectTimeSlotXPath));

      await driver.wait(async () => true, 5000);

      await waitAndClick(driver, By.xpath(xpaths.submitButtonXpath));

      const bookingRow = await driver.wait(
        until.elementLocated(
          By.xpath("//tr[.//td[contains(text(),'Electrician')]]"),
        ),
        15000,
      );

      await driver.wait(until.elementIsVisible(bookingRow), 15000);

      const bookingShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Booking Request Added to Table",
        value: "data:image/png;base64," + bookingShot,
      });
    } finally {
      await driver.quit();
    }
  });
});
