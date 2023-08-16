import { logger } from "./logger";
import { Key } from "webdriverio";
import report from "@wdio/allure-reporter";

export class Generics {

    private _webElement!: WebdriverIO.Element;
    private _webElements!: WebdriverIO.ElementArray;
    private _webElementName = "";
    private _webElementIdentifier = "";
    private _webElementLocator = "";
    public elementTimeOut = 30 * 1000;

    public waitInSeconds = async (seconds: number) => await new Promise(resolve => setTimeout(resolve, seconds * 1000))

    public async intializeSession(): Promise<boolean> {
        if (browser.isMobile) {
            return true
        } else {
            await browser.maximizeWindow()
            return false
        }
    }
    /**
     * Stop the application
     */
    public async resetSession(): Promise<void> {
        try {
            logger.info("Close session");
            await browser.closeWindow()
            await browser.reloadSession()
        }
        catch (error) {
            logger.error(`Closing the session failed. Exception ${error}`);
        }
    }

    private testStepPassed(message: string): void {
        const result: any = true
        logger.info(message);
        console.log(message);
        report.addStep(message)
        expect(result).toBe(true);
    }

    private testStepFailed(message: string): Promise<void> {
        console.log(message)
        logger.error(message)
        report.addStep(message)
        throw new Error(message)
    }

    /**
     * The element would be given as follows:
     * Books Link#css=div#nav-xshop>a[href*='Books']`
     * Using the index of the characters '#' and '=', we are separating the element name,
     * the identifier and the locator
     * We are then assigning these to the following variables:
     * _webElementName
     * _webElementIdentifier
     * _webElementLocator
     * These global variables would then be used while identifying elements and operating on them
     * @param objectLocator e.g: Link#css=div#nav-xshop>a[href*='Books']`
    */
    private _parseAndIdentifyBy(objectLocator: string): void {
        const indexOfHash: number = objectLocator.indexOf("#");
        logger.debug(`indexOfHash = '${indexOfHash}'`);

        const indexOfEqualTo: number = objectLocator.indexOf("=");
        logger.debug(`indexOfEqualTo = '${indexOfEqualTo}'`);

        // Element name would be the part of the string starting from the first character
        // till the index of the character '#', which would be 'Books Link'
        this._webElementName = objectLocator.substring(0, indexOfHash).trim();
        logger.debug(`_webElementName = '${this._webElementName}'`);

        // Element identifier would be the part of the string starting from the character next to '#'
        // till the index of the character '=',  which would be 'css'
        this._webElementIdentifier = objectLocator.substring(indexOfHash + 1, indexOfEqualTo);
        logger.debug(`_webElementIdentifier = '${this._webElementIdentifier}'`);

        // Element locator would be the part of the string starting from the character next to '='
        // till the end, which would be 'div#nav-xshop>a[href*='Books']'
        this._webElementLocator = objectLocator.substring(indexOfEqualTo + 1);
        logger.debug(`_webElementLocator = '${this._webElementLocator}'`);

        return;

    }

    /**
     * This function would be used to find the element with the identifier and the locator.  Like the
     * 'parseAndIdentifyBy' function, this function would also be called by all the reusable functions like 'clickOn' etc.
     */
    private async _findWebElement(): Promise<WebdriverIO.Element> {
        switch (this._webElementIdentifier.toLowerCase()) {
            case "css":
                this._webElement = await $(this._webElementLocator);
                break
            case "xpath":
                this._webElement = await $(this._webElementLocator);
                break
            default:
                this.testStepFailed(`Element Identifier '${this._webElementIdentifier}' is not defined in findWebElement`)
                break;
        }
        return this._webElement;
    }

    // This function would be used to find the elements with the identifier and the locator.  Unlike the
    // 'findWebElement' function, this function would not be called by all the reusable functions like
    // 'clickOn' etc.  This function would be called only when there is a need to count the number of
    // elements like counting the number of rows of a table etc.
    private async _findWebElements(): Promise<WebdriverIO.ElementArray> {
        switch (this._webElementIdentifier.toLowerCase()) {
            case "css":
                this._webElements = await $$(this._webElementLocator);
                break;
            case "xpath":
                this._webElements = await $$(this._webElementLocator);
                break;
            default:
                this.testStepFailed(`Element Identifier '${this._webElementIdentifier}' is not defined in findWebElements`)
                break;
        }
        return this._webElements;
    }

    public async findWebElement(objectLocator: string): Promise<WebdriverIO.Element> {
        this._parseAndIdentifyBy(objectLocator);
        return this._findWebElement();
    }

    public async findWebElements(objectLocator: string): Promise<WebdriverIO.ElementArray> {
        this._parseAndIdentifyBy(objectLocator);
        return this._findWebElements();
    }

    public async reloadPage() {
        try {
            await browser.refresh()
            this.testStepPassed(`browser reloaded`);
        } catch (error) {
            this.testStepFailed(`browser is not reloaded due to ${error}`);
        }
    }

    public async getPageTitle(): Promise<string> {
        let title: string
        try {
            title = await browser.getTitle()
            this.testStepPassed(`${title} : page title  is extracted`);
        } catch (error) {
            this.testStepFailed(`page title is not extracted due to ${error}`);
        }
        return title
    }

    public async selectDataFromList(objectLocator: string, actualText: string): Promise<void> {
        try {
            this._webElements = await this.findWebElements(objectLocator);
            this._webElements.forEach(async (element) => {
                if ((await element.getText()).match(actualText)) {
                    await element.click()
                    this.testStepPassed(`${actualText} is selected using ${this._webElementName}`);
                }
            })
        } catch (error) {
            this.testStepFailed(`value is not selected from '${this._webElementName}' list due to ${error}`);
        }
    }

    public async mouseHover(objectLocator: string): Promise<void> {
        try {
            await this.waitForElementExists(objectLocator);
            this._webElement = await this.findWebElement(objectLocator);
            await this._webElement.waitForExist({ timeout: 50000 });
            await this._webElement.moveTo();
            await this.waitInSeconds(0.1);
            this.testStepPassed(`Mouse hover on ${this._webElementName}`);
        } catch (error) {
            this.testStepFailed(`Mouse hover action on ${this._webElementName} failed due to the following error: ${error}`);
        }
    }

    public async selectDropdownOption(objectLocator: string, option: string, data: string): Promise<void> {
        try {
            await this.waitForElementExists(objectLocator);
            this._webElement = await this.findWebElement(objectLocator);
            await this._webElement.waitForExist({ timeout: 50000 });
            switch (option.toLowerCase()) {
                case "value":
                    await this._webElement.selectByAttribute("value", option);
                    break;
                case "index":
                    await this._webElement.selectByIndex(parseInt(data));
                    break;
                case "text":
                    await this._webElement.selectByVisibleText(data);
                    break;
                default:
                    throw new Error(`Dropdown ${option} is not mentioned in the switch case`)
            }
            await this.waitInSeconds(0.1);
            this.testStepPassed(`Selected ${option} from ${this._webElementName} dropdown`);
        } catch (error) {
            this.testStepFailed(`select action on ${this._webElementName} failed due to the following error: ${error}`);
        }
    }

    public async clickOn(objectLocator: string): Promise<void> {
        try {
            await this.waitForElementExists(objectLocator);
            this._webElement = await this.findWebElement(objectLocator);
            await this._webElement.waitForExist({ timeout: 30000 });
            await this._webElement.click();
            await this.waitInSeconds(0.2);
            this.testStepPassed(`Clicked on ${this._webElementName}`);
        } catch (error) {
            this.testStepFailed(`click action on ${this._webElementName} failed due to the following error: ${error}`);
        }
    }

    public async typeIn(objectLocator: string, valueToType: string): Promise<void> {
        try {
            await this.waitForElementExists(objectLocator);
            this._webElement = await this.findWebElement(objectLocator);
            await this._webElement.clearValue();
            await this._webElement.setValue(valueToType);
            this.testStepPassed(`Typed '${valueToType.toString()}' in the text field '${this._webElementName}'`);
        } catch (error) {
            this.testStepFailed(`type action failed due to the following error: ${error}`);
        }
    }

    public async getText(objectLocator: string): Promise<string> {
        let text = "";
        try {
            this._webElement = await this.findWebElement(objectLocator)
            await this._webElement.waitForExist({ timeout: 30000 });
            text = await this._webElement.getText();
            this.testStepPassed(`Text extracted from the field '${this._webElementName}'`);
        } catch (error) {
            this.testStepFailed(`Get text action on '${this._webElementName}' is failed due to the following error: ${error}`);
        }
        return text;
    }

    public async getAttributeValue(objectLocator: string, attributeName: string): Promise<string> {
        let attributeValue = "";
        try {
            this._webElement = await this.findWebElement(objectLocator);
            await this._webElement.waitForExist({ timeout: 30000 });
            attributeValue = await this._webElement.getAttribute(attributeName);
            this.testStepPassed(`Attribute [${attributeName}=${attributeValue}] is retrieved for '${this._webElementName}'`);
        } catch (error) {
            this.testStepFailed(`Get attribute value failed due to the following error: ${error}`);
        }
        return attributeValue;
    }

    public async getAllAttributeValues(objectLocator: string, attributeName: string): Promise<string[]> {
        let attributeValues: string[] = [];
        try {
            this._webElements = await this.findWebElements(objectLocator);
            await this._webElements[0].waitForExist({ timeout: 30000 });
            this._webElements.forEach(async element => {
                attributeValues.push(await element.getAttribute(attributeName))
            });
            this.testStepPassed(`Attributes [${attributeName}=${attributeValues}] were retrieved for '${this._webElementName}'`);
        } catch (error) {
            this.testStepFailed(`Get attribute values failed due to the following error: ${error}`);
        }
        return attributeValues;
    }

    public async clickBasedOnAttribute(objectLocator: string, attributeName: string, option: string): Promise<void> {
        try {
            this._webElements = await this.findWebElements(objectLocator);
            await this._webElements[0].waitForExist({ timeout: 30000 });
            this._webElements.forEach(async element => {
                if ((await element.getAttribute(attributeName)).match(option)) {
                    await element.click()
                }
            })
            this.testStepPassed(`${option} is clicked using attribute '${attributeName}'`);
        } catch (error) {
            this.testStepFailed(`${option} is not clicked due to the following error: ${error}`);
        }
    }

    public async isElementDisplayed(objectLocator: string): Promise<boolean> {
        let isDisplayed = false;
        try {
            this._webElement = await this.findWebElement(objectLocator)
            await this._webElement.waitForExist({ timeout: 60000 });
            isDisplayed = await this._webElement.isDisplayed();
            this.testStepPassed(`'${this._webElementName} is displayed'`);
        } catch (error) {
            this.testStepFailed(`${this._webElementName} is not displayed due to the following error: ${error}`);
        }
        return isDisplayed;
    }

    public async returnElementStatus(objectLocator: string): Promise<boolean> {
        let isDisplayed = false;
        try {
            this._webElement = await this.findWebElement(objectLocator)
            await this._webElement.waitForExist({ timeout: 5000 });
            isDisplayed = await this._webElement.isDisplayed();
            this.testStepPassed(`'${this._webElementName} existence is ${isDisplayed}'`);
        } catch (error) {
            logger.log(`'${this._webElementName}' existence is ${isDisplayed}`);
        }
        return isDisplayed;
    }

    public async verifyElementIsDisplayed(objectLocator: string): Promise<boolean> {
        let isDisplayed = false;
        try {
            isDisplayed = await this.isElementDisplayed(objectLocator);
            if (isDisplayed) {
                this.testStepPassed(`'${this._webElementName}' is displayed`);
            }
            else {
                this.testStepFailed(`'${this._webElementName}' is not displayed`);
            }

        } catch (error) {
            this.testStepFailed(`'${this._webElementName}' is not displayed due to the following error: ${error}`);
        }
        return isDisplayed;
    }

    public async isElementEnabled(objectLocator: string): Promise<boolean> {
        let isEnabled = false;
        try {
            this._webElement = await this.findWebElement(objectLocator)
            isEnabled = await this._webElement.isEnabled();
            this.testStepPassed(`'${this._webElementName}' is enabled`);
        } catch (error) {
            this.testStepFailed(`'${this._webElementName}' is not enabled due to the following error: ${error}`);
        }
        return isEnabled;
    }

    public async isElementExists(objectLocator: string): Promise<boolean> {
        let isExists = false;
        try {
            this._webElement = await this.findWebElement(objectLocator)
            isExists = await this._webElement.isExisting();
            this.testStepPassed(`'${this._webElementName}' is enabled`);

        } catch (error) {
            this.testStepFailed(`'${this._webElementName}' doesn't exist due to the following error: ${error}`);
        }
        return isExists;
    }

    public async waitForElementExists(objectLocator: string): Promise<boolean> {
        let isElementExists = false;
        try {
            this._webElement = await this.findWebElement(objectLocator)
            isElementExists = await this._webElement.waitForExist();
            isElementExists = await this._webElement.waitForEnabled();
            this.testStepPassed(`'${this._webElementName}' Element exists`);
        } catch (error) {
            this.testStepFailed(`'${this._webElementName}' element check failed due to the following error: ${error}`);
        }
        return isElementExists;
    }

    public async getAllText(objectLocator: string): Promise<string[]> {
        const items: string[] = [];
        try {
            await this.waitForElementExists(objectLocator);
            this._webElements = await this.findWebElements(objectLocator);
            for (const element of this._webElements) {
                await element.scrollIntoView();
                await this.waitInSeconds(0.2);
                const text = await element.getText();
                this.testStepPassed(`Text from the field '${this._webElementName}' is ${text}`);
                await this.waitInSeconds(0.2);
                items.push(text);
            }
        } catch (error) {
            this.testStepFailed(`Get text action failed due to the following error: ${error}`);
        }
        return items;
    }

    public async writeInTextFile(objectLocator: string, filePath: string): Promise<void> {
        var fs = require('fs');
        try {
            fs.clear;
            fs.writeFileSync(filePath, objectLocator);
            this.testStepPassed(`'${objectLocator}' values written in textfile`);
        }
        catch (error) {
            console.log("Cannot write file ", error);
            this.testStepFailed(`type action failed due to the following error: ${error}`);
        }
    }

    public async replaceXmlFiles(sourceFilePath: string, destFilePath: string): Promise<void> {
        var fs = require('fs');
        try {
            fs.copyFileSync(sourceFilePath, destFilePath);
            this.testStepPassed(`File Moved from '${sourceFilePath}' to '${destFilePath}'`);
        }
        catch (error) {
            this.testStepFailed(`File not moved: ${error}`);
        }

    }

    public async scrollToElement(objectLocator: string): Promise<void> {
        try {
            this._webElement = await this.findWebElement(objectLocator);
            await this._webElement.waitForExist({ timeout: this.elementTimeOut });
            await this._webElement.scrollIntoView();
            this.testStepPassed(`Scroll action performed for '${this._webElementName}'`);
        } catch (error) {
            this.testStepFailed(`Scroll action failed due to : ${error}`);
        }
    }

    public async scrollToView(locatorToScroll: string, locatorToSelect: string) {
        this._webElements = await this.findWebElements(locatorToScroll)
        for (let i = 0; i < this._webElements.length; i++) {
            // await this._webElements[i + 4].touchAction([
            //     'longPress',
            //     { action: 'moveTo', element: this._webElements[i + 5] },
            //     'release'
            // ])
            await driver.execute('mobile: scroll', { direction: 'down', element: this._webElements[i + 4].ELEMENT });
            const isDisplayed = await this.isElementExists(locatorToSelect)
            if (isDisplayed) {
                break
            }
            else {
                continue
            }
        }

        // await driver.execute('mobile: scroll', { direction: 'down' })
    }

    public async scrollUsingCoordinates(startPosition: number, endPosition: number): Promise<void> {
        try {
            // do a swipe by percentage
            // const startPercentage = 90;
            // const endPercentage = 10;
            // const anchorPercentage = 50;

            // const { height } = await driver.getWindowSize();
            // const anchor = height * anchorPercentage / 100;
            // const startPoint = height * startPercentage / 100;
            // const endPoint = height * endPercentage / 100;

            await driver.touchPerform([
                { action: 'press', options: { x: 500, y: startPosition } },
                { action: 'wait', options: { ms: 1000 } },
                { action: 'moveTo', options: { x: 500, y: endPosition } },
                { action: 'release' }
            ]);
            this.testStepPassed(`Scrolled down`)
            await this.waitInSeconds(1)
        } catch (error) {
            this.testStepFailed(`Scroll down failed due to : ${error}`);
        }
    }

    public async verifyFilesPresentInDirectory(filePath: string): Promise<void> {
        var fs = require('fs');
        fs.readdirSync(filePath);
        fs.existsSync(filePath,)
        if (fs.existsSync(filePath)) {
            this.testStepPassed(`File present in ${filePath}`);
        }
        else {
            this.testStepFailed(`${filePath} File not present`);
        }
    }

    public async deleteSystemFile(filePath: string, throwOnFailure?: boolean) {
        var fs = require('fs');
        try {
            fs.unlinkSync(filePath);
            this.testStepPassed(`${filePath} file deleted`);
        }
        catch (e) {
            console.warn("deleteSystemFile", e);
            if (throwOnFailure) {
                this.testStepFailed(`${filePath} File not deleted` + e);
                throw e;

            }
        }
    }

    public async captureSystemDate(): Promise<string> {
        let systemDate: string = "";
        try {
            const date_ob = new Date();
            let date = ("" + (date_ob.getDate())).slice(-2);
            let month = ("" + (date_ob.getMonth() + 1)).slice(-2);
            const year = date_ob.getFullYear();
            const dLength = date.toString().length;
            const mLength = month.toString().length;
            date = dLength == 1 ? 0 + String(date) : date;
            month = mLength == 1 ? 0 + String(month) : month;
            systemDate = month + "/" + date + "/" + year;
        } catch (error) {
            this.testStepFailed(`unable to capture system date due to : ${error}`);
        }
        return systemDate;
    }

    public async captureSystemTime(): Promise<string> {
        let systemTime: string = "";
        try {
            const date_ob = new Date();
            const hours = (date_ob.getHours());
            const minutes = (date_ob.getMinutes());
            const seconds = (date_ob.getSeconds());
            const newformat = hours >= 12 ? "PM" : "AM";
            let exactHour = (date_ob.getHours());
            exactHour = hours % 12;
            exactHour = exactHour ? exactHour : 12;
            const length = exactHour.toString().length;
            var hour = length == 1 ? 0 + String(exactHour) : exactHour;
            systemTime = hour + ":" + minutes + ":" + seconds + " " + newformat;
        } catch (error) {
            this.testStepFailed(`unable to capture system time due to : ${error}`);
        }
        return systemTime;
    }

    public async scrollToBottomBasedOnLastIndex(lastIndex: number): Promise<void> {
        try {
            for (let i = 0; i <= lastIndex; i++) {
                await driver.keys(Key.ArrowDown);
            }
            this.testStepPassed(`scroll to bottom done using '${this._webElementName}'`);
        } catch (error) {
            this.testStepFailed(`scroll to bottom failed due to the following error: ${error}`);
        }
    }

    public async switchToNewWindow() {
        try {
            const allWindows = await browser.getWindowHandles()
            const currentWindow = await browser.getWindowHandle()
            await browser.switchToWindow(currentWindow)
            allWindows.forEach(async (window) => {
                if (window != currentWindow) {
                    await browser.switchToWindow(window)
                    await this.waitInSeconds(0.5)
                    this.testStepPassed(`switched to new tab ${await browser.getTitle()}`)
                }
            })
        } catch (error) {
            this.testStepFailed(`not switched to new tab due to '${error}'`);
        }
    }
}