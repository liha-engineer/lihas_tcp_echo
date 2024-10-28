import { HANDLER_ID, TOTAL_LENGTH_SIZE } from "./constants.js";

// 데이터를 받았다면 헤더가 있을테니 그 헤더를 읽어오는 함수를 만들자
export const readHeader = (buffer) => {
  return {
    // 빅엔디안(순방향 읽기), 리틀엔디안(역방향 읽기) 방식 존재. 서버는 보통 빅엔디안 사용
    // offset 0이면 0번째부터 시작하겠다는 뜻
    // 32비트로 읽겠다는 것 -> 8비트(1바이트) * 4개 이므로 딱 4바이트만큼 읽으면 totalLength 나온다
    length: buffer.readUInt32BE(0),
    // 2바이트니까 16비트만큼 읽는다 -> 오프셋은 시작위치니까 totalLength 끝난 위치부터
    handlerId: buffer.readUInt16BE(TOTAL_LENGTH_SIZE),
  };
};

// 데이터를 전달해주려면 내가 헤더도 만들고 버퍼객체로 만들어서 줘야한다
export const writeHeader = (length, handlerId) => {
    const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
    //Buffer.alloc() 이라는 메서드로 버퍼를 만들어준다. 
    // 아무 메시지가 없어도 적어도 헤더는 담겨야 하니 헤더사이즈 만큼
    const buffer = Buffer.alloc(headerSize);
    // 이제 버퍼객체를 작성해서 만들어줄건데, 여기서 length는 메세지의 길이다. 그러므로 헤더 사이즈만큼 더해서 만들어줘야 함
    buffer.writeUInt32BE(length + headerSize, 0);
    // 핸들러ID는 headerSize 쪽에 미리 자리가 마련되어 있으니 TOTAL_LENGTH_SIZE 만큼 지나쳐서 핸들러ID 자리(2바이트)에다 써준다
    buffer.writeUInt16BE(handlerId, TOTAL_LENGTH_SIZE);

    return buffer;
};
