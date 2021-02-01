const AWS = require("aws-sdk");
const util = require("util");

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});

const dynamodb = new AWS.DynamoDB();
const createTable = util.promisify(dynamodb.createTable.bind(dynamodb));

const docClient = new AWS.DynamoDB.DocumentClient();
const createTableData = util.promisify(docClient.put.bind(docClient));
const getTableData = util.promisify(docClient.get.bind(docClient));

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

    try
    {
        await createTable(userTable);
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
    getTableData
};