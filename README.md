# OneBox_Assignment
Assignment - Build a Feature-Rich Onebox for Emails

---

## Backend


---


## Features

### **1. Real-Time Email Synchronization**

- Sync multiple **IMAP accounts** in real-time - minimum 2
- Fetch **at least the last 30 days** of emails
- Use **persistent IMAP connections (IDLE mode)** for real-time updates (**No cron jobs!**).

### **2. Searchable Storage using Elasticsearch**

- Store emails in a **locally hosted Elasticsearch** instance (use Docker).
- Implement indexing to **make emails searchable**.
- Support filtering by **folder & account**.

### **3. AI-Based Email Categorization**

- Implement an AI model to categorize emails into the following labels:
    - **Interested**
    - **Meeting Booked**
    - **Not Interested**           
    - **Spam**
    - **Out of Office**

### **4. Slack & Webhook Integration**

- Send **Slack notifications** for every new **Interested** email.
- Trigger **webhooks** (use [webhook.site](https://webhook.site) as the webhook URL) for external automation when an email is marked as **Interested**.


---


## Tech Stack :-

-- **Node.js** with **Express**
-- **TypeScript**
-- **Dotenv**
-- **Axios**
-- **IMAP** ("imapflow")
-- **ElasticSearch**
-- **OpenAI/Gemini API**
-- **Slack Webhooks**
-- **Docker**
-- **Mailparser**


---


## Run this Backend Project Locally...

Follow the following to run this OneBox Backend server on your system:-

###  Prerequisites required..

Carefully install the following before running the backend:-

--**Node.js**(v18)
--**API key**
--**IMAP enabled google account and app password**(After Turning on 2FA)
--**Docker**(Install Docker dekstop and set it up)
--**Postman** (For test APIs purpose..)
--Optional guide:- **use my package.json file dependencies to recheck versions**


-----------------------------------------------------------------------------------------------------------------------------------------

## Setting Up Files on you system


1. Clone the Repository

"git clone https://github.com/Arpit-singh12/OneBox_Assignment.git"

2. Set up Environmental variables

locate/create ".env" file and then add the following:-

2.1 OPENAI_API_KEY='Enter you API key'/GEMINI_API_KEY='Enter your Gemini API key here'
2.2 SlackWebhook_URL='Enter the URL'
2.3 INTERESTED_WEBHOOK_URL='Enter the URL'

2.4 ElasticSearchNode = http://localhost:9200

3. Install all dependencies

**npm install**

4. Run ElasticSearch using Docker

Note: you can use my docker-compose.yml file.

On terminal:
    >Run docker --version to confirm docker is installed
    >docker-compose pull to load the docker and Kibana
    >docker-compose down to down the docker server and then again pull
    (This is personal Tip if you caught any error in ES you can do this...)

5. Start the Development server

**npm run dev**

You can see on terminal as:-

Index 'emails' already exists
Server is running on port <PORT>


-----------------------------------------------------------------------------------------------------------------------------------------
## Test the API

Recommended to use Postman

1. Create IMAP account get your key password with you
2. Use Post method http://localhost:PORT/account

3. Make sure Postman read content on json format

4. on body :-
{
  "email": "your@gmail.com",
  "password": "your_app_password",
  "host": "imap.gmail.com",
  "port": 993,
  "secure": true
}


5. Search for emails:-
Use GET method http://localhost:PORT/account/search/category?query=demo&account=your@gmail.com&folder=INBOX


Note:
    Some issue you can tackle:-
    > Gmail IMAP login failed? Make sure you use an App password.
    > Have ElasticSearch Error take a look and check docker is running on port 9200.x
    > for categorisation issue check you API key and declaration of Key.



-Some Part of this Codebase is assisted by Chatgpt for some structure of tackling errors...































To check the synced/stored mails: http://localhost:9200/emails/_search?pretty (Consider to verify your own host)