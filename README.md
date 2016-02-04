Project Description:

Name: Techies  (MEAN Stack Web Application)
            --Created by Ryan D
            --Full-Stack JavaScript Using MongoDB, Express, AngularJS, and Node.js. 

Synopsis:

    Techies is web app target people who want to learn MEAN stack web development. Techies 
    admin site allowed user to create their ideas and interact with other user, and this
    webapp itself is a fully functional and could be used as learning resource.


Local installation:

    1. Install Nodejs on your machine
    2. Install mongodb and run your own OR just used default database setting
    3. Clone the repository from github
    4. Run: npm install
    5. Run: bower install
    6. Run: npm start
    6. Open browser and enter url: http://localhost:3000/
    
    
Heroku hosting:
    Access the web application at http://techies-demo.herokuapp.com.
    
    
Security Related:
1.	Secure third party authentication using Passport-Oauth module:
            a)	Data encryption in Database using bcrypt.js – Users Password
            b)	Authorizes third-party access Facebook/Google authentication. 
            c)	Uses the access token to access the protected resources and perform API calls.

2.          Helmet.js is used to prevent following security vulnerabilities of the site
            a)Use helmet to secure Express apps by setting various HTTP headers. Could be tested by printing out the http request object and check if those fields are set properly. 
            b)Attacks types:
            XSS Filter- Prevent attacker injects executable code to an HTTP response
            Frame Options- Use the X-Frame HTTP header restricts. Prevent put the site into <frame>
            HTTP Strict Transport Security- User could use https

Performance:
            1.Multithreading the node.js server using PM2 module( Used Locust tested, decrease execute time 20ms as the requests>35)
            2.Reduce number of database queries—could be done through cache, retrieve all ideas using single JSON object.
            Automated API Testing: JMeter, Mocha, Locust 

Features:
            1.Profiling: When users register for application, they create a personal profile. Here they provide their department of study and the area of specialization. Backend side will create token and id.
            2.User Authentication and Authorization: System authenticates users based on correct email and password combination. App requires every user to have a unique email address. There is also an option for users to login using their Google account and Facebook. 
            3.Data and Assets: Users could create and share their ideas to others. The Ideas contain title, description, tags and so on. Ideas could also be rated by other users.
            4.Social Network: Socket.io based Chatroom design
            5.Search and Filtering: Two types of filters to get filtered user ideas and others’ idea.
