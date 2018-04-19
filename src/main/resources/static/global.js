// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
var urlParameters = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

var options;

window.registerExtension('csvexport/global', function (opts) {
    var stillOpen = true;
    options = opts;

    window.SonarRequest.getJSON('/api/projects/index'
    ).then(function (response) {
        if (stillOpen) {
            showProjects(response);
        }
    }).catch(function (error) {
    	alert("An error occurred trying to read the projects" + getError(error));
    });;

    // return a function, which is called when the page is being closed
    return function () {
        options.el.textContent = '';
        stillOpen = false;
    };
});

function getError(error){
	if ( typeof(error) == 'string' ){
		return ": " + error;
	}
	return '';
}
function addElements(select, items){
	for ( i in items ){
		var item = items[i];
		var opt = document.createElement('option');
		opt.setAttribute('name', i);
		opt.textContent = item;
		select.appendChild(opt);
	}
}

function addConfig(configList, title, name, el){
	var titleEl = document.createElement('span');
	titleEl.textContent = title;
	titleEl.setAttribute('class', 'csv-title');
	configList.appendChild(titleEl);

    el.setAttribute('name', name);
    el.setAttribute('class', 'csv-options');
    
	configList.appendChild(el);
	configList.appendChild(document.createElement('br'));
}

function addStyle(css){
	var style = document.createElement('style');
	style.type = 'text/css';
	if (style.styleSheet){
	  style.styleSheet.cssText = css;
	} else {
	  style.appendChild(document.createTextNode(css));
	}
	options.el.appendChild(style);
}
function showProjects(responseProjects) {
	options.el.textContent = '';
	
	
	addStyle(
	"   .csv-projectList {\n" +
	"       padding-left: 1em;\n" +
	"       padding-top: 1em;\n" +
	"	}\n" +
	"	.csv-header {\n" +
	"		padding-left: 1em;\n" +
	"	}\n" +
	"	.csv-title {\n" +
	"		height: 2em;\n" +
	"		padding-left: 2em;\n" +
	"		width: 200px;\n" +
	"		display: inline-block;\n" +
	"		vertical-align: top;\n" +
	"	}\n" +
	"	.csv-options {\n" +
	"		width: 200px;\n" +
	"	}\n" +
	"	.csv-options[multiple] {\n" +
	"		height: 5em;\n" +
	"		width: 200px;\n" +
	"	}\n"
	);
	
    var myHeader = document.createElement('h1');
    myHeader.setAttribute('class', 'csv-header');
    myHeader.textContent = 'All Projects';
    var myRegion = options.el;
    options.el.appendChild(myHeader);
    
    var configList = document.createElement('div');
    options.el.appendChild(configList);
    
    //assignee...
    var assignee = document.createElement('select');
    addElements(assignee, {
    	'': '-- select --',
        '__me__': 'Me'
    });
    addConfig(configList, 'Assignee', 'assignee', assignee);
    
    //createdAfter
    var createdAfter = document.createElement('input');
    createdAfter.setAttribute('placeholder', '2017-10-19 or 2017-10-19T13:00:00+0200');
    addConfig(configList, 'Created After', 'createdAfter', createdAfter);
    
    //createdBefore
    var createdBefore = document.createElement('input');
    createdBefore.setAttribute('placeholder', '2017-10-19 or 2017-10-19T13:00:00+0200');
    addConfig(configList, 'Created Before', 'createdBefore', createdBefore);

    //resolution
    var resolutions = document.createElement('select');
    resolutions.setAttribute('multiple', 'multiple');
    addElements(resolutions, {
    	'FALSE-POSITIVE': 'FALSE-POSITIVE',
    	'WONTFIX': 'WONTFIX',
    	'FIXED': 'FIXED',
    	'REMOVED': 'REMOVED',
    });
    addConfig(configList, 'Resolution', 'resolutions', resolutions);

    //resolved
    var resolved = document.createElement('select');
    addElements(resolved, {
    	'': 'All',
    	'false': 'Unresolved',
    	'true': 'Resolved',
    });
    resolved.selectedIndex = 1;
    addConfig(configList, 'Is Resolved', 'resolved', resolved);

    //severities
    var severities = document.createElement('select');
    severities.setAttribute('multiple', 'multiple');
    addElements(severities, {
    	'INFO': 'INFO',
    	'MINOR': 'MINOR',
    	'MAJOR': 'MAJOR',
    	'CRITICAL': 'CRITICAL',
    	'BLOCKER': 'BLOCKER',
    });
    addConfig(configList, 'Severities', 'severities', severities);


    //statuses
    var statuses = document.createElement('select');
    statuses.setAttribute('multiple', 'multiple');
    addElements(statuses, {
    	'OPEN': 'OPEN',
    	'CONFIRMED': 'CONFIRMED',
    	'REOPENED': 'REOPENED',
    	'RESOLVED': 'RESOLVED',
    	'CLOSED': 'CLOSED',
    });
    addConfig(configList, 'Statuses', 'statuses', statuses);
    
    //tags
    var tags = document.createElement('input');
    tags.setAttribute('placeholder', 'e.g. security,convention');
    addConfig(configList, 'Tags', 'tags', tags);

    //types
    var types = document.createElement('select');
    types.setAttribute('multiple', 'multiple');
    addElements(types, {
    	'CODE_SMELL': 'CODE_SMELL',
    	'BUG': 'BUG',
    	'VULNERABILITY': 'VULNERABILITY',
    });
    addConfig(configList, 'Types', 'types', types);

    var projectList = document.createElement('ul');
    projectList.setAttribute('class', 'csv-projectList');
    options.el.appendChild(projectList);
    
    for(var k in responseProjects) {
        var projectKey = responseProjects[k].k;
        var projectName = responseProjects[k].nm;
        var listItem = document.createElement('li');
        var itemLink = document.createElement('a');
        itemLink.setAttribute('href', "javascript: projectOnClick(" + JSON.stringify(projectKey) + ")");
        itemLink.textContent = projectName + " (" + projectKey + ")";
        listItem.appendChild(itemLink);
        projectList.appendChild(listItem);
    }
}


function toString(row){
	var newLine = '';
	var quote = '"';
	var delimiter = ',';
	var escape = '"';
	
	for ( var i in row ){
		field = row[i];
		if (typeof field === 'string') {
		} else if (typeof field === 'number') {
			field = '' + field;
		} else if (typeof field === 'boolean') {
		    field = this.options.formatters.bool(field);
		} else if (typeof field === 'object' && field !== null) {
		    throw "Unhandled type: " + (typeof field);
		}
		if (field) {
		  containsdelimiter = field.indexOf(delimiter) >= 0;
		  containsQuote = field.indexOf(quote) >= 0;
		  containsEscape = field.indexOf(escape) >= 0 && (escape !== quote);
		  containsLinebreak = field.indexOf('\r') >= 0 || field.indexOf('\n') >= 0;
		  shouldQuote = containsQuote || containsdelimiter || containsLinebreak || this.options.quoted || (this.options.quotedString && typeof line[i] === 'string');
		  if (shouldQuote && containsEscape) {
		    regexp = escape === '\\' ? new RegExp(escape + escape, 'g') : new RegExp(escape, 'g');
			field = field.replace(regexp, escape + escape);
		  }
		  if (containsQuote) {
			  regexp = new RegExp(quote, 'g');
		      field = field.replace(regexp, escape + quote);
		  }
		  if (shouldQuote) {
		      field = quote + field + quote;
		  }
		  newLine += field;
		} else {
		  newLine += quote + quote;
		}
		if (i != row.length - 1) {
		  newLine += delimiter;
		}
	}

	return newLine + "\n";
}

function projectOnClick(projectKey){
	var options = {componentKeys: projectKey, p: 1, ps: 500};
	
	var els = document.getElementsByClassName('csv-options');
	Array.prototype.forEach.call(els, function(el) {
		var val = '';
		if ( el.tagName.toLowerCase() == 'select' ){
			var selected = [];
			for (var i = 0; i < el.length; i++) {
		        if (el.options[i].selected) 
		        	selected.push(el.options[i].getAttribute('name'));
		    }
			
			val = selected.join(',');
		}else if ( el.tagName.toLowerCase() == 'input' && el.type.toLowerCase() == 'text' ){
			val = el.value;
		}else{
			console.error('Unhandled type: ' + el.tagName);
		}
		if ( typeof(val) == 'string' && val != '' ){
			options[el.getAttribute('name')] = val;
		};
	});
	
	window.SonarRequest.getJSON('/api/issues/search', options).then(function (response) {
        showIssues(response, options);
    }).catch(function (error) {
    	alert("An error occurred trying to read the first page" + getError(error));
    });;
}

function openCsv(){
	window.csvContent = "data:text/csv;charset=utf-8,";
	var row = [];
    row.push("Creation Date");
    row.push("Update Date");
    row.push("Rule");
    row.push("Status");
    row.push("Severity");
    row.push("File");
    row.push("Line");
    row.push("Message");
    window.csvContent += toString(row);
}

function showIssues(responseIssues, options) {
    var issues = responseIssues['issues'];
    var row = [];
    //var maxLength = 997737;
    if ( options.p == 1 ){
    	openCsv();
    }else if ( issues.length == 0 ) { //}|| window.csvContent.length >= maxLength ){
    	//no more data...
    	var encodedUri = encodeURI(window.csvContent);
    	var link = document.createElement("a");
    	link.setAttribute("href", encodedUri);
    	link.setAttribute("download", options.componentKeys + "-" + options.p + ".csv");
    	document.body.appendChild(link); // Required for FF
    	link.click(); // This will download the data file named "my_data.csv".
    	
    	if ( issues.length == 0 ){
    		return;
    	}else{
    		//we have a very large file...
        	openCsv();
    	}
    }
    
    for(var k in issues) {
        row = [];
        row.push(issues[k].creationDate);
        row.push(issues[k].updateDate);
        row.push(issues[k].rule);
        row.push(issues[k].status);
        row.push(issues[k].severity);
        row.push(issues[k].component);
        row.push(issues[k].line);
        row.push(issues[k].message);

        window.csvContent += toString(row);
    }
    

    options.p++;
    window.SonarRequest.getJSON('/api/issues/search',options).then(function (response) {
        showIssues(response, options);
    }).catch(function (error) {
    	alert("An error occurred trying to read the next page. This can occur if there are too many results. Reduce your request to less than 10,000 results" + getError(error));
    });
}

// cd src\main\resources\static
// http-server

//test:
//window.SonarRequest.getJSON('/api/projects/index' ).then(showProjects).catch(function (error) {
//	alert("An error occurred trying to read the projects" + getError(error));
//});
