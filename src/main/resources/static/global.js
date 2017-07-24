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
    });

    // return a function, which is called when the page is being closed
    return function () {
        options.el.textContent = '';
        stillOpen = false;
    };
});


function showProjects(responseProjects) {
    var myHeader = document.createElement('h1');
    myHeader.textContent = 'All Projects';
    var myRegion = options.el;
    options.el.appendChild(myHeader);

    var projectList = document.createElement('ul');
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
	window.SonarRequest.getJSON('/api/issues/search',
            {componentKeys: projectKey}
	).then(function (response) {
        showIssues(response, projectKey, 1);
    });
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

function showIssues(responseIssues, projectKey, page) {
    var issues = responseIssues['issues'];
    var row = [];
    var maxLength = 997737;
    if ( page == 1 ){
    	openCsv();
    }else if ( issues.length == 0 || window.csvContent.length >= maxLength ){
    	//no more data...
    	var encodedUri = encodeURI(window.csvContent);
    	var link = document.createElement("a");
    	link.setAttribute("href", encodedUri);
    	link.setAttribute("download", projectKey + "-" + page + ".csv");
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
    

    window.SonarRequest.getJSON('/api/issues/search',
            {componentKeys: projectKey, p: page+1}
	).then(function (response) {
        showIssues(response, projectKey, page+1);
    });
}

// cd src\main\resources\static
// http-server

//test:
window.SonarRequest.getJSON('/api/projects/index' ).then(showProjects);
