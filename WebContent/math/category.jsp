<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Grade 3 - oemath</title>
<link href="./category.css" rel="stylesheet" type="text/css" />

<link href="/css1/oemath.css" rel="stylesheet" type="text/css" />
<link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
	<div id="oemathid-centerized-body">
		<jsp:include page="/includes/header.jsp"/>
		<jsp:include page="/includes/menu.jsp"/>

		<div id="oemathid-carousel">
		</div>

	    <div id="oemathid-grade-details-container" class="container oemath-fullwidth oemath-children-left">
	    	<h1 class="oemath-color">Third Grade Skills</h1>
	        <table id="oemath-category-table" class="table table-hover oemath-fullwidth">
	            <tbody class=" ">
	                <!-- tr>
	                    <td>
	                        <h2>Quick Calculation</h2>
	                        <p>This is how to do quick calculation</p>
	                        <button class="btn pull-right oemath-btn">Practice</button>
	                        <button class="btn pull-left oemath-btn">Knowledge</button>
	                    </td>
	                </tr-->
	            </tbody>
	        </table>
	    </div>

		<jsp:include page="/includes/footer.jsp"/>
	</div>

	<script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
	
	<script type="text/javascript" src="./category.js"></script>

	<script>
	$(function() {
		var grade = <%=request.getParameter("grade") %>;
		if (grade != null) {
			get_category(grade);
		}
		else {
			window.location.href = "/index.jsp";
		}
	});
	</script>
	
</body>
</html>