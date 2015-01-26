package com.oemath.resource;

import java.sql.Date;

public class User {
	public int uid;
	
    public String userName;
    
    public String name;
    
    public byte[] picture;
    
    public String email;
    
    public String salt;
    
    public String password;
    
    public boolean paidUser;
    
    public Date paymentExpiration;
    
    public boolean isPaymentValid() {
        return paymentExpiration != null &&
               paymentExpiration.compareTo(new Date(System.currentTimeMillis())) >= 0; 
    }
    
    public static int getLevel(User user) {
        int level = UserManagement.USER_GUEST;
        if (user != null) {
        	level = user.isPaymentValid() ? UserManagement.USER_PAID : UserManagement.USER_REGISTERED; 
        }
        return level;
    }
}
