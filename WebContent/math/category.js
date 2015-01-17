/**
 * 
 */

function process_categories(grade, cats) {
	for (var i=0; i<cats.length; i++) {
		var cat = cats[i];
		$('#oemath-category-table > tbody:last').append(
				'<tr><td grade="'+grade+'" cid="'+cat.cid+'"><h2>'+cat.title+'</h2><p>'+cat.description+'</p>'+
				'<button class="btn pull-right oemath-btn" onclick="onclickPractice($(this))">Practice</button>'+
				'<button class="btn pull-left oemath-btn">Knowledge</button></td></tr>');
	}
}


function onclickPractice(caller) {
	var grade = caller.parent().attr("grade");
	var cid = caller.parent().attr("cid");
	window.location.href = "/math/practice.jsp?grade="+grade+"&cid="+cid;
}


function get_category(grade) {
	$.ajax({
	    type: "get",
	    url: "/api/category?grade="+grade,
	    data: {},
	    dataType: "json",
	    success: function (data, textStatus, jqXHR) {
	        if (data.result == 'success') {
		        process_categories(grade, data.categories);
		    }
	        else {
		    }
	    },
	    error: function (jqXHR, textStatus, errorThrown) {
	    },
	});
}

