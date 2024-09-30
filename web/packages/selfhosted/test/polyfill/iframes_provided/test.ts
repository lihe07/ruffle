import { openTest } from "../../utils.js";
import { expect, use } from "chai";
import chaiHtml from "chai-html";
import fs from "fs";

use(chaiHtml);

describe("Flash inside iframe with provided ruffle", () => {
    it("loads the test", async () => {
        await openTest(browser, `polyfill/iframes_provided`);
    });

    it("polyfills inside an iframe", async () => {
        await browser.switchToFrame(await browser.$("#test-frame"));
        // TODO: After https://github.com/webdriverio/webdriverio/issues/13218 is fixed, use browser.$("ruffle-object")
        await browser
            .$(
                () =>
                    (
                        document.querySelector(
                            "#test-frame",
                        ) as HTMLIFrameElement
                    ).contentDocument?.body.querySelector(
                        "ruffle-object",
                    ) as HTMLElement,
            )
            .waitForExist();
        // TODO: After https://github.com/webdriverio/webdriverio/issues/13218 is fixed
        // use browser.$("#test-container").getHTML({ includeSelectorTag: false, pierceShadowRoot: false });
        const actual = await browser.execute(() => {
            const el = (
                document.querySelector("#test-frame") as HTMLIFrameElement
            ).contentDocument?.body.querySelector("#test-container");
            return el?.innerHTML;
        });

        const expected = fs.readFileSync(
            `${import.meta.dirname}/expected.html`,
            "utf8",
        );
        expect(actual).html.to.equal(expected);
    });

    it("polyfills even after a reload", async () => {
        // Contaminate the old contents, to ensure we get a "fresh" state
        await browser.execute(() => {
            document.getElementById("test-container")?.remove();
        });

        // Then reload
        await browser.switchToFrame(null);
        await browser.$("#reload-link").click();

        // And finally, check
        await browser.switchToFrame(null);
        await browser.switchToFrame(await browser.$("#test-frame"));
        // TODO: After https://github.com/webdriverio/webdriverio/issues/13218 is fixed, use browser.$("ruffle-object")
        await browser
            .$(
                () =>
                    (
                        document.querySelector(
                            "#test-frame",
                        ) as HTMLIFrameElement
                    ).contentDocument?.body.querySelector(
                        "ruffle-object",
                    ) as HTMLElement,
            )
            .waitForExist();

        // TODO: After https://github.com/webdriverio/webdriverio/issues/13218 is fixed
        // use browser.$("#test-container").getHTML({ includeSelectorTag: false, pierceShadowRoot: false });
        const actual = await browser.execute(() => {
            const el = (
                document.querySelector("#test-frame") as HTMLIFrameElement
            ).contentDocument?.body.querySelector("#test-container");
            return el?.innerHTML;
        });
        const expected = fs.readFileSync(
            `${import.meta.dirname}/expected.html`,
            "utf8",
        );
        expect(actual).html.to.equal(expected);
    });
});
