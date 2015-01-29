package com.oemath.resource;

import java.io.ByteArrayInputStream;
import java.sql.Blob;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;

public class Database {

	private static boolean JAVA_EVAL = false;
	
	private static String[] tblPrefix = { "guest_", "reg_", "paid_" };
	private static String[] tblHistory = { "hist_reg", "hist_paid" };
	private static int PRACTICE_COUNT = 5;
	
	private static String getHistTable(int level) {
		return tblHistory[level-1];
	}
	
    ////////////////////////////////////////
    ////////// user 
    ////////////////////////////////////////
    
    public static boolean createUser(User user) { 
        try {
            DBConnect dbConn = new DBConnect();
            PreparedStatement pstmt = dbConn.prepareStatement("insert into user values(?,?,?,?,?,?,?,?,?,?,?,?,?)");
            pstmt.setInt(1, 0); // uid
            pstmt.setString(2, user.userName);
            if (user.picture == null || user.picture.length == 0) {
                pstmt.setNull(3,  Types.BLOB);
            }
            else {
                pstmt.setBlob(3, new ByteArrayInputStream(user.picture));
            }
            pstmt.setString(4, user.name);
            pstmt.setString(5, user.email);
            pstmt.setString(6, user.salt);
            pstmt.setString(7, user.password);
            pstmt.setInt(8, 0);
            pstmt.setNull(9, Types.DATE);
            pstmt.setNull(10, Types.VARCHAR);
            pstmt.setNull(11, Types.DATE);
            Date currentDate = new Date(System.currentTimeMillis()); 
            pstmt.setDate(12, currentDate);
            pstmt.setDate(13, currentDate);
            pstmt.executeUpdate();
            return true;
        }
        catch (Exception ex) {
            return false;
        }
    }


    public static void saveHistory(User user, int cid, int start, ArrayList<Integer> failure)
    {
    	String failureStr;
    	if (!Utils.isEmpty(failure)) {
        	StringBuffer sb = new StringBuffer();
        	sb.append(failure.get(0));
        	for (int i=1; i<failure.size(); i++) {
        		sb.append(',');
        		sb.append(failure.get(i));
        	}
        	failureStr = sb.toString();
    	}
    	else {
    		failureStr = "";
    	}
    	
    	String tbl = getHistTable(User.getLevel(user));
        String query = "update "+tbl+" set start="+start+",failure='"+failureStr+"' where uid="+user.uid+" and cid="+cid;
        DBConnect conn = new DBConnect();
        if (conn.executeUpdate(query) == 0) {
        	try {
	            PreparedStatement pstmt = conn.prepareStatement("insert into "+tbl+" values(?,?,?,?)");
	            pstmt.setInt(1, user.uid);
	            pstmt.setInt(2, cid);
	            pstmt.setInt(3, start);
	            pstmt.setString(4, failureStr);
	            pstmt.executeUpdate();
        	}
        	catch (SQLException se) {
        		
        	}
        }
    }
    
    
    public static History getHistory(User user, int cid)
    {
    	if (user == null) {
    		return null;
    	}
    	
    	String tbl = getHistTable(User.getLevel(user));
        DBConnect dbConn = new DBConnect();
        String query = "select start, failure from "+tbl+" where uid=" + user.uid + " and cid=" + cid; 
        
        ResultSet rs = dbConn.execute(query);
        
        if (rs != null) {
        	History hist = new History();
            try {
                while (rs.next()) {
                	hist.start = rs.getInt("start");
                	String failure = rs.getString("failure");
                	String[] failureList = failure.split(",");
                	if (failureList.length > 0) {
                		hist.failureList = new ArrayList<Integer>();
	                	for (String f : failureList) {
	                		try {
	                			hist.failureList.add(Integer.parseInt(f));
	                		}
	                		catch (NumberFormatException nfe) {
	                			break;
	                		}
	                	}
                	}
                	return hist;
                }
            }
            catch (SQLException sqlex) {
            }
        }       

        return null;
    }
    

    private static ArrayList<Integer> getProblemIds(String tbl, int cid, int start, int limit) {
        DBConnect dbConn = new DBConnect();
        String query = "select pid from "+tbl+" where cid=" + cid + " and pid>="+start+" order by pid limit " + limit; 
        
        ResultSet rs = dbConn.execute(query);
        ArrayList<Integer> pidList = new ArrayList<Integer>();
        
        if (rs != null) {
            try {
                while (rs.next()) {
                    pidList.add(rs.getInt("pid"));
                }
            }
            catch (SQLException sqlex) {
            }
        }       

        return pidList;
    }
    
    
    public static ArrayList<Integer> getProblemIdsFromGradeCategory(int grade, int cid, User user) {
    	History hist = getHistory(user, cid);
    	ArrayList<Integer> pidList = new ArrayList<Integer>();

    	int start = 0;
    	int limit = PRACTICE_COUNT;
    	if (hist != null && !Utils.isEmpty(hist.failureList)) {
    		start = hist.start;
    		pidList.addAll(hist.failureList);
    		limit -= hist.failureList.size();
    	}

        int level = User.getLevel(user);
    	String tbl = tblPrefix[level] + grade;
    	
    	ArrayList<Integer> list1 = getProblemIds(tbl, cid, start, limit);
    	pidList.addAll(list1);
    	
    	limit = PRACTICE_COUNT - pidList.size();
    	if (limit > 0) {
    		list1 = getProblemIds(tbl, cid, 0, limit);
        	pidList.addAll(list1);
    	}

        return pidList;
    }

    
    public static User lookupByUsernameAndToken(String userName, String token) {

        DBConnect dbConn = new DBConnect();
        String query = "select * from user where lower(user_name) like '" + userName.toLowerCase() + 
                "' and token like '" + token + "'";
        ResultSet rs = dbConn.execute(query);
        
        return createUserFromRowset(rs);
    }
    
    public static User lookupByUsernameOrEmail(String userNameOrEmail) {

        DBConnect dbConn = new DBConnect();
        String query = "select * from user where lower(" +
                (userNameOrEmail.indexOf('@') < 0 ? "user_name" : "email") +
                ") like '"+userNameOrEmail.toLowerCase()+"'";
        ResultSet rs = dbConn.execute(query);
        
        return createUserFromRowset(rs);
    }
    

    public static void updateUserToken(String userName, String token) {
        String query = "update user set token='"+token+"' where lower(user_name) like '" + userName.toLowerCase().trim() + "'";
        new DBConnect().executeUpdate(query);
    }


    public static void clearTokenByUsernameAndToken(String userName, String token) {
        String query = "update user set token='' where lower(user_name) like '" + 
                userName.toLowerCase().trim() + "' and token like '" + token + "'";
        new DBConnect().executeUpdate(query);
    }
    
    
    public static boolean isExistingUser(String userName) throws SQLException {
        DBConnect dbConn = new DBConnect();
        ResultSet rs = dbConn.execute("select user_name from user where lower(user_name) like '" + userName.toLowerCase() + "'");
        
        return (rs != null && rs.first());
    }
    
    
    public static boolean isExistingEmail(String email) throws SQLException {
        DBConnect dbConn = new DBConnect();
        ResultSet rs = dbConn.execute("select email from user where lower(email) like '" + email.toLowerCase() + "'");
        
        return (rs != null && rs.first());
    }
    

    ////////////////////////////////////////
    ////////// practice 
    ////////////////////////////////////////
    
    public static ArrayList<Integer> getProblemIdsFromGradeCategorySample(int grade, int cid, boolean sample) {
        DBConnect dbConn = new DBConnect();
        
        String query = "select pid from prob_g" + grade +" where cid=" + cid; 
        if (sample) {
            query += " and sample is true";
        }
        
        ResultSet rs = dbConn.execute(query);
        ArrayList<Integer> pidList = null;
        
        if (rs != null) {
            pidList = new ArrayList<Integer>();
            try {
                while (rs.next()) {
                    pidList.add(rs.getInt("pid"));
                }
            }
            catch (SQLException sqlex) {
            }
        }       

        return pidList;
    }
    

    public static ArrayList<Hint> getHintFromHidLlist(String hids) {
        ArrayList<Hint> hintList = null;

        if (hids != null && !hids.trim().isEmpty()) {
            String query = "select hid, description from hint where hid in (" + hids + ")";
            ResultSet rsHint = new DBConnect().execute(query);

            if (rsHint != null) {
                hintList = new ArrayList<Hint>();
                try {
                    while (rsHint.next()) {
                        Hint hint = new Hint();
                        hint.hid = rsHint.getInt("hid");
                        hint.desc = rsHint.getString("description");
                        hintList.add(hint);
                    }
                }
                catch (SQLException sqlex) {
                }
            }
        }

        return hintList;
    }
    

    public static Prob getProbFromGradePid(int grade, int cid, User user, int pid) {
    	if (grade < 0 || cid < 0 || pid < 0) {
    		return null;
    	}
    	
        DBConnect dbConn = new DBConnect();
        ResultSet rs = dbConn.execute("select pid, problem, param, answer, hint, type from "+tblPrefix[User.getLevel(user)]+ grade +" where pid=" + pid);
        
        if (rs == null) {
            return null;
        }

        Prob prob = null;
        try {
            while (rs.next()) {
                prob = new Prob();
                prob.pid = rs.getInt("pid");
                prob.type = rs.getInt("type");
                prob.problem = rs.getString("problem");
                prob.param = rs.getString("param");
                prob.answer = rs.getString("answer");
                if (Utils.isEmpty(prob.answer)) {
                    prob.answer = "<ans>";
                }
                prob.hintList = getHintFromHidLlist(rs.getString("hint"));
                
                if (JAVA_EVAL) {
                	HashMap<String,String> paramMap = Utils.parseParamMap(prob.param);
                
                	prob.param = "";
                	prob.problem = Utils.replaceParameter(prob.problem, paramMap);
                	prob.answer = Utils.replaceParameter(prob.answer, paramMap);
                        
	                if (!Utils.isEmpty(prob.hintList)) {
	                    for (Hint hint : prob.hintList) {
	                        hint.desc = Utils.replaceParameter(hint.desc, paramMap);
	                    }
	                }
                }	                
	                
	            break;
            }
        }
        catch (SQLException sqlex) {
        }

        return prob;
    }
    
    
    private static User createUserFromRowset(ResultSet rs) {
        User user = null;
        
        try {
            if (rs != null && rs.first()) {
                user = new User();
                user.uid = rs.getInt("uid");
                user.userName = rs.getString("user_name");
                user.name = rs.getString("name");
                Blob pictureBlob = rs.getBlob("picture");
                if (pictureBlob != null) {
                    user.picture = pictureBlob.getBytes(0, (int)pictureBlob.length());
                }
                user.email = rs.getString("email");
                user.salt = rs.getString("salt");
                user.password = rs.getString("password");
                user.paidUser = rs.getBoolean("paid");
                user.paymentExpiration = rs.getDate("paid_expiration");
            }
        }
        catch (SQLException se) {
        }

        return user;
    }

    ////////////////
    // internal use
    ////////////////
    public static Prob getNextProbFromGradePid(int grade, int pid, String action, int userLevel) {
        DBConnect dbConn = new DBConnect();
        
        String queryStr = "select pid, problem, param, answer, hint, cid, type, level from "+tblPrefix[userLevel]+ grade +" where pid";
        if ("prev".equals(action)) {
        	queryStr += "<" + pid  + " order by pid desc limit 1";
        }
        else {
        	if ("next".equals(action)) action = ">"; else action = ">=";
        	queryStr += action + pid  + " order by pid limit 1";
        }
        
        ResultSet rs = dbConn.execute(queryStr);
        
        if (rs == null) {
            return null;
        }

        Prob prob = null;
        try {
            while (rs.next()) {
                prob = new Prob();
                
                prob.pid = rs.getInt("pid");
                prob.cid = rs.getInt("cid");
                prob.level = rs.getInt("level");
                prob.problem = rs.getString("problem");
                prob.param = rs.getString("param");
                prob.type = rs.getInt("type");
                prob.answer = rs.getString("answer");
                
                /*String[] ans = Utils.replaceParameter(prob.answer, paramMap).split("$$");
                for (int i=0; i<ans.length; i++) {
                    try {
                        ans[i] = JEval.getEngine().eval(ans[i]).toString();
                    }
                    catch (ScriptException je) {
                    }
                    if (i != 0) {
                        prob.answer += " $$ ";
                    }
                    prob.answer = ans[i];
                }*/
                        
                prob.hintList = getHintFromHidLlist(rs.getString("hint"));
                if (!Utils.isEmpty(prob.hintList)) {
                    for (Hint hint : prob.hintList) {
                        hint.desc = hint.desc;
                    }
                }
                break;
            }
        }
        catch (SQLException sqlex) {
        }
        
        return prob;
    }
    
    
    public static int saveProb(
    		int grade, 
    		int pid,
    		int type, 
    		int cid,
    		int level,
    		String desc, 
    		String param, 
    		String ans, 
    		String hint, 
    		int userLevel)
    {
        try {
            DBConnect dbConn = new DBConnect();
            String tbl = tblPrefix[userLevel]+grade;
            
            if (pid == 0) { // new prob
	            PreparedStatement pstmt = dbConn.prepareStatement("insert into "+tbl+" values(?,?,?,?,?,?,?,?,?)");
	            pstmt.setInt(1, pid);
	
	            pstmt.setString(2, desc);
	            pstmt.setString(3, param);
	            pstmt.setString(4, ans);
	            pstmt.setString(5, hint);

	            pstmt.setInt(6, cid);
	            pstmt.setInt(7, type);
	            pstmt.setInt(8, level);
	            
	            Date currentDate = new Date(System.currentTimeMillis()); 
	            pstmt.setDate(9, currentDate);
	            pstmt.executeUpdate();

	            ResultSet rs = pstmt.getGeneratedKeys();
	            if (rs != null) {
	            	while (rs.next()) {
	            		pid = rs.getInt(1);
	            		break;
	            	}
	            }
	            return pid;
            }
            else { // update
                String query = "update "+tbl+" set "+
                		" pid="+pid+
                		",cid=" + cid +
                		",level=" + level +
                		",problem='" + Utils.escapeSql(desc) +"'"+
                		",param='" + Utils.escapeSql(param) +"'"+
                		",type=" + type +
                		",answer='" + Utils.escapeSql(ans) +"'"+
                		",hint='" + Utils.escapeSql(hint) +"'"+
                		" where pid=" + pid;
                int rows = dbConn.executeUpdate(query); // either (1) the row count for SQL Data Manipulation Language (DML) statements or (2) 0 for SQL statements that return nothing
                return (rows == 1) ? pid : -1;
            }
        }
        catch (Exception ex) {
            return 0;
        }
    }

}
