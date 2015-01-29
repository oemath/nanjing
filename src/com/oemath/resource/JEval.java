package com.oemath.resource;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class JEval {

    static ScriptEngine engine;
    public static ScriptEngine getEngine() { return engine; }
    
    static {
        ScriptEngineManager mgr = new ScriptEngineManager();
        engine = mgr.getEngineByName("JavaScript");
        
        try {
            engine.eval("function gcd_(x, y) { while (y != 0) { var z = x % y; x = y; y = z; } return x; }");
            engine.eval("function gcd() { var ret = arguments[0]; for (var i=1; i<arguments.length; i++) { ret = gcd_(ret, arguments[i]); } return ret; }");

            engine.eval("function lcm_(x, y) { return x * y / gcd_(x, y); } ");
            engine.eval("function lcm() { var ret = arguments[0]; for (var i=1; i<arguments.length; i++) { ret = lcm_(ret, arguments[i]); } return ret; }");
            
            engine.eval("function F(n) { var f = 1; for (var i=2; i<=n; i++) { f *= i; } return f; } ");
            engine.eval("function P(n, m) { var f = 1; for (var i=n-m+1; i<=n; i++) { f *= i; } return f; }");
            engine.eval("function C(n, m) { return P(n, m) / F(m); }");
            
            engine.eval("function cos(x) { return Math.cos(x * Math.PI / 180); }");
            engine.eval("function sin(x) { return Math.sin(x * Math.PI / 180); }");
            
            engine.eval("function num() { var n = 0; for (var i = 0; i < arguments.length; i++) { n = n*10 + arguments[i]; } return n; }");

            
            engine.eval("function rand(n) { return ((Math.random() * 100000000) % n) >> 0; }");
        }
        catch (ScriptException se) {
            
        }
    }
    
}
