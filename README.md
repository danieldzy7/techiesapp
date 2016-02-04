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

Features:

Profiling: When users register for application, they create a personal profile. Here they provide their department of study and the area of specialization. Backend side will create token and id.

User Authentication and Authorization: System authenticates users based on correct email and password combination. App requires every user to have a unique email address. There is also an option for users to login using their Google account and Facebook. 

Data and Assets: Users could create and share their ideas to others. The Ideas contain title, description, tags and so on. Ideas could also be rated by other users.
 
Social Network: Socket.io based Chatroom design

Search and Filtering: Two types of filters to get filtered user ideas and others’ idea.
