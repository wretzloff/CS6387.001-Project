# CS6387.001-Project

1. Download and install Node.js (https://nodejs.org/en/download/).
2. Using command line, update to the latest version of NPM (Node Package Manager): <br>
	&nbsp;&nbsp;&nbsp;&nbsp; npm install npm@latest -g
3. Using command line, navigate to the location of the server's package.json file. For me: <br>
	&nbsp;&nbsp;&nbsp;&nbsp; cd C:\Users\wretz\Desktop\CS6387.001-Project\trunk\Backend
4. Using command line, install all dependencies that are specified in the package.json file: <br>
	&nbsp;&nbsp;&nbsp;&nbsp; npm install	
5. Using command line, start the web server. In my case, I ran the command below. <br>
	&nbsp;&nbsp;&nbsp;&nbsp; node C:\Users\wretz\Desktop\CS6387.001-Project\trunk\Backend\server.js <br>
	&nbsp;&nbsp;&nbsp;&nbsp; It will say “server is listening on 3000”.
6. Install the OpenShift client tool (called RHC): https://developers.openshift.com/getting-started/windows.html#client-tools
7. Using command line, create a tunnel to the hosted project's MySQL database: <br>
	&nbsp;&nbsp;&nbsp;&nbsp; rhc port-forward utdtextookexchange
8. Navigate to one of the example endpoints. In your browser, go to: <br>
	&nbsp;&nbsp;&nbsp;&nbsp; http://localhost:3000 <br>
	&nbsp;&nbsp;&nbsp;&nbsp; http://localhost:3000/GetBooksForClass/?class=CS1336.001.17S
