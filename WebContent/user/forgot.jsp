<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Forgot password</title>
<link href="./user.css" rel="stylesheet" type="text/css" />

<link href="/css1/oemath.css" rel="stylesheet" type="text/css" />
<link href="/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
	<div id="oemathid-centerized-body">
		<jsp:include page="/includes/header.jsp"/>

		<div id="oemathid-carousel">
		</div>

		<div id="oemathid-login-form">
			<h2 class="oemath-color">Forgot password</h2>
			<hr>
			<form action="https://www.oemath.com:8443/api/user/forgot" method="post" onsubmit="return validate()">
			    <div class="form-group">
			        <label for="inputUsername" class="oemath-login-label">Username or email</label>
			        <input type="text" class="form-control" id="inputUsername">
			    </div>
			    <button type="submit" class="btn oemath-btn">Email Link</button>
				<div style="clear:both"></div>
			</form>
		</div>

		<jsp:include page="/includes/footer.jsp"/>
	</div>

	<script>
		function validate() {
			return true;
		}
	</script>

	<script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>

	<script type="text/javascript" src="./user.js"></script>
</body>
</html>