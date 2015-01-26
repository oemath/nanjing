package com.oemath.resource;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.SQLException;
import java.util.UUID;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

@Path("/user")
public class UserManagement {

    final static int USER_GUEST = 0;
    final static int USER_REGISTERED = 1;
    final static int USER_PAID = 2;
    final static int USER_MAX = USER_PAID;
    
    
    final static String COOKIE_USERNAME = "username";
    final static String COOKIE_TOKEN = "token";
    final static String COOKIE_VALUE = "value";
    
    
    final static int REMEMBER_SQL_ERROR = -1;
    final static int REMEMBER_VALID = 0;
    final static int REMEMBER_EXPIRED = 1;
    final static int REMEMBER_INVALID = 2;
    
    
    final static int COOKIE_LIFESPAN = 365 * 86400; // 1 year
    final static int SESSION_LIFESPAN = 30 * 60; // 30 min
    

    @POST
    @Path("/register")
    @Produces(MediaType.TEXT_PLAIN)
    public Response registerUser(
            @Context HttpServletRequest request, 
            @FormParam("username") String userName, 
            @FormParam("email") String email,
            @FormParam("password") String password) {

        String retString = "";
        
        if (userName==null || userName.isEmpty()) {
            retString = "Username is empty";
        }
        else if (password==null || password.isEmpty()) {
            retString = "Password is empty";
        }
        else if (email==null || email.isEmpty()) {
            retString = "Email is empty";
        }
        else {
            Object result = createUser(userName, null, "", email, password);
            JSONObject obj = new JSONObject();
            try {
            	if (result instanceof User) {
            		obj.put("result", "success");
                    HttpSession session = request.getSession(true);
                    session.setMaxInactiveInterval(SESSION_LIFESPAN);
                    session.setAttribute(Session.SESSION_ATTRIBUTE_USER, (User)result);
            	}
            	else {
            		obj.put("result", "failure");
            		obj.put("error", (String)result);
            	}
                retString = obj.toString();
            }
            catch (JSONException je) {
                retString = je.toString();
            }
        }
        
        return Response.status(200)
        		.entity(retString)
                .build();
    }

    
    @POST
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/login")
    public Response loginUser(
            @Context HttpServletRequest request, 
            @FormParam("username") String userName, 
            @FormParam("password") String password,
            @FormParam("rememberme") boolean rememberme) {

        User user = null;
        boolean success = false;
        JSONObject obj = new JSONObject();
        try {
        	obj.put("result", "failure");
        }
        catch (JSONException jex) {
        }
        
        if (userName != null  && password != null) {
            user = Database.lookupByUsernameOrEmail(userName);

            if (user != null) {
                userName = user.userName;
                success = shaPassword(password, user.salt).equals(user.password);
            }
            
            try {
            	if (success) {
            		obj.put("result", "success");
            		obj.put("username", userName);
            	}
            }
            catch (JSONException jex) {
            }
        }

        if (success) {
            HttpSession session = request.getSession(true);
            session.setMaxInactiveInterval(SESSION_LIFESPAN);
            session.setAttribute(Session.SESSION_ATTRIBUTE_USER, user);

            if (rememberme) {
                String cookieToken = getSalt();
                String cookieValue = shaPassword(cookieToken, user.salt);
	            // remember_me cookie in client.
	            Response response = Response.status(200)
	                    .entity(obj.toString())
	                    .cookie(new NewCookie(COOKIE_USERNAME, userName, "/", null, null, COOKIE_LIFESPAN, false))
	                    .cookie(new NewCookie(COOKIE_TOKEN, cookieToken, "/", null, null, COOKIE_LIFESPAN, false))
	                    .cookie(new NewCookie(COOKIE_VALUE, cookieValue, "/", null, null, COOKIE_LIFESPAN, false))
	                    .build();
	
	            return response;
            }
        }

        try {
        	obj.put("error", "Invalid username/password.");
        }
        catch (JSONException jex) {
        }

        return Response.status(200)
                .entity(obj.toString())
                .build();
    }


    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Path("/logout")
    public Response logoutUser(
            @Context HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        URI uri = URI.create("http://www.oemath.com/index.jsp");
        Response response = Response
                .seeOther(uri)
                .cookie(new NewCookie(COOKIE_USERNAME, "", "/", null, null, 0, false))
                .cookie(new NewCookie(COOKIE_TOKEN, "", "/", null, null, 0, false))
                .cookie(new NewCookie(COOKIE_VALUE, "", "/", null, null, 0, false))
                .build();

        return response;
    }
    
    
    public static int getCurrentUserLevel(HttpServletRequest request) {
    	User user = getCurrentUser(request);
    	if (user != null) {
    		return user.isPaymentValid() ? USER_PAID : USER_REGISTERED;
    	}
    	else {
    		return USER_GUEST;
    	}
    }


    public static String getCurrentUserName(HttpServletRequest request) {
    	User user = getCurrentUser(request);
    	return user != null ? user.userName : null;
    }

    
    public static User getCurrentUser(HttpServletRequest request) {
    	HttpSession session = request.getSession();
    	
        User user = null;
        if (session != null) {
        	user = (User)session.getAttribute(Session.SESSION_ATTRIBUTE_USER);
        }

        if (user == null && request != null) {
        	Cookie[] cookies = request.getCookies();
        	if (cookies != null) {
	        	String username = null;
	        	String token = null;
	        	String value = null;
	        	int count = 3;
	        	for (Cookie cookie : cookies) {
	        		if (cookie.getName().equals(COOKIE_USERNAME)) {
	        			username = cookie.getValue();
	        			if (--count == 0) break;
	        		}
	        		else if (cookie.getName().equals(COOKIE_TOKEN)) {
	        			token = cookie.getValue();
	        			if (--count == 0) break;
	        		} 
	        		else if (cookie.getName().equals(COOKIE_VALUE)) {
	        			value = cookie.getValue();
	        			if (--count == 0) break;
	        		} 
	        	}
	
	        	if (count == 0) {
	        		user = Database.lookupByUsernameOrEmail(username);
	        		String expectedValue = shaPassword(token, user.salt);
	        		if (expectedValue.equals(value)) { // valid cookie.  Save them in session.
	        			if (session == null) {
	        				session = request.getSession(true);
	        			}
	    				session.setAttribute(Session.SESSION_ATTRIBUTE_USER, user);
	        		}
	        		else { // invalid cookie
	        			user = null;
	        		}
	        	}
        	}
        }
        
        return user;
    }
    

 ////////////////////////////////// old below //////////////////////////////////    
    
    
    @GET
    @Path("/status")
    @Produces(MediaType.TEXT_PLAIN)
    public String getStatus(@Context HttpServletRequest request) {
        User user = lookupUser(request);
        
        if (user != null) {
            request.getSession(true).setAttribute(Session.SESSION_ATTRIBUTE_USER, user);
            return user.userName;
        }
        else {
            return "";
        }
    }

    
    // return null if session expired and userName/token combination in cookie, if existing,
    // cannot be found in table user.
    // This prevents a user logging on multiple browsers/machines.
    // But cannot prevent session being hijacked.
    public static User lookupUser(HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        session.setMaxInactiveInterval(500); // session time out in 1 hour
        
        User user = (User)session.getAttribute(Session.SESSION_ATTRIBUTE_USER);
        if (user != null) {
            return user;
        }
        
        // session timed out, so let's check cookie 
        String userName = null;
        String token = null;
        javax.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (javax.servlet.http.Cookie cookie : cookies) {
                if (cookie.getName().equals(COOKIE_USERNAME)) {
                    userName = cookie.getValue();
                }
                else if (cookie.getName().equals(COOKIE_TOKEN)) {
                    token = cookie.getValue();
                }
            }
        }
        
        if (userName == null || userName.isEmpty() || token == null || token.isEmpty()) {
            return null;
        }

        user = Database.lookupByUsernameAndToken(userName, token);
        
        return user;
    }
    

    private static String getSalt() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    
    private static String shaPassword(String password, String salt) {
        String passwordSha256 = "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] mdbytes = digest.digest((password + salt).getBytes("UTF-8"));
            
            StringBuffer hexString = new StringBuffer();
            for (int i=0;i<mdbytes.length;i++) {
              hexString.append(Integer.toHexString(0xFF & mdbytes[i]));
            }
            passwordSha256 = hexString.toString().toLowerCase();
        }
        catch (NoSuchAlgorithmException nsae) {
            return nsae.toString();
        }
        catch (UnsupportedEncodingException uee) {
            return uee.toString();
        }
        
        return passwordSha256;
    }


    public static Object createUser(
            String userName,
            byte[] picture,
            String name,
            String email,
            String password) {
        
        try {
            if (Database.isExistingUser(userName)) {
                return "The username has been taken, please enter a new one.";
            }
        }
        catch (SQLException se) {
            return se.toString();
        }

        try {
            if (Database.isExistingEmail(email)) {
                return "The email has been used, please user another one.";
            }
        }
        catch (SQLException se) {
            return se.toString();
        }

        String salt = getSalt();
        String passwordSha256 = shaPassword(password, salt);
        if (passwordSha256 == null) {
            return "Something wrong happened, please try later.";
        }
        
        User user = new User();
        user.userName = userName;
        user.name = name;
        user.email = email;
        user.picture = picture;
        user.salt = salt;
        user.password = passwordSha256;

        if (Database.createUser(user)) {
        	return user;
        }
        else {
        	return "Error when registering new user, please try later.";
        }
    }
}
