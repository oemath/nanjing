<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title>Sign Up</title>
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
			<h2 class="oemath-color">Welcome to oemath!</h2>
			<hr>
			<div id="oemath-register-form-alerts"></div>
			<form>
			    <div class="form-group">
			        <label for="inputUsername" class="oemath-login-label">Username</label><span class="oemath-register-warning"></span>
			        <input type="text" class="form-control" id="inputUsername" name="username">
			    </div>

			    <div class="form-group">
			        <label for="inputEmail" class="oemath-login-label">Email</label><span class="oemath-register-warning"></span>
			        <input type="text" class="form-control" id="inputEmail" name="email">
			    </div>

			    <div class="form-group">
			        <label for="inputPassword" class="oemath-login-label">Password</label><span class="oemath-register-warning"></span>
			        <input type="password" class="form-control" id="inputPassword" name="password">
			    </div>

			    <div class="form-group">
			        <label for="inputConfirmPassword" class="oemath-login-label">Confirm password</label><span class="oemath-register-warning"></span>
			        <input type="password" class="form-control" id="inputConfirmPassword">
			    </div>

			    <button type="button" class="btn oemath-btn" onclick="onClickRegister()">Register</button><br>
			    <div style="clear:both"></div>
			</form>
		</div>

		<jsp:include page="/includes/footer.jsp"/>
	</div>


	<script>
	function onClickRegister() {
		var success = true;
		$('span.oemath-register-warning').text('');
		$('#oemath-register-form-alerts').empty();

		var username = $('#inputUsername').val();
		if (!validateUsername(username)) {
			$('label[for=inputUsername] + span.oemath-register-warning').text("Username can only contain alphabet, digit or _, of minimum length 4.");
			success = false;
		}

		var email = $('#inputEmail').val();
		if (!validateEmail(email)) {
			$('label[for=inputEmail] + span.oemath-register-warning').text("Email address format is invalid.");
			success = false;
		}

		var password = $('#inputPassword').val();
		if (!validatePassword(password)) {
			$('label[for=inputPassword] + span.oemath-register-warning').text("Password length must be between 6 and 32.");
			success = false;
		}

		else if (password != $('#inputConfirmPassword').val()) {
			$('label[for=inputConfirmPassword] + span.oemath-register-warning').text("Passwords do not match.");
			success = false;
		}

		if (success) {
			var result;
		    $.ajax({
		        type: "post",
		        url: "https://www.oemath.com/api/user/register",
		        async: false,
		        data: { username: username, email: email, password: password },
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
				$('#oemath-register-form-alerts').append('<div class="alert alert-danger" role="alert">'+result.error+'</div>');
			}
		}
	}
	</script>

	<script type="text/javascript" src="/js/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.min.js"></script>

	<script type="text/javascript" src="./user.js"></script>
</body>
</html>