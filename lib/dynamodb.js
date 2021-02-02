const AWS = require("aws-sdk");
const util = require("util");

if (process.env.NODE_ENV !== "production")
{
    AWS.config.update({
        region: "us-east-1",
        endpoint: "http://localhost:8000"
    });
}

const dynamodb = new AWS.DynamoDB();
const createTable = util.promisify(dynamodb.createTable.bind(dynamodb));
const deleteTable = util.promisify(dynamodb.deleteTable.bind(dynamodb));

const docClient = new AWS.DynamoDB.DocumentClient();
const createTableData = util.promisify(docClient.put.bind(docClient));
const getTableData = util.promisify(docClient.get.bind(docClient));
const queryTableData = util.promisify(docClient.query.bind(docClient));

async function initdb()
{
    const userTable = {
        TableName: "users",
        KeySchema: [
            { AttributeName: "username", KeyType: "HASH" }
        ],
        AttributeDefinitions: [       
            { AttributeName: "username", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    }

    const userSessionTable = {
        TableName: "userSessions",
        KeySchema: [
            { AttributeName: "username", KeyType: "HASH" },
            { AttributeName: "timestamp", KeyType: "RANGE" }
        ],
        AttributeDefinitions: [ 
            { AttributeName: "username", AttributeType: "S" },
            { AttributeName: "timestamp", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    }

    try
    {
        await createTable(userTable);
        // await deleteTable({TableName: "userSessions"})
        await createTable(userSessionTable);
        console.log("initialised dynamodb tables");
    }
    catch (error)
    {
        // console.log(error);
    }

}

initdb();

module.exports = {
    dynamodb,
    createTable,
    docClient,
    createTableData,
    getTableData,
    queryTableData
};