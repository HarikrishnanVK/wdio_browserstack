import { Generics } from '../helpers/generics'
import { logger } from '../helpers/logger'

export class BupaPage extends Generics {

  private globalVariable

  /* Selectors */

  private readonly bupaCompanyLogo = `bupa company logo#css=figure[id='logo'] img[src*='bupa-company-logo']`
  private readonly subLinksOfOurBupa = `bupa sub links#css=ul[id='section-our-bupa-level2'] li[id*='level2'] > a > span`
  private readonly subLinksOfOurBupaInMobile = `bupa sub links in mobile#css=ul[class='mm-listview'] li[id*='level2'] > a > span`
  private readonly mobileMenuBar = `mobile menu bar#xpath=//a[@href="#mmenu"]`
  private readonly mobileSearchBox = `mobile search box#css=input[id=mobiSearchTextbox]`
  private readonly runMobileSearch = `mobile search button#css=a[class=search_button_trigger]`
  private readonly searchButton = `search button#xpath=//nav[contains(@class,'nav')]//..//a[@class='searchButton']`
  private readonly searchTextBox = `search text box#css=input[id=searchTextbox]`
  private readonly runSearch = `run search#css=input[id=searchButton]`
  private readonly resultSummary = `result summary#css=div[id=result-summary]`
  private readonly resultLinks = `result links#css=span[class=resultURL]`
  private readonly linkHeader = `link header#css=div[class=banner-landing-page-title] > h1`
  private readonly socialMediaLnks = `social media links#css=footer[id='footerwrapper'] div[class='share-icons'] a`
  private readonly serviceLinks = `service links#css=section[class='footer-box-bottom'] a`
  private readonly serviceLinksInMobile = `service links in mobile#css=div[class='footer-bottom'] a`
  private readonly acceptCookieButton = `accept cookies button#css=button[id='cc-cookieAgree']`
  private readonly ourBupaMenu = `our bupa menu#css=li[id='nav-our-bupa-level1'] > a[href='/our-bupa']`
  private readonly ourStrategyMenuItem = `our strategy menu item#css=li[role='menuitem'] a[href*='our-strategy']`;
  private readonly whatWeDoMenu = `what we do menu#css=li[id='nav-what-we-do-level1'] > a[href*='/what-we-do']`;
  private readonly ourMarketsMenuItem = `our markets menu item#xpath=//li[@role='menuitem']//a[contains(@href,'our-markets')]`;
  private readonly contactsList = `contacts list#css=a[class='websites']`;
  private readonly countriesDropDown = `countries drop down box#css=select[id='select-box']`

  /* functions */

  async mouseHoverOnMenu(option: string) {
    switch (option.toLowerCase().replace(/\s/g, '')) {
      case "ourbupa":
        await this.mouseHover(this.ourBupaMenu)
        break;
      case "whatwedo":
        await this.mouseHover(this.whatWeDoMenu);
        break;
      default:
        logger.error(`${option.toString()} mentioned is not present in the switch case`);
        throw new Error(`${option.toString()} mentioned is not present in the switch case`);
    }
  }

  async clickOnMenuItem(option: string) {
    switch (option.toLowerCase().replace(/\s/g, '')) {
      case "ourstrategy":
        await this.clickOn(this.ourStrategyMenuItem)
        break;
      case "ourmarkets":
        await this.clickOn(this.ourMarketsMenuItem)
        break;
      default:
        logger.error(`${option.toString()} mentioned is not present in the switch case`);
        throw new Error(`${option.toString()} mentioned is not present in the switch case`);
    }
  }

  async verifyHomePage() {
    const logo = await this.isElementDisplayed(this.bupaCompanyLogo)
    expect(logo).toBeTruthy()
  }

  async clickContactList() {
    await this.clickOn(this.contactsList);
  }

  async acceptCookies() {
    try {
      await this.clickOn(this.acceptCookieButton)
    } catch {
      console.log("Cookies confirmation did not appear")
      logger.info("Cookies confirmation did not appear")
    }
  }

  async selectCountriesFromList(country: string) {
    await this.selectDropdownOption(this.countriesDropDown, 'value', country)
    await this.waitInSeconds(0.5)
  }

  async openLocationLink(countryText: string) {
    const locationLink = `location link button#css=div[id='tab-${countryText}'] > div[class='website-button'] > a`
    await this.clickOn(locationLink)
  }

  async mouseHoverOnLink(linkName: string, isMobile: Boolean) {
    let ourBupaPrimaryLink
    if (isMobile) {
      ourBupaPrimaryLink = `Bupa primary link#css=(//ul[@id='mobi-section-Homepage-level1']//li//a[contains(@href,'${linkName}')])[1]`
      await this.clickOn(this.mobileMenuBar)
      for (let i = 0; i < 5; i++) {
        let isDisplayed = await this.returnElementStatus(`Bupa primary link#css=input[id=mobiSearchTextbox]`)
        if (!isDisplayed) {
          await this.reloadPage()
          await this.clickOn(this.mobileMenuBar)
        } else {
          break
        }
      }
      await this.clickOn(ourBupaPrimaryLink)
    } else {
      ourBupaPrimaryLink = `Bupa primary link#css=ul[id='section-Homepage-level1'] > li > a[href*='${linkName}']`
      await this.mouseHover(ourBupaPrimaryLink)
    }
  }

  async selectSubLink(subLinkName: string, isMobile: Boolean) {
    if (isMobile) {
      if (subLinkName.toLowerCase().match("governance")) {
        subLinkName = "careers"
      }
      await this.selectDataFromList(this.subLinksOfOurBupaInMobile, subLinkName)
    } else {
      await this.selectDataFromList(this.subLinksOfOurBupa, subLinkName)
    }
  }

  async returnPageTitle(): Promise<string> {
    return await this.getPageTitle()
  }

  async searchContent(content: string, isMobile: Boolean) {
    if (isMobile) {
      await this.searchContentForMobile(content)
    } else {
      await this.clickOn(this.searchButton)
      await this.typeIn(this.searchTextBox, content)
      await this.clickOn(this.runSearch)
    }
  }

  private async searchContentForMobile(content: string) {
    await this.clickOn(this.mobileMenuBar)
    for (let i = 0; i < 5; i++) {
      let isDisplayed = await this.returnElementStatus("search element state#css=input[id=mobiSearchTextbox]")
      if (!isDisplayed) {
        await this.reloadPage()
        await this.clickOn(this.mobileMenuBar)
      } else {
        break
      }
    }
    await this.typeIn(this.mobileSearchBox, content)
    await this.clickOn(this.runMobileSearch)
  }

  async verifySearchResult(content: string) {
    const elements = await this.findWebElements(this.resultSummary)
    await expect(elements).toHaveTextContaining(content)
    const results = await this.getAllText(this.resultSummary)
    expect(results.toString()).toHaveTextContaining(content)
    const resultLinks = await this.getAllText(this.resultLinks)
    expect(resultLinks.toString().toLowerCase()).toHaveTextContaining(content.toLowerCase())
  }

  async navigateToFirstLink() {
    const firstLinkResult = await (await this.findWebElements(this.resultLinks))[1].getText()
    this.globalVariable = firstLinkResult
    logger.info(`result from the 1st link is captured as ${firstLinkResult}`)
    console.log(`result from the 1st link is captured as ${firstLinkResult}`)
    await (await this.findWebElements(this.resultLinks))[1].click()
  }

  async navigateToUrl(url: string) {
    await browser.url(url)
  }

  async sleep(msec: number | undefined) {
    return await new Promise(resolve => setTimeout(resolve, msec))
  }

  private async switchToWindow() {
    await this.switchToNewWindow()
  }

  async validateArticle() {
    await this.switchToWindow()
    const newsHeader = await this.getText(this.linkHeader)
    console.log(`Relevant article is displayed '${newsHeader}'`)
  }

  async verifyLocation(countryLink: string) {
    await this.switchToNewWindow();
    let expectedURL: string = await browser.getUrl();
    expect(expectedURL).toContain(countryLink);
  }

  async clickMediaLinks(siteName: string, isMobile: Boolean) {
    let links: WebdriverIO.ElementArray
    if (isMobile) {
      links = await this.findWebElements(this.serviceLinksInMobile)
      for (let link of links) {
        await link.scrollIntoView()
        const attributeValue: string = await link.getAttribute('href')
        if (attributeValue.includes(siteName.toLowerCase())) {
          await link.click()
          break
        }
      }
    } else {
      links = await this.findWebElements(this.serviceLinks)
      for (let link of links) {
        const attributeValue: string = await link.getAttribute('href')
        if (attributeValue.includes(siteName.toLowerCase())) {
          await link.click()
          break
        }
      }
    }
  }
}
