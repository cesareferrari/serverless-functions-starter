require("dotenv").config();
const Airtable = require("airtable-node");

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base("appnHQSX20Cy8x2qz")
  .table("survey");

exports.handler = async (event, context) => {
  const method = event.httpMethod;

  // GET
  if (method === "GET") {
    try {
      const { records } = await airtable.list();
      const survey = records.map((item) => {
        const { id } = item;
        const { room, votes } = item.fields;
        return { id, room, votes };
      });

      return {
        statusCode: 200,
        body: JSON.stringify(survey),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: "Server error",
      };
    }
  }

  // PUT
  if (method === "PUT") {
    try {
      const { id, votes } = JSON.parse(event.body);
      if (!id || !votes) {
        return {
          statusCode: 400,
          body: "Please, provide ID and votes values",
        };
      }

      const fields = { votes: Number(votes) + 1 };
      const item = await airtable.update(id, { fields });
      console.log(item);
      if (item.error) {
        return {
          statusCode: 400,
          body: JSON.stringify(item),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(item),
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: "Please, provide ID and votes values",
      };
    }
  }

  // Default
  return {
    statusCode: 405,
    body: "Only GET and PUT requests allowed",
  };
};
