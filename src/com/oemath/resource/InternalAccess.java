package com.oemath.resource;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

@Path("internal")
public class InternalAccess {
	
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public Response getProblem(
            @Context HttpServletRequest request, 
            @QueryParam("grade") int grade,
            @QueryParam("pid") int pid,
            @QueryParam("action") String action,
            @QueryParam("level") int userLevel)
    {

        String retString = "Error";
        
        try {
            JSONObject problem = new JSONObject();
            Prob prob = Database.getNextProbFromGradePid(grade, pid, action, userLevel);
            if (prob != null) {
	            problem.put("count", 1);
	            problem.put("pid", prob.pid);
	            problem.put("cid", prob.cid);
	            problem.put("level", prob.level);
	            problem.put("problem", prob.problem);
	            problem.put("param", prob.param);
	            problem.put("type", prob.type);
	            problem.put("answer", prob.answer);
	
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
	            retString = problem.toString();
            }
        }
        catch (JSONException je) {
            
        }

        return Response
                .status(200)
                .entity(retString)
                .build();
    }


    @GET
    @Path("/save")
    @Produces(MediaType.TEXT_PLAIN)
    public Response saveProblem(
            @Context HttpServletRequest request, 
            @QueryParam("grade") int grade,
            @QueryParam("pid") int pid,
            @QueryParam("type") int type,
            @QueryParam("cid") int cid,
            @QueryParam("level") int level,
            @QueryParam("prob") String prob,
            @QueryParam("param") String param,
            @QueryParam("ans") String ans,
            @QueryParam("hint") String hint)
    {
    	try {
    		pid = Database.saveProb(grade, pid, type, cid, level, prob, param, ans, hint, 2); // 2: paid user
    	}
    	catch (Exception e) {
    	}
    	
        JSONObject ret = new JSONObject();
        try {
        	if (pid > 0) {
        		ret.put("result", "success");
        		ret.put("pid", pid);
        	}
        	else {
        		ret.put("result", "failure");
        		if (pid == -1) {
            		ret.put("error", "SQL statement returns nothing");
        		}
        		else {
            		ret.put("error", "Insert failure");
        		}
        	}
        }
        catch (JSONException je) {
        }

        return Response
                .status(200)
                .entity(ret.toString())
                .build();
    }


}
