<div id="oemathid-header">
	<a id="oemathid-logo" href="http://www.oemath.com/index.jsp"><img src="/images/logo.png" alt="www.oemath.com" border="0" /></a>
	<div id="oemathid-header-login-form">
		<%@ page import="com.oemath.resource.UserManagement" %>
		<%	String username = UserManagement.getCurrentUserName(request);
			if (username != null) { %>
		    <span class="oemath-header-welcome oemath-color">Welcome</span><span class="oemath-header-username oemath-color"><%=username %>&nbsp;!</span>
		    <a href="http://www.oemath.com/api/user/logout">Logout</a>
		<% 	} else { %>
		    <a href="https://www.oemath.com/user/login.jsp">Login</a>
		    <a href="https://www.oemath.com/user/register.jsp">Register</a>
	    <% } %>
	</div>
</div>
