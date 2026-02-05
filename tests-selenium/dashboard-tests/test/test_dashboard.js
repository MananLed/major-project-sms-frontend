const { Builder, Browser, until, By } = require("selenium-webdriver");
const { describe, it, beforeEach, afterEach } = require("mocha");
const addContext = require("mochawesome/addContext");
const fs = require("fs");
const assert = require("assert");
const chai = require("chai").should();
const { login, readData } = require("../../utils/functions");

describe("Regression Test", function () {
  beforeEach(function () {
    console.log("This is before each test - Regression Test Suite");
  });

  afterEach(function () {
    console.log("End of test");
  });

  it("Tc001[3] - Dashboard is having correct format for admin", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc003");

    const expectedText = tcData.data.expectedText;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath("//b[normalize-space()='UpKeepz']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='heading']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='pending']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='approved']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='residents']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='officers']")),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath("//b[normalize-space()='UpKeepz']"))
        .getText();
      actualText.should.equal(expectedText);
      const finalShotB64 = await driver.takeScreenshot();
      addContext(this, {
        title: "Final Screenshot (TC001[3])",
        value: "data:image/png;base64," + finalShotB64,
      });
    } finally {
      await driver.quit();
    }
  });

  it("Tc002[4] - Dashboard is having correct format for other users who are not admin", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    const expectedText = tcData.data.expectedText;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath("//b[normalize-space()='UpKeepz']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='heading']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='pending']")),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath("//div[@class='approved']")),
        15000,
      );
      const elementResident = await driver.findElements(
        By.xpath("//div[@class='residents']"),
      );

      assert.strictEqual(
        elementResident.length,
        0,
        "Element should not be present",
      );

      const elementOfficer = await driver.findElements(
        By.xpath("//div[@class='officers']"),
      );
      assert.strictEqual(
        elementOfficer.length,
        0,
        "Element should not be present",
      );

      var actualText = await driver
        .findElement(By.xpath("//b[normalize-space()='UpKeepz']"))
        .getText();
      actualText.should.equal(expectedText);
      const finalShotB64 = await driver.takeScreenshot();
      addContext(this, {
        title: "Final Screenshot (TC002[4])",
        value: "data:image/png;base64," + finalShotB64,
      });
    } finally {
      await driver.quit();
    }
  });
});
