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

  it("Tc001[9] - Get profile", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let profileTcData = await readData("tc009");
    let data = await profileTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.profileOptionXPath));

      await driver.wait(until.urlContains("profile"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.profileHeadingXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.profileHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedTextHeading);

      var actualText = await driver
        .findElement(By.xpath(data.profileFirstNameHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedTextFirstName);

      var actualText = await driver
        .findElement(By.xpath(data.profileMiddleNameHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedTextMiddleName);

      var actualText = await driver
        .findElement(By.xpath(data.profileLastNameHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedTextLastName);

      var actualText = await driver
        .findElement(By.xpath(data.profileEmailHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedTextEmail);

      var actualText = await driver
        .findElement(By.xpath(data.profileMobileNumberHeadingXPath))
        .getText();
      actualText.should.equal(data.expectedTextMobileNumber);

      const profileShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Profile shown successfully",
        value: "data:image/png;base64," + profileShot,
      });
    } finally {
      await driver.quit();
    }
  });
});
