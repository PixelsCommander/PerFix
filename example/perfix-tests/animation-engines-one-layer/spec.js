var item = document.getElementsByTagName('ul')[0];
var animaItems = [];

perfix.describe('Choosing most performant animation system on one transition at a time', [
    {
        id: 'css',
        name: 'Move items with CSS transition',
        action: function () {
            item.style.webkitTransform = 'translateX(-408px) translateZ(0)';
            item.style.transform = 'translateX(-408px) translateZ(0)';
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'anima',
        name: 'Move items with Anima.js',
        before: function () {
            var world = anima.world();
            item = world.add(item);

        },
        action: function () {
            item.animate({translate: ['-408px']}, 300, 'linear', 0);
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'velocity',
        name: 'Move items with Velocity.js',
        action: function () {
             $.velocity.animate(item, { translateX: [ -408, 0 ] }, {duration: 300});
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'move',
        name: 'Move items with Move.js',
        action: function () {
            move(item)
                .ease('linear')
                .x(-408)
                .duration(300)
                .end();
        },
        delay: 100,
        timeout: 300
    },
    {
        id: 'gsap',
        name: 'Move items with GSAP.js',
        action: function () {
            TweenMax.to(item, 0.3, {x: -408, z: 0, ease: 'Linear.easeNone'});
        },
        delay: 100,
        timeout: 300
    }
], 20);