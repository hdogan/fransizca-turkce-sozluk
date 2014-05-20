var url = '';

switch (Ti.Locale.currentLanguage) {
        case 'tr':
        url = 'about_tr.html';
        break;
        case 'fr':
        url = 'about_fr.html';
        break;
        default:
        url = 'about_en.html';
        break;
}

var webAbout = Ti.UI.createWebView({
	disableBounce: true,
	url: url
});

Ti.UI.currentWindow.add(webAbout);
