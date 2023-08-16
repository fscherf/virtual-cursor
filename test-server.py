from virtual_cursor.lona import FormTestView
from lona_picocss import install_picocss
from lona.static_files import Script
from lona import App

app = App(__file__)

app.settings.PICOCSS_THEME = 'light'

install_picocss(app, debug=True)


@app.route('/')
class Index(FormTestView):
    STATIC_FILES = [
        Script(
            name='virtual-cursor.js',
            path='virtual_cursor/virtual-cursor.js',
            url='virtual-cursor/virtual-cursor.js',
        ),
    ]


app.run()
