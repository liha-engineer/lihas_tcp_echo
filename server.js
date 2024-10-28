import net from "net";
import { readHeader, writeHeader } from "./utils.js";
import { HANDLER_ID, MAX_MESSAGE_LENGTH, TOTAL_LENGTH_SIZE } from "./constants.js";
import handlers from "./handlers/index.js";

const PORT = 5252;
const server = net.createServer((socket) => {
  console.log(
    `Client connected ${socket.remoteAddress} : ${socket.remotePort}`,
  );

  socket.on("data", (data) => {
    // 아래에서 slice(subarray) 써서 헤더 잘라주려면 버퍼객체여야 해서, 일단 데이터를 버퍼객체로 한번 묶어준다
    const buffer = Buffer.from(data);
    // 클라에서 헤더 + 메시지 조립한 패킷이 넘어올테니 여기서 받을 준비
    const { length, handlerId } = readHeader(buffer);
    // 잘 넘어오는지 한번 찍어보기
    console.log(`handlerId?: ${handlerId}`);
    console.log(`length?: ${length}`);

    // 설정해둔 최대 메시지 길이가 있어서 그 수치 넘는지 확인
    if(length > MAX_MESSAGE_LENGTH) {
        console.error(`Error: Message length: ${length}`);
        socket.write(`Error: Message is too long : ${length}`);
        socket.end();
        return;
    }

    const handler = handlers[handlerId];

    if(!handler) {
        console.error(`Error: Handler not found: ${handlerId}`);
        socket.write(`Error: Invalid handler Id! : ${handlerId}`);
        socket.end();
        return;
    }

    // 우리가 원하는 데이터는 헤더를 제외한 메시지 부분이므로 헤더만큼을 썰어줘야 한다
    const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID; // 6일것
    const message = buffer.subarray(headerSize); // 0부터 headerSize만큼까지 잘라줘 (0 안써도 ok)

    console.log(`Message from client: ${message}`)

    // 클라이언트에게 돌려줄 메시지
    const responseMessage = handler(message);
    // 메시지 담을 버퍼 생성
    const responseBuffer = Buffer.from(responseMessage)
    // 버퍼에 붙일 헤더 생성 - 메시지 길이와 handlerId를 인자로 받는데, handlerId는 클라에서 받은 거 그대로 돌려준다
    const header = writeHeader(responseBuffer.length, handlerId);
    // 버퍼와 헤더 만들었으니 붙여서 패킷으로 만들어준다
    const packet = Buffer.concat([header, responseBuffer])
    // 만든 패킷을 클라이언트에게 전달
    socket.write(packet);
  });

  socket.on("end", () => {
    console.log("Disconnected from client");
  });

  socket.on("error", (err) => {
    console.log("Socket error!: ", err);
  });
});

server.listen(PORT, () => {
  console.log(`Echo server listening on port ${PORT}`);
  console.log("Server address: ", server.address());
});
