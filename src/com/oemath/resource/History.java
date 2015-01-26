package com.oemath.resource;

import java.util.ArrayList;

public class History {
	public int uid;
	
	public int cid;
	
	Integer start;
	
	ArrayList<Integer> failureList;
	
	History()
	{
		uid = 0;
		cid = 0;
		start = 0;
		failureList = null;
	}
}
