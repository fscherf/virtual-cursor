(() => {

    // source: https://cursor.in/
    const CURSOR_SVG_SOURCE = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 18.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 28 28" enable-background="new 0 0 28 28" xml:space="preserve">
<polygon fill="#FFFFFF" points="8.2,20.9 8.2,4.9 19.8,16.5 13,16.5 12.6,16.6 "/>
<polygon fill="#FFFFFF" points="17.3,21.6 13.7,23.1 9,12 12.7,10.5 "/>
<rect x="12.5" y="13.6" transform="matrix(0.9221 -0.3871 0.3871 0.9221 -5.7605 6.5909)" width="2" height="8"/>
<polygon points="9.2,7.3 9.2,18.5 12.2,15.6 12.6,15.5 17.4,15.5 "/>
</svg>`;

    const CURSOR_WIDTH = 28;
    const CURSOR_HEIGHT = 28;
    const CURSOR_OFFSET_LEFT = -4;
    const CURSOR_OFFSET_TOP = -4;

    const BROWSER_STYLE = `
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial;
            background-image: linear-gradient(to right top, #051937, #004d7a, #008793, #00bf72, #a8eb12);
            padding: 24px;
        }

        /* The browser window */
        .container {
            border: 3px solid #f1f1f1;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            width: 100%;
            height: 100%;
            background-color: white;
        }

        /* Container for columns and the top "toolbar" */
        .row {
            padding: 10px;
            background: #f1f1f1;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
        }

        /* Create three unequal columns that floats next to each other */
        .column {
            float: left;
        }

        .left {
            width: 15%;
        }

        .right {
            width: 10%;
        }

        .middle {
            width: 75%;
        }

        /* Clear floats after the columns */
        .row:after {
            content: "";
            display: table;
            clear: both;
        }

        /* Three dots */
        .dot {
            margin-top: 4px;
            height: 12px;
            width: 12px;
            background-color: #bbb;
            border-radius: 50%;
            display: inline-block;
        }

        /* Style the input field */
        input[type=text] {
            width: 100%;
            border-radius: 3px;
            border: none;
            background-color: white;
            margin-top: -8px;
            height: 25px;
            color: #666;
            padding: 5px;
        }

        /* Three bars (hamburger menu) */
        .bar {
            width: 17px;
            height: 3px;
            background-color: #aaa;
            margin: 3px 0;
            display: block;
        }

        /* Page content */
        .content {
            padding: 10px;
        }
    `;

    const BROWSER_HTML = `<div class="container">
        <div class="row">
            <div class="column left">
                <span class="dot" style="background:#ED594A;"></span>
                <span class="dot" style="background:#FDD800;"></span>
                <span class="dot" style="background:#5AC05A;"></span>
            </div>
            <div class="column middle">
                <input type="text" value="http://localhost">
            </div>
            <div class="column right">
                <div style="float:right">
                    <span class="bar"></span>
                    <span class="bar"></span>
                    <span class="bar"></span>
                </div>
            </div>
        </div>

        <div class="content">
            <iframe src="http://google.de"></iframe>
        </div>
    </div>`;

    function svgStringToElement(svgString) {
        return new DOMParser()
            .parseFromString(svgString, 'image/svg+xml')
            .documentElement;
    }

    function htmlStringToElement(htmlString) {
        return new DOMParser()
            .parseFromString(htmlString, 'text/html')
            .documentElement.ownerDocument.body.childNodes[0];
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getElement(elementOrSelector) {
        let element = elementOrSelector;

        if(typeof(element) === 'string') {
            element = document.querySelector(elementOrSelector);
        }

        return element;
    }

    function elementIsVisible(elementOrSelector) {
        const element = getElement(elementOrSelector);
        const clientRect = element.getBoundingClientRect();

        return (
            clientRect.top >= 0 &&
            clientRect.left >= 0 &&
            clientRect.bottom <= (
                window.innerHeight || document.documentElement.clientHeight) &&
            clientRect.right <= (
                window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function getElementCoordinates(elementOrSelector) {
        let element = elementOrSelector;

        if(typeof(element) === 'string') {
            element = document.querySelector(elementOrSelector);
        }

        const clientRect = element.getBoundingClientRect();

        return {
            x: (clientRect.x + (clientRect.width / 2)),
            y: (clientRect.y + (clientRect.height / 2)),
        }
    }


    function scrollIntoView(elementOrSelector) {
        const element = getElement(elementOrSelector);

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
        });
    }

    class VirtualCursor {
        constructor() {

            // setup cursor
            this.cursor = svgStringToElement(CURSOR_SVG_SOURCE);
            this.cursorX = 0;
            this.cursorY = 0;

            this.cursor.style.display = 'none';
            this.cursor.style.position = 'fixed';
            this.cursor.style.zIndex = '1000000';
            this.cursor.style.width = `${CURSOR_WIDTH}px`;
            this.cursor.style.height = `${CURSOR_HEIGHT}px`;

            // initial position
            this.moveTo(0, 0, false);

            // append cursor to the dom
            document.body.appendChild(this.cursor);
        }

        moveTo(x, y, animation) {
            if(animation === undefined) {
                animation = true;
            }

            x = x + CURSOR_OFFSET_LEFT;
            y = y + CURSOR_OFFSET_TOP;

            if(!animation) {
                this.cursorX = x;
                this.cursorY = y;
                this.cursor.style.left = `${x}px`;
                this.cursor.style.top = `${y}px`;

                return;
            }

            const promise = this.cursor.animate(
                {
                    left: [`${this.cursorX}px`, `${x}px`],
                    top: [`${this.cursorY}px`, `${y}px`],
                },
                {
                    easing: 'ease',
                    duration: 300,
                    fill: 'forwards',
                },
            ).finished;

            this.cursorX = x;
            this.cursorY = y;

            return promise;
        }

        moveToHome(animation) {
            return this.moveTo(
                window.innerWidth / 2,
                window.innerHeight / 2,
                animation,
            );
        }

        hide() {
            this.cursor.style.display = 'none';
        }

        show() {
            this.cursor.style.display = 'block';
        }

        async click(elementOrSelector) {
            const element = getElement(elementOrSelector);

            // scroll element into view if needed
            if(!elementIsVisible(element)) {
                scrollIntoView(element);

                await sleep(500);
            }

            // place cursor
            const coordinates = getElementCoordinates(elementOrSelector);

            await this.moveTo(
                coordinates.x,
                coordinates.y,
                true, // animation
            );

            await sleep(250);

            // click animation
            await this.cursor.animate(
                {
                    width: ['28px', '20px'],
                    height: ['28px', '20px'],
                },
                {
                    easing: 'ease',
                    duration: 200,
                },
            ).finished;

            element.focus();
        }
    }


    class VirtualBrowser {
        constructor() {

            // setup style
            const styleElement = document.createElement('style');

            styleElement.type = 'text/css';
            styleElement.innerText = BROWSER_STYLE;

            document.head.appendChild(styleElement);

            // setup HTML
            const htmlElement = htmlStringToElement(BROWSER_HTML);

            document.body.appendChild(htmlElement);
        }
    }


    // setup
    const virtualBrowser = new VirtualBrowser();
    const virtualCursor = new VirtualCursor();

    virtualCursor.moveToHome(false  /* animation */);
    virtualCursor.show();

    window['virtualBrowser'] = virtualBrowser;
    window['virtualCursor'] = virtualCursor;
})();
