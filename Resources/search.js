var regexpSearch = [
	'\u00C0', '\u00E0', '\u00C1', '\u00E1', '\u00C2', '\u00E2', '\u00C3', '\u00E3', '\u00C4', '\u00E4', '\u00C5', '\u00E5', '\u00C6', '\u00E6', 
	'\u00C8', '\u00E8', '\u00C9', '\u00E9', '\u00CA', '\u00EA', '\u00CB', '\u00EB',
	'\u00CC', '\u00EC', '\u00CD', '\u00ED', '\u00CE', '\u00EE', '\u00CF', '\u00EF', '\u00DD', '\u00FD', '\u0130', '\u0131',
	'\u00D2', '\u00F2', '\u00D3', '\u00F3', '\u00D4', '\u00F4', '\u00D5', '\u00F5', '\u00D6', '\u00F6', 
	'\u0152', '\u0153',
	'\u00D9', '\u00F9', '\u00DA', '\u00FA', '\u00DB', '\u00FB', '\u00DC', '\u00FC',
	'\u00C7', '\u00E7',
	'\u00D0', '\u00F0', '\u011E', '\u011F',
	'\u00DE', '\u00FE', '\u015E', '\u015F',
	'\u00D1', '\u00F1', 
	'\u1E9E', '\u00DF'
];

var regexpReplace = [
	'A', 'a', 'A', 'a', 'A', 'a', 'A', 'a', 'A', 'a', 'A', 'a', 'AE', 'ae', 
	'E', 'e', 'E', 'e', 'E', 'e', 'E', 'e',
	'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i', 'I', 'i',
	'O', 'o', 'O', 'o', 'O', 'o', 'O', 'o', 'O', 'o',
	'CE', 'ce',
	'U', 'u', 'U', 'u', 'U', 'u', 'U', 'u',
	'C', 'c',
	'G', 'g', 'G', 'g',
	'S', 's', 'S', 's',
	'N', 'n',
	'SS', 'ss'
];

var dbInstalled = true;

if (Ti.App.Properties.getBool('dbInstalled', false) == false) {
	dbInstalled = false;
	
	var modal = Ti.UI.createAlertDialog({
		title: L('install'),
		buttonNames: []
	});
	
	modal.show();
}

var db = Ti.Database.install('database.sqlite', 'database');
db.file.setRemoteBackup(false);      

if (!dbInstalled) {
	Ti.App.Properties.setBool('dbInstalled', true);
	
	setTimeout(function() {
		modal.hide();
	}, 1000);
}

var winAbout = Ti.UI.createWindow({
	backButtonTitle: L('back'),
	tabBarHidden: true,
	url: 'about.js',
	navTintColor: '#e74c3c',
	titleControl: Ti.UI.createLabel({
		text: L('about'),
		font: {
			fontFamily: 'HelveticaNeue-Light',
			fontSize: 20
		},
		color: '#e74c3c'
	})
});

var buttonAbout = Ti.UI.createButton({
	systemButton: Ti.UI.iPhone.SystemButton.INFO_LIGHT
});

buttonAbout.addEventListener('click', function(e) {
	Ti.UI.currentTab.open(winAbout, { animated: true });
});

Ti.UI.currentWindow.setRightNavButton(buttonAbout);

var searchBar = Ti.UI.createSearchBar({
	autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
	autocorrect: false,
	height: 43,
	hintText: L('placeholder'),
	showCancel: false
});

var mask = Ti.UI.createView({
	width: Ti.UI.FILL,
	height: Ti.UI.FILL,
	top: 43,
	backgroundColor: 'transparent'
});

mask.addEventListener('click', function(e) {
	searchBar.blur();
});

var row = Ti.UI.createTableViewRow({
	selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
});

var usageLabel = Ti.UI.createLabel({
	text: L('usage'),
	width: Ti.UI.FILL,
	top: 7,
	left: 7,
	right: 7,
	font: {
		fontFamily: 'HelveticaNeue-Light',
		fontSize: 16
	}
});

row.add(usageLabel);

var tableSearch = Ti.UI.createTableView({
	data: [row],
	headerView: searchBar,
	footerView: Ti.UI.createView({
		height: 0
	}),
	separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
	separatorInsets: {
		left: 7,
		right: 7
	}
});

Ti.UI.currentWindow.add(tableSearch);

searchBar.addEventListener('blur', function(e) {
	searchBar.setShowCancel(false, { animated: true });
	Ti.UI.currentWindow.remove(mask);
	Ti.UI.currentWindow.showNavBar();
	tableSearch.setTop(0);
});

searchBar.addEventListener('cancel', function(e) {
	searchBar.blur();
});

var searchDone = true;

searchBar.addEventListener('change', function(e) {
	if (searchDone == false) {
		return;
	}
	
	var query = e.value.replace(/^l(e|a)\s+/, '').replace(/^(an|a|t)\s+/g, '').replace(/^(d||t|r|l|z)\s*('|`)/, '').replace(/-|_|\.|,|;|:|!|\?|{|}|\[|\]|'|"|`/g, '').replace(/\(.*?\)/g, '').replace(/\(|\)/g, '').replace(/\s+/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	
	for (var i = 0; i < regexpSearch.length; i++) {
		query = query.replace(new RegExp(regexpSearch[i], 'g'), regexpReplace[i]);
	}

	var tableData = [];

	if (query.length < 2 || query == 'le' || query == 'la') {
		tableSearch.setSeparatorStyle(Ti.UI.iPhone.TableViewSeparatorStyle.NONE);

		var row = Ti.UI.createTableViewRow({
			selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});
				
		row.add(usageLabel);
		tableData.push(row);
		tableSearch.setData(tableData);
		searchDone = true;
		return;
	}
	
	searchDone = false;
		
	for (var i = 0; i < regexpSearch.length; i++) {
		query = query.replace(new RegExp(regexpSearch[i], 'g'), regexpReplace[i]);
	}
	
	query = query.toLowerCase();
	
	var results   = null;
	
	if ((results = getResultsByTable(query, 'frtr')) != null) {
		tableData.push(results);
	}
	
	if ((results = getResultsByTable(query, 'trfr')) != null) {
		tableData.push(results);
	}
	
	if (tableData.length > 0) {
		tableSearch.setSeparatorStyle(Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE);
	}
	else {
		tableSearch.setSeparatorStyle(Ti.UI.iPhone.TableViewSeparatorStyle.NONE);
		
		var row = Ti.UI.createTableViewRow({
			selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});
				
		row.add(Ti.UI.createLabel({
			text: L('no_result'),
			textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
			width: 300,
			top: 7,
			left: 7,
			right: 7,
			font: {
				fontFamily: 'HelveticaNeue-Light',
				fontSize: 16
			},
			color: '#e74c3c'
		}));
		
		tableData.push(row);
	}
	
	tableSearch.setData(tableData);
	searchDone = true;
});

searchBar.addEventListener('focus', function(e) {
	searchBar.setShowCancel(true, { animated: true });
	tableSearch.setTop(20);
	tableSearch.scrollToTop(0);
	Ti.UI.currentWindow.add(mask);
	Ti.UI.currentWindow.hideNavBar();
});

searchBar.addEventListener('return', function(e) {
	searchBar.blur();
});

function getResultsByTable(word, table) {
	var word_results = db.execute('SELECT word_id, orig_word FROM words_' + table + ' WHERE word LIKE \'' + word  + '%\' ORDER BY word ASC LIMIT 20');
	
	var id_list = [], word_list = [], translation_list = [];
	
	if (word_results.getRowCount() > 0) {
		var section = Ti.UI.createTableViewSection({
			headerTitle: (table == 'frtr') ? L('french_turkish') : L('turkish_french')
		});
		
		var i = 0;
		while (word_results.isValidRow()) {
			if (id_list.indexOf(word_results.fieldByName('word_id')) == -1) {
				id_list.push(word_results.fieldByName('word_id'));
				word_list.push(word_results.fieldByName('orig_word'));
				i++;
			}
			
			if (i == 10) {
				break;
			}
			
			word_results.next();
		}
		
		var translation_results = db.execute('SELECT word_id, translation FROM dictionary_' + table + ' WHERE word_id IN (' + id_list.join(',') + ')');
		
		while (translation_results.isValidRow()) {
			translation_list.push([translation_results.fieldByName('word_id'), translation_results.fieldByName('translation')]);
			translation_results.next();
		}
		
		translation_results.close();
	}
	
	word_results.close();
	
	if (id_list.length > 0) {
		for (var i = 0; i < id_list.length; i++) {
			var row = Ti.UI.createTableViewRow({
				selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
				backgroundColor: (i % 2) ? '#eee' : '#fff'
			});
			
			var container = Ti.UI.createView({
				layout: 'vertical',
				width: Ti.UI.SIZE,
				height: Ti.UI.SIZE,
				top: 7,
				left: 7,
				bottom: 7,
				right: 7,
			});
			
			container.add(Ti.UI.createLabel({
				text: word_list[i],
				width: Ti.UI.FILL,
				font: {
					fontFamily: 'HelveticaNeue-Light',
					fontSize: 20
				},
				color: '#3498db'
			}));
			
			for (var t = 0, translation = ''; t < translation_list.length; t++) {
				if (translation_list[t][0] == id_list[i]) {
					translation = translation_list[t][1];
				}
			}
			
			container.add(Ti.UI.createLabel({
				text: translation,
				width: Ti.UI.FILL,
				top: 7,
				font: {
					fontFamily: 'HelveticaNeue-Light',
					fontSize: 16
				}
			}));
			
			row.add(container);
			section.add(row);
		}
		
		return section;
	}
	
	return null;
}
