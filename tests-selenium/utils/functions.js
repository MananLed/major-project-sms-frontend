var { By, until, Key } = require("selenium-webdriver");
var fs = require("fs");

var readData = async function (tcName) {
    const content = fs.readFileSync("../data/data.json");
    const obj = JSON.parse(content);

    return obj.find(o => o.testName === tcName);
};

var login = async function (driver, username, password) {

    const globalData = await readData("global");

    await driver.get(globalData.data.url);

    const emailInput = await driver.wait(
        until.elementLocated(By.xpath("//input[@id='Email']")),
        15000
    );
    await driver.wait(until.elementIsVisible(emailInput), 15000);
    await emailInput.sendKeys(username);

    const passwordInput = await driver.wait(
        until.elementLocated(By.xpath("//input[@id='Password']")),
        15000
    );
    await passwordInput.sendKeys(password);

    const loginBtn = await driver.wait(
        until.elementLocated(By.xpath("//span[@class='p-button-label']")),
        15000
    );
    await driver.wait(until.elementIsEnabled(loginBtn), 15000);
    await loginBtn.click();
};

var waitAndClick = async function (driver, locator, timeout = 15000) {
    const element = await driver.wait(
        until.elementLocated(locator),
        timeout
    );
    await driver.wait(until.elementIsVisible(element), timeout);
    await driver.wait(until.elementIsEnabled(element), timeout);
    await element.click();
    return element;
}

var selectFromDropdown = async function (driver, dropdownLocator, timeout = 15000) {
    const dropdown = await waitAndClick(driver, dropdownLocator, timeout);

    await driver.wait(async () => true, 5000);

    await dropdown.sendKeys(Key.ARROW_DOWN);
    await dropdown.sendKeys(Key.ENTER);
}



module.exports = {
    login,
    readData,
    waitAndClick,
    selectFromDropdown
};
