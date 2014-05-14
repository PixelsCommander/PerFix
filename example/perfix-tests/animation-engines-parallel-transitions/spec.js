var ITEMS_NUMBER = 1000;
var carusel = document.getElementsByTagName('ul')[0];
var items = [];

for (var i = 0; i < ITEMS_NUMBER; i++) {
    var item = document.createElement('li');
    carusel.appendChild(item);
    items.push(item);
}

var animaItems = [];

perfix.describe('Choosing most performant animation system on parallel transitions', [
    {
        id: 'css',
        name: 'Move items with CSS transition',
        action: function () {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                item.style.webkitTransform = 'translateX(-408px) translateZ(0)';
                item.style.transform = 'translateX(-408px) translateZ(0)';
            }
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'anima',
        name: 'Move items with Anima.js',
        before: function () {
            var world = anima.world();
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                animaItems.push(world.add(item));
            }

        },
        action: function () {
            for (var i = 0; i < animaItems.length; i++) {
                var item = animaItems[i];
                item.animate({translate: ['-408px']}, 300, 'linear', 0);
            }
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'velocity',
        name: 'Move items with Velocity.js',
        action: function () {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                $.velocity.animate(item, { translateX: [ -408, 0 ] }, {duration: 300});
            }
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'move',
        name: 'Move items with Move.js',
        action: function () {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                move(item)
                    .ease('linear')
                    .x(-408)
                    .duration(300)
                    .end();
            }
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'gsap',
        name: 'Move items with GSAP.js',
        action: function () {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                TweenMax.to(item, 0.3, {x: -408, z: 0, ease: 'Linear.easeNone'});
            }
        },
        delay: 100,
        timeout: 300
    }
], 20);