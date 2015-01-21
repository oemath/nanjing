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

	private ArrayList<Integer> buildPidsListIfNecessary(HttpServletRequest request,
									int grade,
									int cid,
									int userLevel) {
        HttpSession session = request.getSession(true);
        String session_key = Session.SESSION_ATTRIBUTE_PRACTICE_PIDS+"-"+grade+"-"+cid;
        
        @SuppressWarnings("unchecked")
        ArrayList<Integer> pidsList = (ArrayList<Integer>)session.getAttribute(session_key);
        if (pidsList == null) {
        	pidsList = Database.getProblemIdsFromGradeCategory(grade, cid, userLevel);
        	session.setAttribute(session_key, pidsList);
        }
		
        return pidsList;
	}


    @POST
    @Produces(MediaType.TEXT_PLAIN)
    public Response getPractice(
            @Context HttpServletRequest request, 
            @FormParam("grade") int grade,
            @FormParam("cid") int cid,
            @FormParam("index") int index)
    {
        
        String retString = "";
        try {
            int userLevel = UserManagement.getCurrentUserLevel(request);
            ArrayList<Integer> pidsList = buildPidsListIfNecessary(request, grade, cid, userLevel);

            JSONObject practice = new JSONObject();
            practice.put("result", "success");
            practice.put("count", pidsList != null ? pidsList.size() : 0);
            
            if (!Utils.isEmpty(pidsList) &&  index < pidsList.size()) {
                Prob prob = Database.getProbFromGradePid(grade, cid, userLevel, pidsList.get(index));

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
}
