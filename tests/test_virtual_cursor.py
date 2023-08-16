import pytest


@pytest.mark.parametrize('theme', ['dark', 'light'])
@pytest.mark.parametrize('device', ['Desktop Chrome', 'iPhone 13'])
async def test_virtual_cursor(device, theme, lona_app_context):
    import asyncio

    from playwright.async_api import async_playwright
    from lona_picocss import install_picocss

    from virtual_cursor.playwright import click, fill, check, selectOption
    from virtual_cursor.lona import FormTestView

    def setup_app(app):
        install_picocss(app=app)

        app.settings.PICOCSS_THEME = theme

        app.route('/')(FormTestView)

    context = await lona_app_context(setup_app)

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()

        browser_context = await browser.new_context(
            record_video_dir='/tmp/videos/',
            **playwright.devices[device],
        )

        page = await browser_context.new_page()

        await page.goto(context.make_url('/'))

        await asyncio.sleep(1)

        # fill out form
        await fill(page, '#text-input', 'Foooooooo')
        await selectOption(page, '#select', 'Option 17')
        await check(page, '#check-box')

        # open popup
        await click(page, '#open')
        await page.wait_for_selector('.modal-is-open')

        # fill out second form
        await fill(page, '#text-input-2', 'Baaaaaaaar')

        # close popup
        await click(page, '#close')
        await asyncio.sleep(1)

        # save video
        device_name = device.strip().lower().replace(' ', '-')

        await browser_context.close()

        await page.video.save_as(
            f'/app/doc/popup-{device_name}-{theme}.mp4',
        )
