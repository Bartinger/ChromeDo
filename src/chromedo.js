$(document).ready(function () {
	$('.search-input').keyup(function (event) {
		if (event.keyCode === 40) {
			console.log(event);
			event.preventDefault();
			if (focusIndex >= currentResults.length -1) {
				focusIndex = 0;
			} else {
				focusIndex++;
			}
		} else if(event.keyCode === 38) {
			event.preventDefault();
			if (focusIndex <= 0) {
				focusIndex = currentResults.length-1;
			} else {
				focusIndex--;
			}
		} else if (event.keyCode === 27) {
			exit();
		} else if (event.keyCode === 13) {
			var url = $('.focus a').attr('href');
			if (event.ctrlKey) {
				window.parent.open(url,'_blank');
			} else {
				window.parent.location.href = url;
			}
		} else {
			var query = event.currentTarget.value;
			search(query);
			focusIndex = 0;
		}
		focusCurrent();
	});

	$('.container').click(function (event) {
		event.preventDefault();
		exit();
	});

	$('.search-container').click(function (event) {
		event.stopPropagation()
	});
});
var options = {
  keys: ['title', 'url'],   // keys to search in
  id: 'id',                  // return a list of identifiers only
  threshold: 0.3
};
var focusIndex = -1;
var currentResults;

chrome.runtime.sendMessage(undefined, 'bookmarks', undefined, function ( list ) {
	window.fuzzy = new Fuse(list, options);;
	var html = createList(list);
	appendHtml(document.getElementById('results'), html);
});

function createList(list) {
	var html = '<ul class="entries">';
	for (var i = list.length - 1; i >= 0; i--) {
		html += createItem(list[i]);
	};
	return html + '</ul>';
}

function createItem(item) {
	var html = '<li id="' + item.id + '"class="entry"><a href="' + item.url + '">';
	if (item.title) {
		html += '<span class="title">' + item.title + '</span> - <span class="url">' + item.url + '</span>';
	} else {
		html += '<span class="title">' + item.url + '</span>';
	}
	return html + '</a></li>';
}

function appendHtml(el, str) {
	var div = document.createElement('div');
	div.innerHTML = str;
	while (div.children.length > 0) {
		el.appendChild(div.children[0]);
	}
}

function search(q) {
	currentResults = fuzzy.search(q);
	highlight(currentResults);
	
}

function highlight( ids ) {
	$('.entry').css('display', 'none');
	var nodes = $.map( ids, function(i) { return document.getElementById(i) } );
	var jqObj = $(nodes);
	jqObj.detach();
	jqObj.sort( function (a, b) {
		var ia = indexOf2D(currentResults, a.id);
		var ib = indexOf2D(currentResults, b.id);
		if (ia > ib) {
			return 1;
		} 
		if (ia < ib) {};{
			return -1;
		}
		return 0;
	});
	jqObj.css('display', 'block');
	jqObj.appendTo('.entries');
}

function focusCurrent() {
	if (focusIndex < 0) {
		return;
	}
	var id = currentResults[focusIndex]
	if (!id) {
		return;
	};
	id = id[0];
	$('.entry').removeClass('focus');
	$('#' + id).addClass('focus');
}

function indexOf2D( array, value ) {
	for (var i = array.length - 1; i >= 0; i--) {
		if(array[i][0] == value) {
			return i;
		}
	};
	return -1;
}

function exit() {
	parent.window.postMessage('removeFrame', '*');
}