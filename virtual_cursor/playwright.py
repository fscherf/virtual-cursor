import asyncio
import os

JAVASCRIPT_PATH = os.path.join(
    os.path.dirname(__file__),
    'virtual-cursor.js',
)

JAVASCRIPT = open(JAVASCRIPT_PATH, 'r').read()


def animations_are_enabled():
    return (
        os.environ.get('VIRTUAL_CURSOR_ANIMATIONS', '1')
        .strip()
        .lower() in ['1', 'true', 'yes', 'on']
    )


def inject_javascript(func):
    async def wrapper(page, *args, **kwargs):
        if (animations_are_enabled() and
                not hasattr(page, '_javascript_injected')):

            await page.evaluate(JAVASCRIPT)
            page._javascript_injected = True

        return await func(page, *args, **kwargs)

    return wrapper


@inject_javascript
async def click(page, locator):
    if animations_are_enabled():
        await page.evaluate(f"""async () => {{
            await window.virtualCursor.click("{locator}");
        }}""")

    # We don't use page.click here because the JavaScript library
    # automatically scroll to elements that are about to be clicked.
    # This behavior clashes with playwrights builtin behavior.
    await page.wait_for_selector(locator)
    await page.locator(locator).dispatch_event('click')


@inject_javascript
async def fill(page, locator, value):
    if not animations_are_enabled():
        await page.locator(locator).fill(value)

        return

    await click(page, locator)
    await asyncio.sleep(0.3)
    await page.locator(locator).fill(value)
    await asyncio.sleep(0.2)


@inject_javascript
async def check(page, locator):
    await click(page, locator)


@inject_javascript
async def selectOption(page, locator, *args, **kwargs):
    await click(page, locator)
    await asyncio.sleep(0.3)
    await page.locator(locator).select_option(*args, **kwargs)
    await asyncio.sleep(0.2)
