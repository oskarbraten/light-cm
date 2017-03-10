/*!
 * lightcm
 * https://github.com/oskarbraten/lightcm
 */


(function () {

    'use strict';

    function isFunction (object) {
        return typeof object === 'function';
    }

    function render(str, data) {
        return str.replace(/{{\s*([\w]+)\s*}}/g, function (a, b) {
            let r = data[b];
            if (isFunction(r)) {
                r = r();
            }
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
        if (_oldElement) {
            _oldElement.remove();
        }

        let element = document.createElement('div');
        element.classList.add('context-menu');
        element.setAttribute('id', 'context-menu');

        for (let item of this.items) {
            let button = document.createElement('a');
            button.classList.add('btn');
            button.textContent = item.label;

            for (let attribute in item.attributes) {
                let attributeValue = item.attributes[attribute];
                if (isFunction(attributeValue)) {
                    attributeValue = attributeValue();
                }
                button.setAttribute(attribute, attributeValue);
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

                for (let attribute in item.attributes) {
                    let attributeValue = item.attributes[attribute];
                    if (isFunction(attributeValue)) {
                        attributeValue = attributeValue();
                    }
                    item.element.setAttribute(attribute, render(attributeValue));
                }

                if (item.handler) {
                    item.element.onclick = (clickEvent) => {
                        item.handler(data, event, clickEvent);
                    }
                }
            }
        }

        this.element.style.top = event.pageY + 'px';
        this.element.style.left = event.pageX + 'px';
        this.element.style.display = 'flex';

        let element = this.element;

        function hide(event) {
            element.style.display = 'none';
            event.target.removeEventListener('click', hide);
        }

        window.addEventListener('click', hide);
    };

    if (window.LightCM !== undefined) {
        throw Error('LightCM is already defined in the global scope!');
    }

    window.LightCM = LightCM;

}());
