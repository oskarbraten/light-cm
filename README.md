# lightcm
A lightweight contextmenu for the web.

## Quick Start
```javascript
LightCM.init([
    {
        label: 'Open',
        attributes: {
            href: '{{url}}',
            target: '_blank'
        }
    },
    {
        label: 'Make red',
        handler: function (data, { target }) {
            target.style.background = 'red';
        }
    }
]);

```

```html
<div class="btn" onclick="LightCM.open(event, { url: '/hello' })"></div>
```

## Documentation


### LightCM.init(items)
#### Parameters:
 * `items` : \<Array\>

An item can have 3 properties:
 * `label` : \<String\>
 * `attributes` : \<Object\>
 * [`handler`](#handlerdata-event-clickevent) : \<Function\>

`attributes` can contain any valid anchor-tag attribute (href, target, style, id, class etc..). And can be defined using a `String` or `Function` => `String`.

#### Example:
```javascript
let items = [
    {
        label: 'Button1',
        attributes: {
            href: '{{url}}',
            target: () => '_blank' // arrow function returning '_blank'.
        }
    },
    {
        label: 'Button2',
        handler: function (data, { target }) {
            console.log(data, target);
        }
    }
];

LightCM.init(items);
```


### LightCM.open(event, data)
#### Parameters:
 * `event` : \<[ContextMenuEvent](https://developer.mozilla.org/en-US/docs/Web/Events/contextmenu)\>
 * `data` : \<Object\>



#### Example:
```javascript
let items = [
    {
        label: 'Button1',
        attributes: {
            href: '{{url}}' // "mustache style" template
        }
    }
];

LightCM.open(event, { url: '/hello' });
```


### handler(data, event, clickEvent)
#### Parameters:
 * [`data`](#data) : \<Object\>
 * `event` : \<[ContextMenuEvent](https://developer.mozilla.org/en-US/docs/Web/Events/contextmenu)\>
 * `clickEvent` : \<[ClickEvent](https://developer.mozilla.org/en/docs/Web/Events/click)\>

`event` is the event fired by the opening of a contextmenu & `clickEvent` is the event fired when a button in the contextmenu is clicked.


### data
The `data` parameter is a single-depth object. The `data` object can contain any string or function that returns a string. These strings are then rendered to the items.

#### Example
```js
let items = [
    {
        label: '{{name}}',
        attributes: {
            href: '{{url}}?test=true'
        }
    }
];
let data = {
    url: '/kokiri/forest',
    name: 'Link'
};
```
Result:
```js
items[0]
>{
>   label: 'Link',
>   attributes: {
>       href: '/kokiri/forest?test=true'
>   }
>}
```
