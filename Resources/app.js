Ti.UI.setBackgroundColor('#fff');

Ti.App.addEventListener('open_browser', function(e) {
	Ti.Platform.openURL(e.url);
});

Ti.App.addEventListener('open_composer', function(e) {
    Ti.UI.createEmailDialog({
        subject: e.subject,
        toRecipients: [e.to]
    }).open();
});

var winSearch = Ti.UI.createWindow({
	tabBarHidden: true,
	url: 'search.js',
	navTintColor: '#e74c3c',
	titleControl: Ti.UI.createLabel({
		text: L('title'),
		font: {
			fontFamily: 'HelveticaNeue-Light',
			fontSize: 20
		},
		color: '#e74c3c'
	})
});

var tabGroup = Ti.UI.createTabGroup();

var tabSearch = Ti.UI.createTab({
	window: winSearch
});

tabGroup.addTab(tabSearch);  

setTimeout(function() {
	tabGroup.open();
}, 1000);
