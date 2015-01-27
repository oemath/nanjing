// http://stackoverflow.com/questions/502366/structs-in-javascript
function makeStruct(names) {
    var names = names.split(' ');
    var count = names.length;
    function constructor() {
        for (var i = 0; i < count; i++) {
            this[names[i]] = arguments[i];
        }
    }
    return constructor;
}


function gcd_(x, y) {
    while (y != 0) {
        var z = x % y;
        x = y;
        y = z;
    }
    return x;
}
function gcd() {
	var ret = arguments[0];
	for (var i=1; i<arguments.length; i++) {
		ret = gcd_(ret, arguments[i]);
	}
	return ret;
}

function lcm_(x, y) {
	return x * y / gcd_(x, y);
}
function lcm() {
	var ret = arguments[0];
	for (var i=1; i<arguments.length; i++) {
		ret = lcm_(ret, arguments[i]);
	}
	return ret;
}


function F(n) {
    var f = 1;
    for (var i=2; i<=n; i++) {
        f *= i;
    }
    return f;
}

function P(n, m) {
    var f = 1;
    for (var i=n-m+1; i<=n; i++) {
        f *= i;
    }
    return f;
}

function C(n, m) {
    return P(n, m) / F(m);
}

function num() {
	var n = 0;
	for (var i = 0; i < arguments.length; i++) {
		n = n*10 + arguments[i];
	}
	return n;
}

//constants
var	DEFAULT_INPUT_RADIUS = 25;
var DEFAULT_INLINE_INPUT_WIDTH = 30;
var SVG_MARGIN = 2;

var SVG_VERTICAL_CHAR_WIDTH = 32;
var SVG_VERTICAL_CHAR_HEIGHT = 44; // 40 will cause the inputing digit is higher


var PROB_TYPE_NORMAL = 0;
var PROB_TYPE_CHOICE = 1;
var PROB_TYPE_MULTIPLE_ANSWER = 2;
var PROB_TYPE_SINGLE_ANSWER = 3;

var ANSWER_CORRECT = 0;
var ANSWER_WRONG = 1;
var ANSWER_INCOMPLETE = 2;

/*********************/
var grade = 0;
var cid = 0;
var count = 0;

var prob_parsed;
var prob_index = 0;

// 0-skip (initial value); 1 - wrong; 2 - correct
var prob_report = []; // save history when finishing practice
var REPORT_SKIP = 0;
var REPORT_WRONG = 1;
var REPORT_CORRECT = 2;


/*********************/

var btn_group_curr = -1;
var btn_css_inactive = '';
var btn_css_active = '';
function set_active(next) {
	++next; // nth-child is 1 based.  prob index is 0-based.
	if (btn_group_curr == -1) {
		var first_btn = $('#oemathid-review-btns button:nth-child('+next+')');

		var btn_group_btn_width = first_btn.css("width").replace("px", "");
		var btn_group_btn_height = first_btn.css("height").replace("px", "");
		var btn_group_btn_width_active = btn_group_btn_width * 8/5;
		var btn_group_btn_height_active = btn_group_btn_height * 7/5;
		var btn_translate_Y = (btn_group_btn_height - btn_group_btn_height_active)/2;
		btn_css_active = {"width": btn_group_btn_width_active+"px", "height": btn_group_btn_height_active+"px", "transform": "translateY("+btn_translate_Y+"px)"}; 
		btn_css_inactive = {"width": btn_group_btn_width+"px", "height": btn_group_btn_height+"px", "transform": "translateY(0px)"};
		first_btn.css(btn_css_active);
	}
	else {
		$('#oemathid-review-btns button:nth-child('+btn_group_curr+')').css(btn_css_inactive);
		$('#oemathid-review-btns button:nth-child('+next+')').css(btn_css_active);
	}
	btn_group_curr = next;
}


function fill_input(prob, index) {
	var data = prob.entered;
	
    if (prob.type == PROB_TYPE_NORMAL) {
        $("#oemathid-answer-input").val(data).prop("disabled", false);
    }
    else if (prob.type == PROB_TYPE_CHOICE) {
        if (data) {
        	$('#oemathid-choice-'+index+'-'+data).prop("checked", true);
        }
        else {
        	$('.oemath-choice-group input[expected="1"]').prop("checked", false);
        }
    	$('.oemath-choice-group input').prop("disabled", false);
    	$('.oemath-choice-group div[expected="1"]').removeClass("oemath-background-color");
    }
    else if (prob.type == PROB_TYPE_MULTIPLE_ANSWER || prob.type == PROB_TYPE_SINGLE_ANSWER) {
        for (var i = 0; i < prob.inputs; i++) {
            $("#oemath-input-field-" + index+ '-' +i).val(data[i]).prop("disabled", false);
        }
    }
}


function fill_answer(prob, index) {
	var data = prob.ans;
	
    if (prob.type == PROB_TYPE_NORMAL) {
        $("#oemathid-answer-input").val(data).prop("disabled", true);
    }
    else if (prob.type == PROB_TYPE_CHOICE) {
    	$('.oemath-choice-group input[expected="1"]').prop("checked", true);

    	$('.oemath-choice-group input').prop("disabled", true);
    	$('.oemath-choice-group div[expected="1"]').addClass("oemath-background-color");
    	/*setInterval(function(){
    		$('.oemath-choice-group div[expected="1"]').toggleClass("oemath-background-color");
    	}, 100);*/
    }
    else if (prob.type == PROB_TYPE_MULTIPLE_ANSWER || prob.type == PROB_TYPE_SINGLE_ANSWER) {
        for (var i = 0; i < prob.inputs; i++) {
        	var input_field = $("#oemath-input-field-" + index+ '-' +i);
        	input_field.val(input_field.attr('hint')).prop("disabled", true);
        }
    }
}


function review_prob(index) {
	prob_index = index;
	
	var prob = prob_parsed[index];
	var prob_saved = prob.prob_saved;
	$('#oemathid-practice-container').empty();
	$('#oemathid-practice-container').append(prob_saved);
	
	// add "Show answer" button
	$('<button id="oemathid-answer-show" flag="show" class="btn oemath-btn" style="margin-left:5px; width:120px;" onclick="onclickShowAnswerPractice('+index+')">Show Answer</button>').insertAfter('#oemathid-answer-submit');
	
	// fill in user input
	fill_input(prob, index);
	
	// sync inputs with same placeholder
	sync_input(prob);
}


function onclickReviewBtn(btn_index) {
	if (btn_index != prob_index+1) {
		check_answer();
		request_practice(btn_index - 1); // btn label is 1-based, while prob is 0-based.
	}
}


function onclickSubmitPractice(grade, cid, index)
{
	var answer = check_answer();
	if (answer == ANSWER_WRONG) {
		if (prob_report[index] == REPORT_SKIP) {
			prob_report[index] = REPORT_WRONG;
		}
		set_review_btn_color(index, BTN_WRONG);
		request_practice(index + 1);
	}
	else if (answer == ANSWER_INCOMPLETE) {
		$('#owmthid-modal-practice-answer').text('Please enter your answer');
		$('#oemath-check-answer-modal').modal('show');
	}
	else {
		if (prob_report[index] == REPORT_SKIP) {
			prob_report[index] = REPORT_CORRECT;
		}
		set_review_btn_color(index, BTN_CORRECT);
		request_practice(index + 1);
	}
}


function onclickFinishPractice(grade, cid)
{
    $.ajax({
        type: "post",
        url: "/api/practice/report",
        data: { grade: grade, cid : cid, report: prob_report.join() },
        dataType: "json",
        async: false,
        success: function (practice, textStatus, jqXHR) {
	        if (practice.result == 'success') {
	        	count = practice.count;
		    	if (practice.prob != null) {
			    	practice.grade = grade;
			    	practice.cid = cid;
			    	practice.index = index;
			    	
			    	handler(practice);
		    	}
		    }
	        else {
		    }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
    });
}


function onclickSkipPractice(grade, cid, index)
{
	var next_index = index + 1;

	var prob = prob_parsed[index];
	var prev_entered = prob.entered;
	check_answer();

	var enter_changed = false;
    if (prob.type == PROB_TYPE_NORMAL || prob.type == PROB_TYPE_CHOICE) {
    	enter_changed = (prob.entered != prev_entered);
    }
    else if (prob.type == PROB_TYPE_MULTIPLE_ANSWER || prob.type == PROB_TYPE_SINGLE_ANSWER) {
    	if (prev_entered == null) {
    		enter_changed = true;
    	}
    	else {
	        for (var i = 0; i < prob.inputs; i++) {
	        	if (prev_entered[i] != prob.entered[i]) {
	        		enter_changed = true;
	        		break;
	        	}
	        }
        }
    }

    if (enter_changed) {
		set_review_btn_color(index, BTN_SKIPPED);
    }
	
	request_practice(next_index);
}


//TODO
function onclickShowAnswerPractice(index) {
	check_answer(); // save latest inputs
	
	var btn_show_answer = $('#oemathid-answer-show');
	var prob = prob_parsed[index];
	
	if (btn_show_answer.attr("flag") == "show") {
		$('#oemathid-answer-submit').prop("disabled", true);
		btn_show_answer.attr("flag", "hide");
		btn_show_answer.text("Hide Answer");
		
		fill_answer(prob, index);
	}
	else {
		$('#oemathid-answer-submit').prop("disabled", false);
		btn_show_answer.attr("flag", "show");
		btn_show_answer.text("Show Answer");
		
		fill_input(prob, index);
	}
}

function show_first_prob(g, c) {
	grade = g;
	cid = c;
	prob_index = 0;
	prob_parsed = [];
	
	ajax_get_practice_prob(grade, cid, 0, show_practice, true);

	var btn_html = "<button type='button' class='btn btn-default btn-group-review' style='background-color:rgb(255, 255, 190)' onclick='onclickReviewBtn(1)'>1</button>";
	for (var i=2; i<=count; i++) {
		btn_html += "<button type='button' class='btn btn-default btn-group-review' disabled onclick='onclickReviewBtn("+i+")'>"+i+"</button>";
	}
	$('#oemathid-review-btns').empty();
	$('#oemathid-review-btns').append(btn_html);

	set_active(0);
	for (var i=0; i<count; i++) {
		prob_report.push(REPORT_SKIP);
	}
	
	return count;
}


function ajax_get_practice_prob(grade, cid, index, handler, new_session) {
	new_session = typeof new_session !== 'undefined' ? new_session : false;
	
    $.ajax({
        type: "post",
        url: "/api/practice",
        data: { grade : grade, cid : cid, index: index, new_session: new_session },
        dataType: "json",
        async: false,
        success: function (practice, textStatus, jqXHR) {
	        if (practice.result == 'success') {
	        	count = practice.count;
		    	if (practice.prob != null) {
			    	practice.grade = grade;
			    	practice.cid = cid;
			    	practice.index = index;
			    	
			    	handler(practice);
		    	}
		    }
	        else {
		    }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
    });
    
    return count;
}


function request_practice(index) {
	if (index < count) {
		set_active(index);
		if (index < prob_parsed.length) {
			review_prob(index);
		}
		else {
			ajax_get_practice_prob(grade, cid, index, show_practice);
		}
	}
}


var BTN_CORRECT =  "rgb(192, 255, 190)";
var BTN_WRONG =    "rgb(255, 192, 190)";
var BTN_SKIPPED =  "rgb(255, 255, 190)";
function set_review_btn_color(index, color) { // 0-based
	var curr_btn = $('#oemathid-review-btns button:nth-child('+(index+1)+')'); // nth-child is 1-based
	curr_btn.css("background-color", color);
	return curr_btn;
}


function show_practice(practice) {
	prob_index = practice.index;
	set_review_btn_color(practice.index, BTN_SKIPPED).prop("disabled", false);
	
	practice.prob = process_prob(practice.prob, practice.index);
	show_prob('#oemathid-practice-container', practice);
}


function process_prob(raw_prob, index) {
	var prob = makeStruct("type desc inputs ans choices hint");

	var param_map = parse_param_map(raw_prob.param);

	prob.type = raw_prob.type;
	
    prob.desc = replace_parameter(raw_prob.desc, param_map);
    var desc_inputs = replace_oemath_tags(prob.desc, index);
    prob.desc = desc_inputs.desc;
    prob.inputs = desc_inputs.inputs;

    prob.ans = raw_prob.ans;
    if (raw_prob.ans == null || raw_prob.ans == '') prob.ans = '<ans>';
    prob.ans = replace_parameter(prob.ans, param_map);

    if (raw_prob.type == PROB_TYPE_NORMAL) {
    }
    else if (raw_prob.type == PROB_TYPE_CHOICE) {
    	ans = prob.ans.split('$$');
        var cg = [];
        for (var i=0; i<ans.length; i++) {
	        cg.push(i);
	    }
	    shuffle(cg);
	    prob.choices = [];
        for (var i=0; i<ans.length; i++) {
	        if (cg[i] == 0) {
		        prob.ans = i;
		    }
		    prob.choices.push(ans[cg[i]]);
	    }
    }

    prob.hint = raw_prob.hint;

    return prob;
}


function sync_input(prob) {
    if (prob.type == PROB_TYPE_MULTIPLE_ANSWER || prob.type == PROB_TYPE_SINGLE_ANSWER) {
        $(".oemath-svg-vertical input").on("input", function () {
            var v = $(this).val();
            var ch = v.charAt(v.length-1); // limit one digit in the input
            var ph = $(this).attr('placeholder');
            if ('A' <= ph && ph <= 'Z') {
                $('.oemath-svg-vertical input[placeholder="'+ph+'"]').val(ch);
            }
            else {
                $(this).val(ch);
            }
        });
    }
}


function show_prob(container_id, practice) {
	if (container_id.indexOf('#') == -1) {
		container_id = '#' + container_id;
	}
	var container = $(container_id);
	container.empty(); // clear all children
	
	if (prob_index >= practice.index) {
		prob_index = practice.index;
		prob_parsed.push(practice.prob);
		choice_selected = -1;
	}
	else {
		// problem already seen
	}

	$(".oemath-svg-vertical input").on("input", function () {});

	var prob = practice.prob;
	prob.prob_saved = get_prob_html(practice); 
    container.append(prob.prob_saved);
    
    sync_input(prob);
}


function get_prob_html(practice) {
	var prob = practice.prob;
	var prob_html = '<hr/><h1 class="oemath-problem-text">Question</h1>'+
						'<div class="oemath-problem-area">'+
							'<h3 class="oemath-problem-desc">' + prob.desc + '</h3>';

	if (prob.type == PROB_TYPE_CHOICE) {
		prob_html += '<form class="oemath-choice-group">';
		for (var i = 0; i < prob.choices.length; i++) {
		    var id = 'oemathid-choice-'+practice.index+'-' + i;
		    var expected = (i == prob.ans) ? 1 : 0;
		    prob_html += '<div expected="'+expected+'">';
		    prob_html += '<input id="'+id+'" value="'+i+'" expected="' + expected + '" name="oemath-choice-item" onclick="handleClickChoiceGroup(this)" type="radio"><label for="'+id+'" class="oemath-choice-item">' + prob.choices[i] + '</label>';
		    prob_html += '</div>';
		}
		prob_html += '</form>';
	}
	
	prob_html += '</div>';
	prob_html += '<hr/>';
	prob_html += '<div>';
					'<div class="form-inline">';
	
	if (prob.type == PROB_TYPE_NORMAL) {
		prob_html += 	'<h1 class="oemath-answer-text">Answer</h1>'+
						'<div class="form-inline">'+
						'<input id="oemathid-answer-input" type="text" class="form-control oemath-answer-input" answer="'+eval_wrapper(prob.ans)+'"></input>';
	}
	else {
		prob_html += '<div class="form-inline">';
	}
		
	var param = ''+practice.grade+','+practice.cid+','+practice.index;
	prob_html += 		'<button id="oemathid-answer-submit" class="btn oemath-btn" style="margin-left:5px" onclick="onclickSubmitPractice('+param+')">Submit</button>'+
						'<button class="btn oemath-btn pull-right" style="margin-left:5px" onclick="onclickSkipPractice('+param+')">Skip</button>'+
						'<button class="btn oemath-btn pull-right" onclick="onclickFinishPractice('+practice.grade+','+practice.cid+')">Finish</button>'+
					'</div>'+
				'</div>';

	return prob_html;
}


function parse_param_map(parameter) {
    var val_map = {};
    
    if (parameter != null) {
	    var params = parameter.trim().split('$$');
	    var pick_index = -1;
	    var i = 111;
	    
	    for (var i=0; i<params.length; i++) {
	        var eql = params[i].indexOf('=');
	        if (eql < 0) continue;
	
	        var val_name = params[i].substr(0, eql).trim();
	        var val_value = params[i].substr(eql+1).trim();
	
	        var index_val = eval_rand_param(val_value, pick_index);
	        pick_index= index_val.pick_index;
	        var param_val = index_val.param_evaled;
	
	        param_val = replace_parameter(param_val, val_map).replace(/[\r\n]/g, '');
	        try {
	        	param_val = eval_wrapper(param_val);
	        }
	        catch (e) {
	        }
	        val_map["<"+val_name+">"] = param_val;
	    }
    }

    if (!val_map["<ans>"]) {
    	val_map["<ans>"] = '0';
    }
    
    return val_map;
}


function eval_rand_param(param, pick_index) {
	while (true) {
	    var start = param.indexOf('{{');
	    if (start < 0) break;
	    
	    var end = param.indexOf('}}', start+2);
	    var rand_result = generate_val(param.substr(start+2, end-start-2), pick_index);
	    pick_index = rand_result[0];
	    param = param.substr(0, start) + rand_result[1] + param.substr(end+2);
	}
	
	return {pick_index: pick_index, param_evaled: param};
}


/*	    function replaceParameter(value) {
for (var k in paramMap) {
    value = value.replace(new RegEx(key, 'g'), paramMap[key]);
}
return value;
}*/
function replace_parameter(param, val_map) {
	$.each(val_map, function(k, v) {
	    param = param.replace(new RegExp(k, "g"), v);
	});
	return param;
}


function generate_val(param, pick_index) {
	if (param.indexOf('-') > 0) {
	    // range
	    var range = param.trim().split('-');
	    var first = range[0] >> 0;
	    var last = range[1] >> 0;
	    var len = last - first + 1;
	    return [pick_index, first + rand(len) >> 0];
	}
	else {
	    // enum
	    var params = param.trim().split(',');
	    if (pick_index == -1) {
	        pick_index = rand(params.length) >> 0;
	    }
	    return [pick_index, params[pick_index]];
	} 
}


function rand(n) {
    return ((Math.random() * 100000000) % n) >> 0;
}


// use wrapper to avoid being modified by eval()
function eval_wrapper(exp) {
	return eval(exp);
}


function replace_oemath_tags(prob, prob_index) {
    prob = prob.replace(/<oemath-script>/g, '<script type="text/javascript">');
    prob = prob.replace(/<\/oemath-script>/g, '<\/script>');
    
    ///////////////////////
    // oemath-svg tags
    ///////////////////////
    var my_circles = [];
    var circle_inputs = '';
    var svg_width = 0;
    var svg_height = 0;
    var translateX = SVG_MARGIN;
    var translateY = SVG_MARGIN;
    
    // '<oemath-svg-500-500>'
    prob = prob.replace(/<\s*oemath-svg\(([^\)]+)\)\s*>/g, function (m, $1) {
        var prop = parse_prop_str($1, function(k,v) {
            if (k == 'width' || k == 'w') {
                svg_width = eval_wrapper(v);
            }
            else if (k == 'height' || k == 'h') {
                svg_height = eval_wrapper(v);
            }
            else if (k == 'tx' || k == 'translateX' ) {
                translateX = eval_wrapper(v);
            }
            else if (k == 'ty' || k == 'translateY' ) {
                translateY = eval_wrapper(v);
            }
            return false;
        });

        return '<svg width=' +(svg_width + 2*translateX)+ ' height='+ (svg_height + 2*translateY) + ' class="oemath-svg-svg">' +
                '<g transform="translate('+translateX+','+translateY+')">';
    });

    // 'def_circle C#=(200,200,100)' +: define a circle named C#, cx=200, cy=200, radius=100
    prob = prob.replace(/def_circle\s+([^=\s]+)\s*=\s*\(\s*([^,\s\)]+)\s*,\s*([^,\s\)]+)\s*,\s*([^,\s\)]+)\s*\)/g, function(m, $1, $2, $3, $4) {
        my_circles[$1] = { x:eval_wrapper($2), y:eval_wrapper($3), r:eval_wrapper($4) };
        return "";
    });

    // <svg-polygon[(nofill)] (x,y)|C#0(theta)[ (x,y)|C#0(theta)]+/>
    prob = prob.replace(/<\s*svg-polygon\(?([^\)\s]+)?\)?\s+([^>]+)>/g, function(m, $1, $2) {
        var pts = $2.trim().split(' ');
        var ret = '<polygon points="';
        for (var i=0; i < pts.length; i++) {
            var xy = parse_position(my_circles, pts[i].trim());
            ret += (xy.x + ',' + xy.y + ' ');
        }

        ret += '" class="oemath-svg" ' + parse_prop_str($1) + '/>';

        return ret;
    });


    // <svg-line(props) (x,y)|C#0(theta) (x,y)|C#0(theta)/>
    prob = prob.replace(/<\s*svg-line\(?([^\)\s]+)?\)?\s+(\S+)\s+([^>]+)>/g, function(m, $1, $2, $3) {
        var p1 = parse_position(my_circles, $2);
        var p2 = parse_position(my_circles, $3.trim());
        var ret = '<line x1='+p1.x+' y1='+p1.y+ ' x2='+p2.x+' y2='+p2.y+' class="oemath-svg"' + parse_prop_str($1) +'/>';
        return ret;
    });

    // <svg-rect(props) (x,y)|C#0(theta) (x,y)|C#0(theta)/>
    prob = prob.replace(/<\s*svg-rect\(?([^\)\s]+)?\)?\s+(\S+)\s+([^>]+)>/g, function(m, $1, $2, $3) {
        var p1 = parse_position(my_circles, $2);
        var p2 = parse_position(my_circles, $3.trim());
        var ret = '<rect x='+p1.x+' y='+p1.y+ ' width='+(p2.x-p1.x)+' height='+(p2.y-p1.y)+' class="oemath-svg" ' + parse_prop_str($1) +'/>';
        return ret;
    });

    // <svg-circle[(props)] (x,y,r)>
    prob = prob.replace(/<\s*svg-circle\(?([^\)\s]+)?\)?\s+\(([^,]+),([^,]+),([^,]+)\)>/g, function (m, $1, $2, $3, $4) {
        
        var prop = parse_prop_str($1, function(k, v) {
            if (k == 'hint') {
                circle_inputs += '<svg-input(hint='+v+') '+$2+'>';
                return false;
            }
            return true; // continue processing
        });
        
        return '<circle cx='+$2+' cy='+$3+' r='+$4 + prop+'/>';
    });

    // <svg-circle[(props)] C#(theta) r=<radius>> or
    // <svg-circle[(props)] C#>
    prob = prob.replace(/<\s*svg-circle\(?([^\)\s]+)?\)?\s+([^\s>]+)([^>]*)>/g, function (m, $1, $2, $3) {
        
        var prop = parse_prop_str($1, function(k, v) {
            if (k == 'hint') {
                circle_inputs += '<svg-input(hint='+v+') '+$2+'>';
                return false;
            }
            return true; // continue processing
        });
        
        if ($2.indexOf('(') >= 0) { // C#0(theta) r=<radius>
            var xy = parse_position(my_circles, $2);
            var radius = get_prop($3, 'r', DEFAULT_INPUT_RADIUS);
            return '<circle cx='+xy.x+' cy='+xy.y+' r='+radius + prop+'/>';
        }
        else { // C#: to show this circle
            var cr = my_circles[$2.trim()];
            return '<circle cx='+cr.x+' cy='+cr.y+' r='+cr.r + prop+'/>';
        }
    });

    // inject circle inputs
    var has_foreign = false;
    prob = prob.replace(/(<\s*oemath-foreignObject\s*>)/g, function(m, $1) {
        has_foreign = true;
        return $1 + circle_inputs;
    });
    if (!has_foreign) {
        prob = prob.replace(/(<\s*\/\s*oemath-svg\s*>)/g, function(m, $1) {
            return '<oemath-foreignObject>' + circle_inputs + '</oemath-foreignObject>' + $1;
        });
    }
    
    // oemath-image-input tags
    var input_numbers = -1;

    // <inline-input(props) [width=<width>]/>
    prob = prob.replace(/\<inline-input\(([^\)]+)\)([^>]*)>/g, function (m, $1, $2) {
        ++input_numbers;

        var width = get_prop($2, 'width', DEFAULT_INLINE_INPUT_WIDTH);

        return '<input type="text" id="oemath-input-field-' +prob_index+ '-' +input_numbers+ '" class="oemath-inline-input" style="width:' + width + 'px" placeholder="?"' + parse_prop_str($1) + '>';
    });


    // <svg-input(props) [(x,y)|C#0(theta)] [width=<width>]/>
    // <svg-input(0) (10,10) width=100/>
    // <svg-input(0) (10,10)/>
    // <svg-input(0) C#0(10) width=100/>
    prob = prob.replace(/<\s*svg-input\(([^\)]+)\)\s+([^\s>]+)([^>]*)>/g, function (m, $1, $2, $3) {
        ++input_numbers;

        var width = get_prop($3, 'width', DEFAULT_INPUT_RADIUS * 2);
        var xyp = parse_position(my_circles, $2);
        if (xyp.p) { // It's a polar coordination, find the left top corner
            xyp.x -= width/2;
            xyp.y -= DEFAULT_INPUT_RADIUS;
        }
        return '<input type="text" id="oemath-input-field-' +prob_index+ '-' +input_numbers+ '"' +
        parse_prop_str($1) +
               ' style="left:' +xyp.x+ 'px; top:' +xyp.y + 'px; width:' +width+ 'px"' +
               ' class="oemath-svg-input" placeholder="?"/>';
    });

    // see <svg-input>
    prob = prob.replace(/<\s*svg-text\(([^\)]+)\)\s+([^\s>]+)([^>]*)>/g, function (m, $1, $2, $3) {
        var width = get_prop($3, 'width', DEFAULT_INPUT_RADIUS * 2);
        var xyp = parse_position(my_circles, $2);
        if (xyp.p) { // It's a polar coordination, find the left top corner
            xyp.x -= width/2;
            xyp.y -= DEFAULT_INPUT_RADIUS;
        }
        var prop = parse_prop($1); 
        return '<div style="position:absolute;left:'+(xyp.x-width/2)+'px;top:'+(xyp.y-DEFAULT_INPUT_RADIUS)+'px"><input type="text" readonly value="' +
               prop["value"] +
               '" style="left:0;top:0;width:' +width+ 'px;height:' +(DEFAULT_INPUT_RADIUS*2) + 'px"' +
               '/></div>';
    });

    prob = prob.replace(/<\s*oemath-foreignObject\s*>/g, '<foreignObject x=0 y=0 width='+svg_width+' height='+svg_height+'>');
    prob = prob.replace(/<\s*\/\s*oemath-foreignObject\s*>/g, '<\/foreignObject>');
    prob = prob.replace(/<\s*\/\s*oemath-svg\s*>/g, '</g><\/svg>');
    
    
    var desc_inputs = replace_vertical(prob, prob_index, input_numbers);
    
    return { desc: desc_inputs.desc, inputs: desc_inputs.inputs+1 };
}


/*function shuffle(arr) {
arr.sort(function() {
  return .5 - Math.random();
});
}*/
function shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex ;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
}

//attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array)
      return false;

  // compare lengths - can save a lot of time 
  if (this.length != array.length)
      return false;

  for (var i = 0, l=this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
          // recurse into the nested arrays
          if (!this[i].equals(array[i]))
              return false;       
      }           
      else if (this[i] != array[i]) { 
          // Warning - two different object instances will never be equal: {x:20} != {x:20}
          return false;   
      }           
  }       
  return true;
}


Array.prototype.same = function (array) {
  if (!array) return false;
  return this.sort().equals(array.sort());
}


//polar coordination to cart coordination
function p2c(centerX, centerY, radius, angleInDegrees) {
  centerX=eval_wrapper(centerX); centerY=eval_wrapper(centerY); radius=eval_wrapper(radius); angleInDegrees=eval_wrapper(angleInDegrees);
var angleInRadians = (360-angleInDegrees) * Math.PI / 180.0;

return {
  x: centerX + (radius * Math.cos(angleInRadians)),
  y: centerY + (radius * Math.sin(angleInRadians))
};
}


function parse_position(my_circles, str) {
  var start = str.indexOf('(');
  var end = str.indexOf(')');
  if (start == 0) {
      var xy = str.substring(start+1, end).split(',');
      if (xy.length == 2) {
          return { x: eval_wrapper(xy[0]), y: eval_wrapper(xy[1]), p: false };
      }
      else { // (cx,cy,radius,theta)
          var c = p2c(xy[0], xy[1], xy[2], xy[3]);
          return { x: c.x, y : c.y, p : true };
      }
  }
  else if (start > 0) {
      var cr = my_circles[str.substr(0, start)];
      var c = p2c(cr.x, cr.y, cr.r, str.substring(start+1, end));
      return { x: c.x, y : c.y, p : true };
  }
  else {
      var cr = my_circles[str];
      return { x: cr.x, y: cr.y, p: true };
  }
}


function parse_prop(str, filter, ch) {
  ch = typeof ch !== 'undefined' ? ch : '=';
  var prop = {};
  prop['fill'] = 'white';
  prop['stroke'] = 'black';
  prop['stroke-width'] = '1';
  if (str) {
      var p = str.split(',');
      for (var i=0; i<p.length; i++) {
          var kv = p[i].split('=');
          if (kv.length <= 1) {
              kv = p[i].split(':');
          }
          
          if (kv.length <= 1) { // default key is "value"
        	  prop["value"] = kv[0];
          }
          else if (!filter || filter(kv[0], kv[1])) {
              prop[kv[0]] = kv[1];                
          }
      }
  }
  
  return prop;
}

function parse_prop_str(str, filter, ch) {
  ch = typeof ch !== 'undefined' ? ch : '=';
  var prop = parse_prop(str, filter, ch);
  var prop_str = ' ';
  $.each(prop, function(k, v) {
      prop_str += k + ch+ '"' + v +'" ';
  });
  
  return prop_str;
}

function get_prop(str, key, def_value) {
  var val = def_value;
  if (str) {
      str = str.trim();
      var vals = str.split('=');
      if (vals.length==2 && vals[0].trim() == key) {
          try { val = eval_wrapper(vals[1]); } catch(e) { }
      }
  }
  return val;
}


function vertical(fml, hints, prob_index, input_numbers) {
  var hint_index = 0;

  var gx = SVG_VERTICAL_CHAR_WIDTH;
  var gy = SVG_VERTICAL_CHAR_HEIGHT;
  var lh = 10;
  var height = 0;
  var width = 0;
  for (var i=0; i<fml.length; i++) {
      var s = fml[i];
      height += ((s[0] == '_' || s[0] == '|') ? lh : gy);
      var w = s.length;
      width = Math.max(width, s.length);    
  }
  width *= gx;
  
  var y=0;
  var svg = '<svg width='+(4+width)+' height='+(4+height)+' class="oemath-svg-vertical"><g transform="translate(2,2)">';
  var vertical_inputs = '<foreignObject x=0 y=0 width='+width+' height='+height+'>';
  for (var i=0; i<fml.length; i++) {
      var s = fml[i];
      var w = s.length;
      if (s[0] == '_') {
          y += 2;
          var x1 = width - w*gx - gx/4;
          svg += '<line x1='+x1+' y1='+y+' x2='+width+' y2='+y+' />';
          y += (lh-2);
      }
      else if (s[0] == '|') {
          y += 2;
          var x1 = width - (w-1)*gx - gx/4;
          svg += '<line x1='+x1+' y1='+y+' x2='+width+' y2='+y+' />';
          svg += '<path d="M '+x1+','+y+' a '+gx/2+' '+(gy*5/4)+' 0 0 1 '+(-gx/2)+','+(gy*6/5)+'" />';
          y += (lh-2);
      }
      else {
          var x = width - gx*w + gx/2;
          for (var j=0; j<w; j++) {
              var c = s.charAt(j);
              if ((0 <= c && c <= 9) || c=='+' || c=='-' || c=='x') {
              	vertical_inputs += '<input readonly value="'+c+'" type="text" style="left:'+(x-gx/2)+'px;top:'+(y-2)+'px"/>';//'<text x='+x+' y='+y+'>'+c+'</text>';
              }
              else {
                  ++input_numbers;
                  vertical_inputs += '<input type="text" id="oemath-input-field-' +prob_index+ '-' +input_numbers+'" style="left:'+(x-gx/2)+'px;top:'+(y-2)+'px" hint="'+hints[hint_index++]+'" placeholder="'+c+'"/>';
              }
              x += gx;
          }
          y += gy;
      }
  }
  vertical_inputs += '</foreignObject>';
  svg += vertical_inputs+'</g></svg>';

  return { desc: svg, inputs: input_numbers };
}

function replace_vertical(prob, prob_index, input_numbers) {
  var inputs = input_numbers;
  prob = prob.replace(/\s*<\s*oemath-vertical\s+\(([^\)]+)\)\s+\(([^\)]+)\)\s*>/g, function(m, $1, $2) {
      var desc_inputs = vertical(eval_wrapper($1), eval_wrapper($2), prob_index, input_numbers);
      inputs = desc_inputs.inputs;
      return desc_inputs.desc;
  });
  return { desc: prob, inputs: inputs };
}



/////////////////////////////////////////////////////////
////// processing user input answer
/////////////////////////////////////////////////////////

// user click choice group 
var choice_selected = -1;
function handleClickChoiceGroup(radioButton) {
    choice_selected = radioButton.value;
}


function check_answer()
{
	// dont check answer when showing answer
	var btn_show_answer = $('#oemathid-answer-show');
	if (btn_show_answer && btn_show_answer.attr("flag") == "hide") {
		return;
	}
	
    var prob = prob_parsed[prob_index];

    if (prob.type == PROB_TYPE_NORMAL) {
        var answer_entered = $("#oemathid-answer-input").val().trim();
        prob.entered = answer_entered;
        if (answer_entered.length == 0) {
        	prob.check = ANSWER_INCOMPLETE;
        }
        else {
        	try {
        		prob.check = eval_wrapper('('+answer_entered +')==('+ prob.ans+')') ? ANSWER_CORRECT : ANSWER_WRONG;
        	}
        	catch (e) {
        		prob.check = ANSWER_WRONG;
        	}
        }
    }
    else if (prob.type == PROB_TYPE_CHOICE) {
        if (choice_selected == -1) {
        	prob.check = ANSWER_INCOMPLETE;
        }
        else {
        	prob.entered = choice_selected;
        	prob.check = ($('#oemathid-choice-'+prob_index+'-'+choice_selected).attr("expected") == 1) ? ANSWER_CORRECT : ANSWER_WRONG;
        }
    }
    else if (prob.type == PROB_TYPE_MULTIPLE_ANSWER) {
        var answer_descript = '';
        prob.entered = [];
        var need_more_input = false;
        for (var i = 0; i < prob.inputs; i++) {
            var input_number = $("#oemath-input-field-" +prob_index+ '-' +i).val().trim();
            prob.entered.push(input_number);
            if (input_number.length == 0) {
            	need_more_input = true;
            }
            answer_descript += 'var i' + (i+1) + '=' + input_number + "; ";
        }
        
        if (need_more_input) {
        	prob.check = ANSWER_INCOMPLETE;
        }
        else {
	        answer_descript += prob.ans;
	
	        try {
	        	prob.check = eval_wrapper(answer_descript) ? ANSWER_CORRECT : ANSWER_WRONG;
	        }
	        catch (e) {
	        	prob.check = ANSWER_WRONG;
	        }
        }
    }
    else if (prob.type == PROB_TYPE_SINGLE_ANSWER) {
    	prob.entered = [];
    	prob.check = ANSWER_CORRECT;
        var expected_answer = eval_wrapper(prob.ans); // prob.ans e.g [4,5,9,4,1,0]
        for (var i = 0; i < prob.inputs; i++) {
            var input_number = $("#oemath-input-field-" +prob_index+ '-' +i).val().trim();
            prob.entered.push(input_number);
            if (input_number.length == 0) {
            	prob.check = ANSWER_INCOMPLETE;
            }
            else if (input_number != expected_answer[i]) { // input_number length is either 0 or 1
            	prob.check = ANSWER_WRONG;
            }
        }
    }

    return prob.check;
}

