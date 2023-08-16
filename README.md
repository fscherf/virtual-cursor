# virtual-cursor

![license MIT](https://img.shields.io/pypi/l/virtual-cursor.svg)
![Python Version](https://img.shields.io/pypi/pyversions/virtual-cursor.svg)
![Latest Version](https://img.shields.io/pypi/v/virtual-cursor.svg)

virtual-cursor adds human-like cursor animations to your browser tests.

Browser test libraries like [Selenium](https://www.selenium.dev/) or [Playwright](https://playwright.dev/) can be used to generate screenshots or videos of websites, which are great for debugging or as media for documentation.
Most of the times, these videos are not very useful, because the test code clicks much faster than a human and the cursor is invisible.

virtual-cursor emulates a cursor by injecting a custom JavaScript payload into the test browser, which animates a mocked, second cursor, and adds delays to slow down the [test code](tests/test_virtual_cursor.py).

![](doc/popup-desktop-chrome-dark.gif)

[Gallery](doc/gallery.md)


## Installation

virtual-cursor can be installed via pip

```
pip install virtual-cursor
```

## Usage

### pytest + playwright

See a full [example](tests/test_virtual_cursor.py) which produces the clip above.

```python
async def test_virtual_cursor():
    from playwright.async_api import async_playwright

    from virtual_cursor.playwright import click, fill, check, selectOption

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()

        browser_context = await browser.new_context(
            record_video_dir='/tmp/videos/',
        )

        page = await browser_context.new_page()
        await page.goto('http://localhost')

        # click element
        await click(page, '#button')

        # fill out a text-input
        await fill(page, '#text-input', 'Lorem Ipsum')

        # select an option of a select
        await selectOption(page, '#select', 'Option 17')

        # check a checkbox
        await check(page, '#check-box')
```
