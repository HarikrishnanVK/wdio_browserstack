import { BupaPage } from '../pageobjects/bupa.page'
import { BupaLinkTest } from '../../test_data/test_data.json'
import { exec } from 'child_process'

let bupa: BupaPage
let isMobile: boolean = false

describe('Bupa health care tests', () => {
  beforeEach(async () => {
    bupa = new BupaPage()
    isMobile = await bupa.intializeSession()
    await bupa.navigateToUrl(browser.options.baseUrl)
    await bupa.acceptCookies()
  })

  it('Verify Bupa search engine working', async () => {
    console.log(`Is Mobile device running : ${isMobile}`)
    await bupa.searchContent('Bupa', isMobile)
    await bupa.verifySearchResult('Bupa')
    await bupa.navigateToFirstLink()
    await bupa.validateArticle()
  })

  it('Verify search navigating using window handles', async () => {
    await bupa.mouseHoverOnLink('about-us', isMobile)
    await bupa.selectSubLink('Leadership', isMobile)
    await bupa.searchContent('Bupa', isMobile)
    await bupa.verifySearchResult('Bupa')
    await bupa.navigateToFirstLink()
    await bupa.validateArticle()
  })

  BupaLinkTest.forEach((data: any) => {
    it(`Verify primary links of Bupa site ${data.BupaServiceSite!}`, async () => {
      await bupa.mouseHoverOnLink('about-us', isMobile)
      await bupa.selectSubLink(data.LinkName!, isMobile)
      await bupa.clickMediaLinks(data.BupaServiceSite!, isMobile)
      await bupa.searchContent('Bupa', isMobile)
      await bupa.verifySearchResult('Bupa')
      await bupa.navigateToFirstLink()
      await bupa.validateArticle()
      //"posttest": "adb -s emulator-5554 emu kill &"

    })
  })
})

afterEach(async () => {
  await bupa.resetSession()
})

  //   BupaLocationTest.forEach(testData => {
  //     test(`Verify locations of the health care ${testData.countryName!}`, async () => {
  //       await bupa.clickContactList()
  //       await bupa.selectCountriesFromList(testData.countryName!)
  //       await bupa.openLocationLink(testData.countryName!)
  //       await bupa.verifyLocation(testData.countryLink!)
  //     })
  //   })
  // })


