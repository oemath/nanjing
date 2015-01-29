<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Grade 3 - Practice - oemath</title>

<link href="/css1/oemath.css" rel="stylesheet" type="text/css" />
<link href="./practice.css" rel="stylesheet" type="text/css" />

<link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
	<div id="oemathid-centerized-body">
		<jsp:include page="/includes/header.jsp"/>
		<jsp:include page="/includes/menu.jsp"/>

		<div id="oemathid-practice-header" class="container oemath-children-left">
			<h1 class="oemath-color"></h1>
			<div class="text-center oemath-fullwidth">
				<div id="oemathid-review-btns" class="btn-group" role="group" aria-label="...">
					<!-- group btns will be append in $() -->
				</div>
			</div>
			
		</div>
		
	    <div id="oemathid-practice-container" class="container oemath-fullwidth oemath-children-left">
	    </div>

		<jsp:include page="/includes/footer.jsp"/>
	</div>

	<script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="./practice.js"></script>

	<script>

		$(function() {
			var grade = <%=request.getParameter("grade") %>;
			var cid = <%=request.getParameter("cid") %>;
//			btn_group_curr = -1;

			$('#oemathid-practice-header > h1').text('Practice - Grade '+grade);
			
			if (grade != null && cid != null) {
				show_first_prob(grade, cid);
			}
		});

	</script>

	<div class="modal" id="oemath-practice-modal" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	  <div class="modal-dialog">
	    <div class="modal-content">
	      <div class="modal-body">
	        <h1 id="owmthid-modal-practice-answer"></h1>
	      </div>
	      <!-- div class="modal-footer">
	        <button type="button" id="oemath-review-btn-review" class="btn btn-default" data-dismiss="modal" onclick="clickRethinkOnWrong(this)">Rethink</button>
	        <button type="button" class="btn"  data-dismiss="modal" onclick="clickSkipOnWrong(this)">Skip</button>
	      </div-->
	    </div>
	  </div>
	</div>
	
</body>
</html>