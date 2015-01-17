<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Sign In</title>

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
			<h2 class="oemath-color">Welcome back!</h2>
			<hr>
			<div id="oemath-login-form-alerts"></div>
			<form>
			    <div class="form-group">
			        <label for="inputUsername" class="oemath-login-label">Username or email</label><span class="oemath-login-warning"></span>
			        <input type="text" class="form-control" id="inputUsername" name="username">
			    </div>
			    <div class="form-group">
			        <label for="inputPassword" class="oemath-login-label">Password</label><span class="oemath-login-warning"></span>
			        <input type="password" class="form-control" id="inputPassword" name="password">
			    </div>
			    <div class="checkbox">
			        <label><input type="checkbox" name="rememberme" id="inputRememberme">Remember me</label>
			    </div>
		        <div class="clear:both"></div>
			    <button type="button" class="btn oemath-btn" onclick="onClickLogin()">Login</button>
				<div style="clear:both"></div>
			    <a href="/user/forgot.jsp">Forgot your password?</a>
			    <div style="clear:both"></div>
			</form>
		</div>

		<jsp:include page="/includes/footer.jsp"/>
	</div>

	<script>
		function onClickLogin() {
			var success = true;
			$('span.oemath-login-warning').text('');
			$('#oemath-login-form-alerts').empty();

			var username = $('#inputUsername').val();
			if (!validateUsername(username) && !validateEmail(username)) {
				$('label[for=inputUsername] + span.oemath-login-warning').text("Invalid username or email.");
				success = false;
			}

			var password = $('#inputPassword').val();
			if (!validatePassword(password)) {
				$('label[for=inputPassword] + span.oemath-login-warning').text("Password length must be between 6 and 32.");
				success = false;
			}

			if (success) {
				var result;
			    $.ajax({
			        type: "post",
			        url: "https://www.oemath.com/api/user/login",
			        async: false,
			        data: { username: username, password: password, rememberme: $('#inputRememberme').prop('checked') },
			        dataType: "json",
			        success: function (data, textStatus, jqXHR) {
			        	result = data;
			        },
			        error: function (jqXHR, textStatus, errorThrown) {
			        	result = makeStruct('result error');
			        	result.result = 'failure';
			        	result.error = 'Something wrong happened, please try later.';
			        },
			    });

			    if (result.result == 'success') {
					window.location.replace("http://www.oemath.com/index.jsp");
				}
				else {
					$('#oemath-login-form-alerts').append('<div class="alert alert-danger" role="alert">'+result.error+'</div>');
				}
			}
		}
	</script>

	<script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>
	
	<script type="text/javascript" src="./user.js"></script>
</body>
</html>