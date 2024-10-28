import net from "net";
import { readHeader, writeHeader } from "./utils.js";
import { HANDLER_ID, TOTAL_LENGTH_SIZE } from "./constants.js";

const HOST = "localhost";
const PORT = 5252;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log("Client connected to server :)");

  const message = "Hello";
  // 메시지로부터 버퍼 객체를 생성해줘
  const buffer = Buffer.from(message);
  // 클라이언트에서도 헤더를 만들어 붙여서 보내줘야지 -> 인자로 메시지 길이, 핸들러ID를 받는데 핸들러 ID는 일단 10이라 지정
  const header = writeHeader(buffer.length, 11);

  // 헤더랑 메시지를 합쳐야 제대로 된 패킷이 되므로 둘을 합쳐주자
  const packet = Buffer.concat([header, buffer]);
  // 위에서 다 만든 패킷을 서버로 전달
  client.write(packet);
});

client.on("data", (data) => {
  console.log("Data from server: ", data);
  const { length, handlerId } = readHeader(data);
  console.log(`length?: ${length}`);
  console.log(`handlerId?: ${handlerId}`);

  const buffer = Buffer.from(data);

  // 우리가 원하는 데이터는 헤더를 제외한 메시지 부분이므로 헤더만큼을 썰어줘야 한다
  const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID; // 6일것
  const message = buffer.subarray(headerSize); // 0부터 headerSize만큼까지 잘라줘 (0 안써도 ok)

  console.log(`Message from server: ${message}`);
});

client.on("close", () => {
  console.log("Connection is completely closed.");
});

client.on("error", (err) => {
  console.log("Socket error occured!: ", err);
});
