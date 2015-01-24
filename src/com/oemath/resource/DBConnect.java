package com.oemath.resource;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DBConnect {
    
    private Connection conn;
    
    private Statement stat;
    
    private String errMessage;
    
    public DBConnect() {
        try {
            Class.forName("com.mysql.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/oemath", "root", "");
            stat = conn.createStatement();
        }
        catch (Exception ex) {
            errMessage = ex.getMessage();
        }
    }
    
    public ResultSet execute(String query) {
        ResultSet rs = null;
        
        try {
            rs = stat.executeQuery(query);
        }
        catch (Exception ex) {
            errMessage = ex.getMessage();
        }
        
        return rs;
    }
    
    public int executeUpdate(String query) {
    	int rows = 0;
    	
        try {
            rows = stat.executeUpdate(query);
        }
        catch (Exception ex) {
            errMessage = ex.getMessage();
        }
        
        return rows;
    }
    
    public PreparedStatement prepareStatement(String query) {
        try {
            return conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS);
        }
        catch (SQLException se) {
            return null;
        }
    }

    public String getLastError() {
        return errMessage;
    }
}
