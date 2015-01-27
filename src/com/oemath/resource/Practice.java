package com.oemath.resource;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

@Path("/practice")
public class Practice {

	// refer to enum in practice.js
	private final static String REPORT_SKIP = "0";
	private final static String REPORT_WRONG = "1";
	private final static String REPORT_CORRECT = "2";
	
	@SuppressWarnings("unchecked")
	private ArrayList<Integer> buildPidsListIfNecessary(HttpServletRequest request,
									int grade,
									int cid,
									User user,
									boolean new_session)
	{
		ArrayList<Integer> pidsList = null;
		
		HttpSession session = request.getSession(true);
        String session_key = Session.SESSION_ATTRIBUTE_PRACTICE_PIDS+"-"+grade+"-"+cid;

        if (!new_session) {
	        pidsList = (ArrayList<Integer>)session.getAttribute(session_key);
		}
		
        if (pidsList == null) {
        	pidsList = Database.getProblemIdsFromGradeCategory(grade, cid, user);
        	session.setAttribute(session_key, pidsList);
        	session.setAttribute(Session.SESSION_ATTRIBUTE_PRACTICE_LAST_PID, (Integer)pidsList.get(pidsList.size()-1));
        }
		
        return pidsList;
	}


    @POST
    @Produces(MediaType.TEXT_PLAIN)
    public Response getPractice(
            @Context HttpServletRequest request, 
            @FormParam("grade") int grade,
            @FormParam("cid") int cid,
            @FormParam("index") int index,
            @FormParam("new_session") boolean new_session)
    {
        
        String retString = "";
        try {
            User user = UserManagement.getCurrentUser(request);
            ArrayList<Integer> pidsList = buildPidsListIfNecessary(request, grade, cid, user, new_session);

            JSONObject practice = new JSONObject();
            practice.put("result", "success");
            practice.put("count", pidsList != null ? pidsList.size() : 0);
            
            if (!Utils.isEmpty(pidsList) &&  index < pidsList.size()) {
                Prob prob = Database.getProbFromGradePid(grade, cid, user, pidsList.get(index));
                if (prob == null) {
                	// TODO: this pid is invalid!!!
                }

                JSONObject problem = new JSONObject();
                problem.put("pid", prob.pid);
                problem.put("type", prob.type);
                problem.put("desc", prob.problem);
                problem.put("param", prob.param);
                problem.put("ans", prob.answer);

                if (!Utils.isEmpty(prob.hintList)) {
                    List<JSONObject> hintList = new ArrayList<JSONObject>();
                    for (Hint hint : prob.hintList) {
                        JSONObject hintObj = new JSONObject();
                        hintObj.put("hid", hint.hid);
                        hintObj.put("desc", hint.desc);
                        hintList.add(hintObj);
                    }
                    problem.put("hint", hintList);
                }
                practice.put("prob", problem);
            }
            
            retString = practice.toString();
        }
        catch (JSONException je) {
            retString = Utils.mockJsonError(je.toString());
        }

        return Response
                .status(200)
                .entity(retString)
                .build();
    }


    @POST
    @Path("/report")
    @Produces(MediaType.TEXT_PLAIN)
    public Response reportFailure(
            @Context HttpServletRequest request, 
            @FormParam("grade") int grade,
            @FormParam("cid") int cid,
            @FormParam("report") String report)
    {
    	String ret = "result:failure";
    	
    	do {
	        User user = UserManagement.getCurrentUser(request);
	        if (user == null) {
	        	break;
	        }

	        HttpSession session = request.getSession(false);
	        if (session == null) {
	        	break;
	        }
	        
	        String session_key = Session.SESSION_ATTRIBUTE_PRACTICE_PIDS+"-"+grade+"-"+cid;
	        @SuppressWarnings("unchecked")
			ArrayList<Integer> pidsList = (ArrayList<Integer>)session.getAttribute(session_key);
	        if (pidsList == null) {
	        	break;
	        }

	        Integer lastPid = (Integer)session.getAttribute(Session.SESSION_ATTRIBUTE_PRACTICE_LAST_PID);
	        if (lastPid == null) {
	        	break;
	        }
	        
            String[] fails = report.split(",");
            if (fails == null || fails.length != pidsList.size()) {
            	break;
            }
            
            ArrayList<Integer> failure = new ArrayList<Integer>();
        	for (int i=0; i<fails.length; i++) {
        		if (!fails[i].equals(REPORT_CORRECT)) {
        			failure.add(pidsList.get(i));
        		}
        	}

        	Database.saveHistory(user, cid, lastPid+1, failure);
        	ret = "result:success";
        	
    	} while (false);        

        return Response
                .status(200)
                .entity(ret)
                .build();
    }
}
