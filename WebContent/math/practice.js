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


function gcd(x, y) {
    while (y != 0) {
        var z = x % y;
        x = y;
        y = z;
    }
    return x;
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

/*********************/

function show_first_prob(g, c) {
	grade = g;
	cid = c;
	prob_parsed = [];
	prob_index = 0;
	
	ajax_get_practice_prob(grade, cid, 0, show_practice, finish_practice);
}


function ajax_get_practice_prob(grade, cid, index, handler, finish) {
    $.ajax({
        type: "post",
        url: "/api/practice",
        data: { grade : grade, cid : cid, index: index },
        dataType: "json",
        success: function (practice, textStatus, jqXHR) {
	        if (practice.result == 'success') {
	        	count = practice.count;
		    	if (practice.prob != null) {
			    	practice.grade = grade;
			    	practice.cid = cid;
			    	practice.index = index;
			    	handler(practice);
		    	}
		    	else {
			    	// no more problem in this practice
		    		finish_practice(grade, cid, index);
			    }
		    }
	        else {
		    }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
    });
}


function next_or_finish_practice() {
	if (prob_index == count-1) {
		finish_practice(grade, cid, index);
	}
	else {
		ajax_get_practice_prob(grade, cid, prob_index+1, show_practice, finish_practice);
	}
}

function clickRethinkOnWrong() {
}
function clickSkipOnWrong() {
	next_or_finish_practice();
}


function onclickSubmitPractice(grade, cid) {
	var answer = check_answer();
	if (answer == ANSWER_WRONG) { 
		$("#oemath-check-answer-modal").modal({ backdrop: 'static', keyboard: false });
	}
	else if (answer == ANSWER_INCOMPLETE) {
	}
	else {
		next_or_finish_practice();
	}
}

function onclickSkipPractice(grade, cid, index) {
	// TODO: check answer first
	if (index == count-1) {
		finish_practice(grade, cid, index);
	}
	else {
		ajax_get_practice_prob(grade, cid, index+1, show_practice, finish_practice);
	}
}

function finish_practice(grade, cid, index) {
	// TODO: proceed to review
}


function show_practice(practice) {
	practice.prob = process_prob(practice.prob, practice.index);
	show_prob('#oemathid-practice-container', practice);
}


function process_prob(raw_prob, prob_index) {
	var prob = makeStruct("type desc inputs ans choices hint");

	var param_map = parse_param_map(raw_prob.param);

	prob.type = raw_prob.type;
	
    prob.desc = replace_parameter(raw_prob.desc, param_map);
    var desc_inputs = replace_oemath_tags(prob.desc, prob_index);
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
	        if (ans[i] == 0) {
		        prob.ans = i;
		    }
		    prob.choices.push(ans[i]);
	    }
    }

    prob.hint = raw_prob.hint;

    return prob;
}


function show_prob(container_id, practice) {
	if (container_id.indexOf('#') == -1) {
		container_id = '#' + container_id;
	}
	var container = $(container_id);
	container.empty(); // clear all children
	
	choice_selected = -1;
	prob_index = practice.index;
	prob_parsed.push(practice.prob);
	
    $(".oemath-svg-vertical input").on("input", function () {});

    container.append(get_prob_html(practice));
    
    //if (prob.type == PROB_TYPE_MULTIPLE_ANSWER)
        {
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


function get_prob_html(practice) {
	var prob = practice.prob;
	var prob_html = '<hr/><h1 class="oemath-problem-text">Question</h1>'+
						'<div class="oemath-problem-area">'+
							'<h3 class="oemath-problem-desc">' + prob.desc + '</h3>';

	if (prob.type == PROB_TYPE_CHOICE) {
		prob_html += '<form class="oemath-choice-group">';
		for (var i = 0; i < prob.choices.length; i++) {
		    var id = 'oemathid-choice-' + i;
		    prob_html += '<input id="'+id+'" value="'+i+'" expected="' + (i==prob.ans?1:0) + '" name="oemath-choice-item" onclick="handleClick(this)" type="radio"><label for="'+id+'" class="oemath-choice-item">' + prob.choices[i] + '</label><br>';
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
						'<input id="oemathid-answer-input" type="text" class="form-control oemath-answer-input" placeholder="'+ prob.ans +'"></input>';
	}
	else {
		prob_html += '<div class="form-inline">';
	}
		
	prob_html += 		'<button class="btn oemath-btn" style="margin-left:5px" onclick="onclickSubmitPractice('+practice.grade+','+practice.cid+')">Submit</button>'+
						'<button class="btn oemath-btn pull-right" onclick="onclickSkipPractice('+practice.grade+','+practice.cid+','+practice.index+')">Skip</button>'+
					'</div>'+
				'</div>';

	/*						'<div class="text-center">'+
	'<div class="btn-group" role="group" aria-label="...">';
for (var i=1; i<=4; i++) {
prob_html += '<button type="button" class="btn btn-default btn-group-review" style="background-color:rgb(255,220,220)">'+i+'</button>';
}
prob_html += 		'</div>'+
'</div>'+*/
	
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
        var prop = parse_prop($1, function(k,v) {
            if (k == 'width' || k == 'w') {
                svg_width = eval(v);
            }
            else if (k == 'height' || k == 'h') {
                svg_height = eval(v);
            }
            else if (k == 'tx' || k == 'translateX' ) {
                translateX = eval(v);
            }
            else if (k == 'ty' || k == 'translateY' ) {
                translateY = eval(v);
            }
            return false;
        });

        return '<svg width=' +(svg_width + 2*translateX)+ ' height='+ (svg_height + 2*translateY) + ' class="oemath-svg-svg">' +
                '<g transform="translate('+translateX+','+translateY+')">';
    });

    // 'def_circle C#=(200,200,100)' +: define a circle named C#, cx=200, cy=200, radius=100
    prob = prob.replace(/def_circle\s+([^=\s]+)\s*=\s*\(\s*([^,\s\)]+)\s*,\s*([^,\s\)]+)\s*,\s*([^,\s\)]+)\s*\)/g, function(m, $1, $2, $3, $4) {
        my_circles[$1] = { x:eval($2), y:eval($3), r:eval($4) };
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

        ret += '" class="oemath-svg" ' + parse_prop($1) + '/>';

        return ret;
    });


    // <svg-line(props) (x,y)|C#0(theta) (x,y)|C#0(theta)/>
    prob = prob.replace(/<\s*svg-line\(?([^\)\s]+)?\)?\s+(\S+)\s+([^>]+)>/g, function(m, $1, $2, $3) {
        var p1 = parse_position(my_circles, $2);
        var p2 = parse_position(my_circles, $3.trim());
        var ret = '<line x1='+p1.x+' y1='+p1.y+ ' x2='+p2.x+' y2='+p2.y+' class="oemath-svg"' + parse_prop($1) +'/>';
        return ret;
    });

    // <svg-rect(props) (x,y)|C#0(theta) (x,y)|C#0(theta)/>
    prob = prob.replace(/<\s*svg-rect\(?([^\)\s]+)?\)?\s+(\S+)\s+([^>]+)>/g, function(m, $1, $2, $3) {
        var p1 = parse_position(my_circles, $2);
        var p2 = parse_position(my_circles, $3.trim());
        var ret = '<rect x='+p1.x+' y='+p1.y+ ' width='+(p2.x-p1.x)+' height='+(p2.y-p1.y)+' class="oemath-svg" ' + parse_prop($1) +'/>';
        return ret;
    });

    // <svg-circle[(props)] C#(theta) r=<radius>> or
    // <svg-circle[(props)] C#>
    prob = prob.replace(/<\s*svg-circle\(?([^\)\s]+)?\)?\s+([^\s>]+)([^>]*)>/g, function (m, $1, $2, $3) {
        
        var prop = parse_prop($1, function(k, v) {
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

        return '<input type="text" id="oemath-input-field-' +prob_index+ '-' +input_numbers+ '" class="oemath-inline-input" style="width:' + width + 'px" placeholder="?"' + parse_prop($1) + '>';
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
               parse_prop($1) +
               ' style="left:' +xyp.x+ 'px; top:' +xyp.y + 'px; width:' +width+ 'px"' +
               ' class="oemath-svg-input" placeholder="?"/>';
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
  centerX=eval(centerX); centerY=eval(centerY); radius=eval(radius); angleInDegrees=eval(angleInDegrees);
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
          return { x: eval(xy[0]), y: eval(xy[1]), p: false };
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
          
          if (!filter || filter(kv[0], kv[1])) {
              prop[kv[0]] = kv[1];                
          }
      }
  }

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
          try { val = eval(vals[1]); } catch(e) { }
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
//      $('#test2').text(eval($2)[1]);
      var desc_inputs = vertical(eval($1), eval($2), prob_index, input_numbers);
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
function handleClick(radioButton) {
    choice_selected = radioButton.value;
}


function check_answer() {
    var prob = prob_parsed[prob_index];

    if (prob.type == PROB_TYPE_NORMAL) {
        var answer_entered = $("#oemathid-answer-input").val().trim();
        prob.entered = answer_entered;
        if (answer_entered.length == 0) return ANSWER_INCOMPLETE;
        return eval('('+answer_entered +')==('+ prob.ans+')') ? ANSWER_CORRECT : ANSWER_WRONG;
    }
    else if (prob.type == PROB_TYPE_CHOICE) {
        if (choice_selected == -1) return ANSWER_INCOMPLETE;
        prob.entered = choice_selected;
        return choice_selected == $('#oemathid-choice-'+choice_selected).expected == 1 ? ANSWER_CORRECT : ANSWER_WRONG;
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
        	return ANSWER_INCOMPLETE;
        }
        answer_descript += prob.ans;

        try {
            return eval(answer_descript) ? ANSWER_CORRECT : ANSWER_WRONG;
        }
        catch (e) {
            return ANSWER_WRONG;
        }
    }
    else if (prob.type == PROB_TYPE_SINGLE_ANSWER) {
    	prob.entered = [];
        var answer = ANSWER_CORRECT;
        var expected_answer = eval(prob.ans); // prob.ans e.g [4,5,9,4,1,0]
        for (var i = 0; i < prob.inputs; i++) {
            var input_number = $("#oemath-input-field-" +prob_index+ '-' +i).val().trim();
            prob.entered.push(input_number);
            if (input_number.length == 0) {
                answer = ANSWER_INCOMPLETE;
            }
            else if (input_number != expected_answer[i]) { // input_number length is either 0 or 1
                answer = ANSWER_WRONG;
            }
        }
        
        return answer;
    }
}

