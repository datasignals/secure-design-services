import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import * as crypto from 'crypto';
import AddChecksum from "./AddChecksum";
import {MongoService} from "./MongoService";
import { collections } from "./MongoService";
import { kafkaListener } from '../config/config.json';
// "contractAddress": "aC1RUjpvFmt3WVYzsRVunZxeVE464uopMdHVKKMgb86MXVQ",
// "provider": "wss://rpc.shibuya.astar.network",
const mongooseService = MongoService.getInstance();
const kafka = new Kafka({
  clientId: kafkaListener.clientId,
  brokers: [kafkaListener.brokers],
  // retry: {
  //   initialRetryTime: 100, // initial retry time in ms
  //   retries: 10 // maximum number of retries
  // }
});

const consumer: Consumer = kafka.consumer({ groupId: kafkaListener.groupId });
const buffer: Array<{ timestamp: number; event: string; filePath: string; designerName?: string }> = [];

let consumerConnected = false;
const MAX_BUFFER_SIZE = 1000; 
const connectKafka = async () => {
  try {
    await consumer.connect();
    console.log('Consumer connected to Kafka');
    consumerConnected = true; // Update connection status
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
    consumerConnected = false; // Update connection status
  }
};
// Continuous loop for connection maintenance
const maintainConnection = async () => {
  while (true) {
    if (!consumerConnected) {
      await connectKafka();
    }
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check connection status every 5 seconds
  }
};
// Start maintaining connection

// const maintainConnection = async () => {
//   while (true) {
//     try {
//       if (!consumerConnected) {
//         await connectKafka();
//       }
//     } catch (error) {
//       console.error('Error connecting to Kafka:', error);
//       consumerConnected = false; // Update connection status
//       // Add logic to handle reconnection here
//     }
//     await new Promise(resolve => setTimeout(resolve, 5000)); // Check connection status every 5 seconds
//   }
// };



const processBuffer = async () => {
  if (buffer.length > 0) {
    // if (Date.now() - (Date.parse(buffer[0].timestampString)) > 1 * 60 * 1000 || buffer.length >= 300) {
      if (Date.now() - buffer[0].timestamp > 1 * 60 * 1000 || buffer.length >= MAX_BUFFER_SIZE) {
      await saveToDatabase();
    }
  }
};

const saveToDatabase = async () => {
  const combinedData = JSON.stringify(buffer);
  const hash = crypto.createHash('md5');
  hash.update(combinedData);
  const checksum = hash.digest('hex');

  try {
    if (checksum) {
      // INVOKE BLOCKCHAIN
      const blockchainHash = await new AddChecksum().addChecksum(checksum);
      console.log("blockchainHash",blockchainHash);
      if (blockchainHash) {
        // Connect to MongoDB
        await mongooseService.connect();
        // Insert records along with the checksum
        const recordsWithChecksum = { checksum, Filerecords: buffer, blockchainHash }
        await collections.FileSystemRecords?.insertOne(recordsWithChecksum);
      }
      else {
        console.error("Not inserted in MongoDB: Blockchain hash not available");
      }
    } else {
      console.error("Checksum Not Created");
    }

  } catch (error) {
    console.error("Error during MongoDB or Blockchain operations:", error);
  }
  buffer.length = 0;
};

const run = async (): Promise<void> => {
  // Connect to Kafka
//   await connectKafka();
  await consumer.connect();
  // Subscribe to Kafka topic
  await consumer.subscribe({ topic:kafkaListener.topic });

  // Start consuming messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value?.toString(),
      });

      const { offset, value } = message;
      const messageString = value?.toString();
      if (messageString) {
        const [timestampString, event, filePath, designerName] = messageString.split(', ');
        const timestamp = new Date(timestampString).getTime();
        const record = {
          timestamp: timestamp,
          event: event,
          filePath: filePath,
          designerName: designerName
        };
        // console.log("RECORD CHECK", record)
        // buffer.push(record);
        if (buffer.length < MAX_BUFFER_SIZE) {
          // Add message to buffer if buffer size is within limits
          buffer.push(record);
        } else {
          console.error('Buffer full. Dropping message:', message.value?.toString());
        }
      }
      else {
        console.error("Kafka Error");
      }
    },
  });
};

// Run the main function
run().catch(console.error);
maintainConnection();

// Process buffer every minute
setInterval(async () => {
  await processBuffer();
}, 1 * 60 * 1000);
