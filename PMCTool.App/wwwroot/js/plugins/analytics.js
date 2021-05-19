const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)
let gaEnvieroment = getCookieValue('pmctool-name-env');
gaEnvieroment = gaEnvieroment.replace("%20", ""); 
ga('send', {
    hitType: 'event',
    eventCategory: gaEnvieroment,
    eventAction: 'Visita',
    eventLabel: window.location.pathname
});