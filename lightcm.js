/*!
 * lightcm
 * https://github.com/oskarbraten/lightcm
 */


(function () {

    'use strict';


    /* UTILITY */
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
    }


    /* CONTEXTMENU */
    class ContextMenu {
        constructor(id, items) {
            if (id === undefined || items === undefined) {
                throw Error('Unable to initalize, one or more invalid arguments!');
            }

            this.id = id;
            this.visibility = false;
            this.items = items;

            let element = document.createElement('div');
            element.classList.add('context-menu');
            element.setAttribute('id', this.id);

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
        }

        show() {
            this.visibility = true;
            this.element.style.display = 'flex';
        }

        hide() {
            this.visibility = false;
            this.element.style.display = 'none';
        }

        open(event, data) {
            if (event === undefined || data === undefined) {
                throw Error('Unable to open, one or more invalid arguments!');
            }

            event.preventDefault();

            // if user provided options, render options on elements.
            for (let item of this.items) {
                item.element.textContent = render(item.label, data);

                for (let attribute in item.attributes) {
                    let attributeValue = item.attributes[attribute];
                    if (isFunction(attributeValue)) {
                        attributeValue = attributeValue();
                    }
                    item.element.setAttribute(attribute, render(attributeValue, data));
                }

                if (item.handler) {
                    item.element.onclick = (clickEvent) => {
                        item.handler(data, event, clickEvent);
                    }
                }
            }

            this.element.style.top = event.pageY + 'px';
            this.element.style.left = event.pageX + 'px';
            this.show();


            let hideOnClick = (event) => {
                this.hide();
                window.removeEventListener('click', hideOnClick);
            };
            window.addEventListener('click', hideOnClick);

            let target = event.target;

            window.oncontextmenu = (event) => {
                if (event.target !== target) {
                    this.hide();
                }
            };
        }
    }


    /* LIGHTCM */
    let contextmenuList = [];

    let LightCM = {};

    let create = (id, items) => {
        if (id === undefined) {
            throw Error('Unable to initalize, the id argument is undefined!');
        }

        let ocmIndex = contextmenuList.findIndex((cm) => {
            return (cm.id === id);
        });

        let contextmenu;
        if (ocmIndex > 0) {
            // remove old context menu element.
            let oldElement = document.getElementById(contextmenuList[ocmIndex].id);
            if (oldElement) {
                oldElement.remove();
            }

            contextmenu = new ContextMenu(id, items);
            contextmenuList[ocmIndex] = contextmenu;
        } else {
            contextmenu = new ContextMenu(id, items);
            contextmenuList.push(contextmenu);
        }

        return contextmenu;
    };

    let open = (id, event, data = {}) => {
        let contextMenu = contextmenuList.find((cm) => {
            return (cm.id === id);
        });

        if (contextMenu !== undefined) {
            // hide any open menus.
            for (let cm of contextmenuList) {
                if (cm.visibility) {
                    cm.hide();
                }
            }

            contextMenu.open(event, data);
        }
    };

    LightCM.init = (enableDataAttributes = true) => {
        if (enableDataAttributes) {
            LightCM._attributeListening.addContextmenuListeners();
            LightCM._attributeListening.observer.observe(document.body, { childList: true, subtree: true });
        }

        LightCM.create = create;
        LightCM.open = open;
    }

    LightCM._attributeListening = {
        addContextmenuListeners: () => {
            let elements = document.querySelectorAll('[data-contextmenu]');
            for (let element of elements) {
                // adding named function as handler to avoid duplicates.
                function handler(event) {
                    let jsonData = element.dataset.contextmenuData;
                    let data;

                    if (jsonData !== undefined) {
                        data = JSON.parse(element.dataset.contextmenuData);
                    }

                    LightCM.open(element.dataset.contextmenu, event, data);
                }
                element.addEventListener('contextmenu', handler);
            }
        },
        observer: new MutationObserver(function(mutations) {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    if (node.dataset && node.dataset.contextmenu) {
                        LightCM._attributeListening.addContextmenuListeners(); // update data handlers
                    }
                }
            }
        })
    };

    if (window.LightCM !== undefined) {
        throw Error('LightCM is already defined in the global scope!');
    }

    window.LightCM = LightCM;

}());
