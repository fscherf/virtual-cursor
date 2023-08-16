from lona import View

from lona_picocss.html import (
    InlineButton,
    TextInput,
    CheckBox,
    Select2,
    Option2,
    Label,
    Modal,
    HTML,
    H1,
    H3,
)


class FormTestView(View):
    def open_modal(self, input_event=None):
        with self.html.lock:
            self.modal.get_body().nodes = [
                H3('Modal'),

                Label(
                    'Text Input 2',
                    TextInput(_id='text-input-2'),
                ),
            ]

            self.modal.get_footer().nodes = [
                InlineButton(
                    'Close',
                    _id='close',
                    handle_click=self.close_modal,
                ),
            ]

            self.modal.open()

    def close_modal(self, input_event=None):
        self.modal.close()

    def handle_request(self, request):
        self.modal = Modal()

        self.html = HTML(
            H1('Virtual Cursor Demo View'),

            Label(
                'Text Input',
                TextInput(_id='text-input'),
            ),
            Label(
                'Select',
                Select2(
                    *(Option2(f'Option {i}', value=f'option-{i}')
                      for i in range(50)),
                    _id='select',
                ),
            ),
            Label(
                CheckBox(_id='check-box'),
                'CheckBox',
            ),

            InlineButton(
                'Open Popup',
                _id='open',
                style='margin-top: 120vh',
                handle_click=self.open_modal,
            ),

            self.modal,
        )

        return self.html
