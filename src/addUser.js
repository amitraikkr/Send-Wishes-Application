import {DynamoDBClient} from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb"
import {v4 as uuidv4} from 'uuid';

const dbClient = new DynamoDBClient({});
const ddbClient = DynamoDBDocumentClient.from(dbClient);

export const handler =  async (event, context) => {
    console.log("Recieved event: ", event);
    const tableName_User = process.env.TABLE_NAME_USER;

    if(!event.body){
        console.log("Invalid Input, body is required");
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid Input, body is required"}),
        };
    }

    const data = JSON.parse(event.body);

    if(!data.username || !data.email) {
        console.log("Username, Email are required");
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Username, Email are required"}),
        };
    }

    const item = {
        id: uuidv4(),
        username: data.username,
        email: data.email,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
    };

    const params = {
        TableName: tableName_User,
        Item: item,
    };

    try{
            await ddbClient.send(new PutCommand(params));
            console.log("User data written to DynamoDB successfully")

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "User data written to DynamoDB successfully"})
            }

    } catch (error) {
        console.error("Error writing to DynamoDB:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error writting to DynamoDB"}),
        };
    }

}