/* ==========================================================================
   STAYEASE HOTEL MANAGEMENT SYSTEM
   Module: Apache Tomcat Demonstration Servlet
   Primary Owner: Akul Agarwal (25070122030) - DevOps & Supporting Services Lead
   Course Unit Mapping: Unit 5 (Apache Tomcat Java Servlet Execution)
   ========================================================================== */

package com.stayease.hotel;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * StayEaseServlet demonstrates the deployment and execution of a Java Servlet
 * inside Apache Tomcat container for the course Unit 5 requirement.
 * 
 * Primary backend application: Node.js (Akmal Abbas, Ahasas Singh)
 * Apache Tomcat demo: Akul Agarwal (Roll No. 25070122030)
 */
public class StayEaseServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("text/html;charset=UTF-8");
        
        try (PrintWriter out = response.getWriter()) {
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>StayEase | Apache Tomcat Demonstration</title>");
            out.println("<style>");
            out.println("body { font-family: sans-serif; background: #f8fafc; color: #0f172a; padding: 2rem; }");
            out.println(".container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }");
            out.println(".badge { background: #d1fae5; color: #065f46; padding: 0.35rem 0.75rem; border-radius: 4px; font-weight: bold; }");
            out.println("</style>");
            out.println("</head>");
            out.println("<body>");
            out.println("<div class='container'>");
            out.println("<h1>🏨 StayEase Hotel Management System</h1>");
            out.println("<p><span class='badge'>Apache Tomcat Component Verified</span></p>");
            out.println("<p><strong>Course Unit:</strong> Unit 5 (Git, Jenkins, Apache Tomcat)</p>");
            out.println("<p><strong>Server Timestamp:</strong> " + new Date() + "</p>");
            out.println("<hr>");
            out.println("<h3>Architecture Note:</h3>");
            out.println("<p>The main full-stack StayEase system is implemented in Node.js, Express, HTML5, CSS3, and MongoDB to demonstrate Units 1–4. This Java Servlet is deployed to demonstrate the Apache Tomcat execution environment requirement for Unit 5.</p>");
            out.println("<p><strong>DevOps Lead:</strong> Akul Agarwal (Roll No. 25070122030)</p>");
            out.println("</div>");
            out.println("</body>");
            out.println("</html>");
        }
    }
}
