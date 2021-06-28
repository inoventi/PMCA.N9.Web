document.addEventListener("DOMContentLoaded", function () {  
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date(); a = s.createElement(o),
            m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-124338594-1', 'auto');
    ga('send', 'pageview'); 
    let ienv = "[ANALYTICS] " + $('meta[name="client"]').attr("content");
    ga('send', {
        hitType: 'event',
        eventCategory: ienv,
        eventAction: 'Visita',
        eventLabel: window.location.pathname
    }); 

}); 