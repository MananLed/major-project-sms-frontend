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

  it("Tc001[7] - Invoice page view for residents", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let invoiceTcData = await readData("tc007");
    let data = await invoiceTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);
      
      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.invoiceOptionXPath));

      await driver.wait(until.urlContains("invoice"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.invoiceHeadingXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.invoiceHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedText);

      const invoiceShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Invoices shown successfully",
        value: "data:image/png;base64," + invoiceShot,
      });
    } finally {
      await driver.quit();
    }
  });

  it("Tc002[11] - Invoice page view for admin", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc001");

    let invoiceTcData = await readData("tc011");
    let data = await invoiceTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);
      
      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.invoiceOptionXPath));

      await driver.wait(until.urlContains("invoice"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.invoiceHeadingXPath)),
        15000,
      );

      await driver.wait(
        until.elementLocated(By.xpath(data.addInvoiceButtonXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.invoiceHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedText);

      const invoiceShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Invoices shown successfully",
        value: "data:image/png;base64," + invoiceShot,
      });
    } finally {
      await driver.quit();
    }
  });
});
