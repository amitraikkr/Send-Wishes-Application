import {DynamoDBClient} from "@aws-sdk/client-dynamodb"
import {DynamoDBDocumentClient, PutCommand} from "@aws-sdk/lib-dynamodb"
import {v4 as uuidv4} from 'uuid';

const dbClient = new DynamoDBClient({});
const dbdClient = DynamoDBDocumentClient.from(dbClient);

export const handler = async(event, context) =>{
    const tableName = process.env.TABLE_NAME;
    console.log("Received event: ", JSON.stringify(event, null, 2));
    if(!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid Input, body is required"}),
        };
    }
    const data = JSON.parse(event.body);

    if(!data.username || !data.recipient_name || !data.anniversary_date || !data.anniversary_type || !data.recipient_name) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "username, recipient_name, recipient_name, anniversay_date, and anniversary_type are required"}),
        };
    }
    const item = {
        id: uuidv4(),
        username: data.username,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        anniversary_date: data.anniversary_date,
        anniversary_type: data.anniversary_type,
        created_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
    };

    const params = {
        TableName: tableName,
        Item: item,
    }

    try{

        await dbdClient.send(new PutCommand(params));
        console.log("Data written to DynamoDB successfully");
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Data written successfully"}),
        };
    } catch(error) {
        console.error("Error writing to DynamoDB:" , error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to write data", error: error.message }),
        };
    }


}
