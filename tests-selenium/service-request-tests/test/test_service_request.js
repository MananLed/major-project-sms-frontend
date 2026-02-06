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

  it("Tc001[12] - Service request page view for resident", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let serviceRequestTcData = await readData("tc012");
    let data = serviceRequestTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.requestOptionXPath));

      await driver.wait(until.urlContains("request"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.totalRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.totalRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedTotalRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.completedRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.completedRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedCompletedRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.pendingRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.pendingRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedPendingRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.approvedRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.approvedRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedApprovedRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.filterRequestsTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.filterRequestsTextXPath))
        .getText();

      actualText.should.equal(data.expectedFilterRequestsText);

      await driver.wait(
        until.elementLocated(By.xpath(data.searchRequestButtonXPath)),
        15000,
      );
      await driver.wait(
        until.elementLocated(By.xpath(data.issueRequestButtonXPath)),
        15000,
      );

      const requestShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Requests shown successfully",
        value: "data:image/png;base64," + requestShot,
      });
    } finally {
      await driver.quit();
    }
  });

  it("Tc002[13] - Service request page view for admin", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc001");

    let serviceRequestTcData = await readData("tc013");
    let data = serviceRequestTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.requestOptionXPath));

      await driver.wait(until.urlContains("request"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.totalRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.totalRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedTotalRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.completedRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.completedRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedCompletedRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.pendingRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.pendingRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedPendingRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.approvedRequestTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.approvedRequestTextXPath))
        .getText();

      actualText.should.equal(data.expectedApprovedRequestText);

      await driver.wait(
        until.elementLocated(By.xpath(data.filterRequestsTextXPath)),
        15000,
      );

      var actualText = await driver
        .findElement(By.xpath(data.filterRequestsTextXPath))
        .getText();

      actualText.should.equal(data.expectedFilterRequestsText);

      await driver.wait(
        until.elementLocated(By.xpath(data.searchRequestButtonXPath)),
        15000,
      );

      const requestShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Requests shown successfully",
        value: "data:image/png;base64," + requestShot,
      });
    } finally {
      await driver.quit();
    }
  });

  it("TC003[14] - Booking Request flow", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcDataResident = await readData("tc004");
    let tcDataAdmin = await readData("tc001");

    let serviceRequestTcData = await readData("tc014");
    let data = serviceRequestTcData.data;

    try {
      await login(driver, tcDataResident.data.username, tcDataResident.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.requestOptionXPath));

      await driver.wait(until.urlContains("request"), 15000);

      await waitAndClick(driver, By.xpath(data.issueRequestButtonXPath));

      await selectFromDropdown(driver, By.css(data.selectServiceTypeCSSSelector));

      await selectFromDropdown(driver, By.css(data.selectTimeSlotCSSSelector));

      await waitAndClick(driver, By.xpath(data.submitButtonXpath));

      await driver.sleep(5000);

      const requestShotBooked = await driver.takeScreenshot();
      addContext(this, {
        title: "Requests booked successfully",
        value: "data:image/png;base64," + requestShotBooked,
      });

      await driver.sleep(2000);

      await waitAndClick(driver, By.xpath(data.logoutButtonXPath))
      
      await driver.wait(until.urlContains("login"), 15000);

      await login(driver, tcDataAdmin.data.username, tcDataAdmin.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.requestOptionXPath));

      await driver.wait(until.urlContains("request"), 15000);

      await driver.sleep(6000);

      const approveButtonVisible = await driver.takeScreenshot();
      addContext(this, {
        title: "Approve button shown successfully",
        value: "data:image/png;base64," + approveButtonVisible,
      });

      await driver.wait(
        until.elementLocated(By.xpath(data.approveButtonXPath)),
        15000,
      );

      await waitAndClick(driver, By.xpath(data.approveButtonXPath));

      await driver.sleep(6000);

      const approveDialogShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Approve dialog shown successfully",
        value: "data:image/png;base64," + approveDialogShot,
      });

      const approvedInput = await driver.wait(
        until.elementLocated(By.xpath(data.assignedToInputXPath)),
        15000
      );

      await driver.wait(until.elementIsVisible(approvedInput), 15000);

      await approvedInput.sendKeys(data.assignedToInput);

      await waitAndClick(driver, By.xpath(data.assignedToApproveButtonXPath))

      await driver.sleep(6000);

      const approvedRequestShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Request approved shown successfully",
        value: "data:image/png;base64," + approvedRequestShot,
      });

      await driver.sleep(6000);

      await driver.wait(
        until.elementLocated(By.xpath(data.completeRequestButtonXPath)),
        15000,
      );

      await waitAndClick(driver, By.xpath(data.completeRequestButtonXPath));

      await driver.sleep(6000);

      const completeRequestShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Request completed successfully",
        value: "data:image/png;base64," + completeRequestShot,
      });

      await driver.sleep(6000);

      await waitAndClick(driver, By.xpath(data.logoutButtonXPath))

      await driver.wait(until.urlContains("login"), 15000);

      await login(driver, tcDataResident.data.username, tcDataResident.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.requestOptionXPath));

      await driver.wait(until.urlContains("request"), 15000);

      await driver.wait(
        until.elementLocated(By.xpath(data.feedbackButtonXPath)),
        15000,
      );

      await driver.sleep(6000);
      
      const feedbackButtonVisibleShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Feedback button shown successfully",
        value: "data:image/png;base64," + feedbackButtonVisibleShot,
      });
    } finally {
      await driver.quit();
    }
  })

  it("Tc004[5] - Resident books another service request and get error", async function () {
    const edge = require("selenium-webdriver/edge");
    const options = new edge.Options();
    options.addArguments("--start-maximized");

    const driver = await new Builder()
      .forBrowser(Browser.EDGE)
      .setEdgeOptions(options)
      .build();

    let tcData = await readData("tc004");

    let serviceRequestTcData = await readData("tc005");
    let data = serviceRequestTcData.data;

    try {
      await login(driver, tcData.data.username, tcData.data.password);

      await driver.wait(until.urlContains("dashboard"), 15000);

      await waitAndClick(driver, By.xpath(data.requestOptionXPath));

      await driver.wait(until.urlContains("request"), 15000);

      await waitAndClick(driver, By.xpath(data.issueRequestButtonXPath));

      await selectFromDropdown(driver, By.css(data.selectServiceTypeCSSSelector));

      await selectFromDropdown(driver, By.css(data.selectTimeSlotCSSSelector));

      await waitAndClick(driver, By.xpath(data.submitButtonXpath));

      await driver.sleep(1000);

      const requestShot = await driver.takeScreenshot();
      addContext(this, {
        title: "Request booking gets error",
        value: "data:image/png;base64," + requestShot,
      });
    } finally {
      await driver.quit();
    }
  });
});
