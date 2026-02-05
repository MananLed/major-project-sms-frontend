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

  it("Tc001 - Allow a valid user to login to BookStore", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
        .forBrowser(Browser.EDGE)
        .setEdgeOptions(options)
        .build();

    let tcData = await readData("tc001");

    const expectedText = tcData.data.expectedText;

    try {
        await login(driver, tcData.data.username, tcData.data.password);

        
        await driver.wait(until.urlContains("dashboard"), 15000);
        
        await driver.wait(
          until.elementLocated(By.xpath("//b[normalize-space()='UpKeepz']")),
          15000
        );
        
        var actualText = await driver.findElement(By.xpath("//b[normalize-space()='UpKeepz']")).getText();
        actualText.should.equal(expectedText);
        const finalShotB64 = await driver.takeScreenshot();
        addContext(this, {
          title: "Final Screenshot (TC001)",
          value: "data:image/png;base64," + finalShotB64
        });
      } finally {
        await driver.quit();
    }
  });
  it("Tc002 - Prevent user with invalid credentials to login", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
        .forBrowser(Browser.EDGE)
        .setEdgeOptions(options)
        .build();

    let tcData = await readData("tc002");

    try {
        await login(driver, tcData.data.username, tcData.data.password);

        const errorMsg = await driver.wait(
            until.elementLocated(By.xpath("//p[@class='control-error']")),
            15000
        );
        await driver.wait(until.elementIsVisible(errorMsg), 15000);

        const errorText = await errorMsg.getText();

        assert.strictEqual(
            errorText.trim(),
            "Invalid credentials",
            "Expected 'Invalid credentials' message not shown"
        );

        const finalShotB64 = await driver.takeScreenshot();
        addContext(this, {
            title: "Invalid Credentials Message",
            value: "data:image/png;base64," + finalShotB64
        });

    } finally {
        await driver.quit();
    }
  });
});