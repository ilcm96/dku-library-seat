export async function onRequest(context) {
  // 직접 접근 방지
  const url = new URL(context.request.url);
  const referer = context.request.headers.get("Referer");

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
  } else if (!referer || new URL(referer).origin !== url.origin) {
    return new Response("FORBIDDEN", { status: 403 });
  }

  // URL로부터 쿼리 파라미터 추출
  const params = url.searchParams;
  const start = params.get("start");
  const end = params.get("end");

  // 파라미터 검증
  if (!validateParams(start, end)) {
    return new Response("BAD_REQUEST", { status: 400 });
  }

  // D1으로부터 데이터 쿼리
  const query = `SELECT * FROM new_crawl WHERE date >= ? AND date <= ? ORDER BY date;`;
  const result = await context.env.DB.prepare(query).bind(start, end).all();

  if (!result.success) {
    return new Response("DB_ERROR", { status: 500 });
  }

  // 데이터 처리
  return new Response(JSON.stringify(processData(result.results)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
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
  const parsedData = {};
  const averages = {};

  // 데이터 파싱 및 평균 계산
  data.forEach((day) => {
    Object.entries(day).forEach(([time, value]) => {
      if (time === "date") return;
      if (value) {
        JSON.parse(value).forEach((room) => {
          const roomName = room.room_name;
          const useRate = parseFloat(room.use_rate);

          if (!parsedData[roomName]) {
            parsedData[roomName] = {};
          }
          if (!parsedData[roomName][time]) {
            parsedData[roomName][time] = [];
          }
          parsedData[roomName][time].push(useRate);
        });
      }
    });
  });

  // 평균 계산
  Object.entries(parsedData).forEach(([room, timeData]) => {
    averages[room] = Object.keys(timeData)
      .sort()
      .map((time) => {
        const avg = timeData[time].reduce((sum, val) => sum + val, 0) / timeData[time].length;
        return Math.round(avg * 10) / 10; // 소수점 첫째자리까지 반올림
      });
  });

  return averages;
}
