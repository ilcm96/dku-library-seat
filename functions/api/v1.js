export async function onRequest(context) {
  return new Response("DEPRECATED", { status: 410, headers: { "Cache-Control": "public, max-age=86400" } });

  // URL으로 부터 쿼리 파라미터 추출
  const url = new URL(context.request.url);
  const params = url.searchParams;
  const start = params.get("start");
  const end = params.get("end");

  // 파라미터 검증
  if (!validateParams(start, end)) {
    return new Response("BAD_REQUEST", { status: 400 });
  }

  // D1으로부터 데이터 쿼리
  const query = `SELECT * FROM crawl WHERE time >= '${start + "-00-00"}' AND time <= '${end + "-23-45"}' ORDER BY time`;
  const result = await context.env.DB.prepare(query).all();
  if (!result.success) {
    return new Response("DB_ERROR", { status: 500 });
  }

  // 데이터 처리
  const avgUseRate = processData(result.results);

  return new Response(JSON.stringify(avgUseRate), { status: 200, headers: { "Content-Type": "application/json" } });
}

function validateParams(start, end) {
  // 쿼리 파라미터가 없으면 에러
  if (!start || !end) {
    return false;
  }

  // 14일 이상의 기간은 허용하지 않음
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (new Date(end) - new Date(start) > 13 * oneDayMs) {
    return false;
  }

  return true;
}

function processData(data) {
  // 결과를 저장할 객체
  const result = {};
  const timeSlots = [];

  // 먼저 모든 시간대를 수집하고 정렬
  data.forEach((item) => {
    const time = item.time.slice(11, 16); // 시간 추출 (HH:MM 형식)
    if (!timeSlots.includes(time)) {
      timeSlots.push(time);
    }
  });
  timeSlots.sort();

  // 각 시간대의 데이터를 처리
  data.forEach((item) => {
    const time = item.time.slice(11, 16); // 시간 추출 (HH:MM 형식)
    const timeIndex = timeSlots.indexOf(time);
    const roomsData = JSON.parse(item.data).root.rooms;

    // 각 열람실의 데이터를 처리
    roomsData.forEach((room) => {
      const roomName = room.room_name;
      const useRate = parseFloat(room.use_rate);

      // 결과 객체에 열람실이 없으면 초기화
      if (!result[roomName]) {
        result[roomName] = new Array(timeSlots.length).fill(null);
      }

      // 해당 시간의 사용률 데이터 추가 또는 업데이트
      if (result[roomName][timeIndex] === null) {
        result[roomName][timeIndex] = useRate;
      } else {
        result[roomName][timeIndex] = (result[roomName][timeIndex] + useRate) / 2;
      }
    });
  });

  // 평균 계산 및 반올림(소수점 1자리까지 남김)
  for (const roomName in result) {
    result[roomName] = result[roomName].map((rate) => (rate === null ? null : Math.round(rate * 10) / 10));
  }

  return result;
}
