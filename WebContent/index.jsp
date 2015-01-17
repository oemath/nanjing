<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>oemath - Sharpen Your Brain!</title>

<link href="/css1/oemath.css" rel="stylesheet" type="text/css" />
<link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
	<div id="oemathid-centerized-body">
		<jsp:include page="/includes/header.jsp"/>

		<jsp:include page="/includes/menu.jsp"/>

		<div id="oemathid-carousel"></div>

		<div id="oemathid-body">
			<div id="oemathid-body-container" class="container">
		        <div class="row">

		            <div class="col-lg-4 col-md-4 col-sm-6">
		                <div class="well oemath-padding-bottom">
		                    <h1>Grade 1</h1>
		                    <p>Quick calculation</p>
		                    <p>Distance</p>
		                    <form action="/math/category.jsp">
		                    	<input type="hidden" name="grade" value="1"></input>
		                    	<button class="btn oemath-btn oemath-grade-details">See Details</button>
		                    </form>
		                </div>
		            </div>

		            <div class="col-lg-4 col-md-4 col-sm-6">
		                <div class="well oemath-padding-bottom">
		                    <h1>Grade 2</h1>
		                    <p>Quick calculation</p>
		                    <p>Distance</p>
		                    <form action="/math/category.jsp">
		                    	<input type="hidden" name="grade" value="2"></input>
		                    	<button class="btn oemath-btn oemath-grade-details">See Details</button>
		                    </form>
		                </div>
		            </div>

		            <div class="col-lg-4 col-md-4 col-sm-6">
		                <div class="well oemath-padding-bottom">
		                    <h1>Grade 3</h1>
		                    <p>Quick calculation</p>
		                    <p>Distance</p>
		                    <form action="/math/category.jsp">
		                    	<input type="hidden" name="grade" value="3"></input>
		                    	<button class="btn oemath-btn oemath-grade-details">See Details</button>
		                    </form>
		                </div>
		            </div>

		            <div class="col-lg-4 col-md-4 col-sm-6">
		                <div class="well oemath-padding-bottom">
		                    <h1>Grade 4</h1>
		                    <p>Quick calculation</p>
		                    <p>Distance</p>
		                    <form action="/math/category.jsp">
		                    	<input type="hidden" name="grade" value="4"></input>
		                    	<button class="btn oemath-btn oemath-grade-details">See Details</button>
		                    </form>
		                </div>
		            </div>

		        </div>
			</div>
		</div>

		<jsp:include page="/includes/footer.jsp"/>
	</div>

	<script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
</body>
</html>