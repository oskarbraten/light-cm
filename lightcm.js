/*!
 * lightcm
 * https://github.com/oskarbraten/lightcm
 */


(function () {

    'use strict';

    function render(str, data) => {
        return str.replace(/{{\s*([\w]+)\s*}}/g, function (a, b) {
            let r = data[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
    };

    let LightCM = {
        items: null,
        element: null
    };

    LightCM.init = function (items) {
        if (items === undefined) {
            throw Error('Must provide an array of items as argument.');
        }

        this.items = items;

        // remove old context menu element.
        let _oldElement = document.getElementById('context-menu');
        if (_oldElement !== undefined) {
            _oldElement.remove();
        }

        let element = document.createElement('div');
        element.classList.add('context-menu');
        element.setAttribute('id', 'context-menu');

        for (let item of this.items) {
            let button = document.createElement('a');
            button.classList.add('btn');
            button.textContent = item.label;

            if (item.id) {
                button.setAttribute('id', item.id);
            }
            if (item.href) {
                button.setAttribute('href', item.href);
            }
            if (item.target) {
                button.setAttribute('target', item.target);
            }

            item.element = button;
            element.appendChild(button);
        }

        document.body.appendChild(element);

        this.element = element;
    };

    LightCM.open = function (event, data) {
        if (event === undefined) {
            throw Error('Missing event argument. Unable to open menu.');
        }

        event.preventDefault();

        // if user provided options, render options on elements.
        if (data !== undefined) {
            for (let item of this.items) {
                item.element.textContent = render(item.label, data);

                if (item.id) {
                    item.element.setAttribute('id', render(item.id, data));
                }
                if (item.href) {
                    item.element.setAttribute('href', render(item.href, data));
                }
                if (item.target) {
                    item.element.setAttribute('target', render(item.target, data));
                }
                if (item.handler) {

                    function handler(clickEvent) {
                        item.handler(data, clickEvent, event);

                        clickEvent.target.removeEventListener('click', handler);
                    }

                    item.element.addEventListener('click', handler);

                }
            }
        }

        this.element.style.top = event.pageY + 'px';
        this.element.style.left = event.pageX + 'px';
        this.element.style.display = 'flex';

        window.addEventListener('click', () => {
            this.element.style.display = 'none';
        });
    };

    if (window.LightCM !== undefined) {
        throw Error('LightCM is already defined in the global scope!');
    }

    window.LightCM = LightCM;

}());
