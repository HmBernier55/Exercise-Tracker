# Exercise Tracker

This is the code for the Exercise Tracker project. Instructions for building the project can be found at https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker

## Code Explanation
* This code includes three API routes:
    * `/api/users`
        * POST Request:
            * Takes a user inputted username, saves it to a database, returns a JSON object of the form:
            ```
            {
                username: <username string>,
                _id: <unique id string>
            }
            ```
        * GET Request:
            * Returns a list of objects of all the users in the database
            * The objects within the list have the same format as the above example
    * `/api/users/:id/exercises`
        * User inputs a description, duration, and date of an exercise they want to be logged within the database
        * Description and duration fields must be filled out
        * If the date field has an invalid date or is left blank, the date of when the exercise is logged will be used
        * The information is saved for that user as an object within the log array within the database
        * Returns a JSON object of the form:
        ```
        {
            username: <username string>,
            description: <description string>,
            duration: <duration integer>,
            date: <date string>,
            _id: <unique id string>
        }
        ```
    * `/api/users/:id/logs?`
        * User inputs the id corresponding to their username within the URL
        * Returns a JSON object of the form:
        ```
        {
            username: <username string>,
            count: <number of tracked exercises>,
            _id: <unique id string>,
            log: [{
                description: <exercise description string>,
                duration: <exercise duration string>,
                date: <date string>
            }]
        }
        ```
        * The user has the option to input three queries into the URL:
            * `from`
                * A date string (YYYY-MM-DD)
            * `to`
                * A date string (YYYY-MM-DD)
            *  `limit`
                * An integer
        * These queries are used to determine how many exercises are returned within the JSON object's log array
        * The "from" and "to" queries are used to condense the number of exercises based on the date of the exercises
        * The "limit" query is used to condense the number of exercises within the log array
        * If the queries are not added to the URL, the entire list of exercises will be returned within the JSON object's log array